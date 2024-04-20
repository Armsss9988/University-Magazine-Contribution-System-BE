// controllers/submissionController.js
const Submission = require("../models/submissionModel");
const Entry = require("../models/entryModel");
const User = require("../models/userModel");
const path = require("path");
const Semester = require("../models/semesterModel");
const fs = require("fs").promises;
const rootDir = path.resolve(__dirname, "..");
const emailService = require("../services/sendEmail");
const getLocalTime = require("../services/getLocalTime");
const sendEmail = require("../services/sendEmail");
const archiver = require("archiver");
const docxtemplater = require("docxtemplater");
var AdmZip = require("adm-zip");

// Create a new submission
exports.createSubmission = async (req, res) => {
  try {
    console.log(req.user.id);
    const student = await User.findById(req.user.id);
    console.log(req.params.entryId);
    const entry = await Entry.findById(req.params.entryId);
    console.log("test: ", entry);
    if (!entry) {
      return res
        .status(400)
        .json({ message: "We dont have entry for this faculty now" });
    }
    const { title } = req.body;
    if (!title) {
      return res
        .status(400)
        .json({ message: "You dont have title for this submission now" });
    }
    console.log(req.body.title);
    if (!req.files || !req.files.File) {
      return res.status(400).json({ message: "Please upload a file." });
    }
    const Files = req.files.File;
    if (!Array.isArray(Files)) {
      // Single file uploaded

      var uploadedFiles = [Files];
      console.log("Upload File: " + uploadedFiles);
    } else {
      var uploadedFiles = Files;
      console.log("Upload File: " + uploadedFiles);
    }
    const submission = new Submission({
      document_path: "",
      entry: entry,
      student: student,
      title: title,
    });
    const fileNames = [];
    // Validate file extensions
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".docx", ".doc", ".pdf"];
    const invalidFiles = uploadedFiles.filter((file) => {
      const extension = path.extname(file.name).toLowerCase();
      return !allowedExtensions.includes(extension);
    });

    if (invalidFiles.length > 0) {
      return res.status(400).json({
        error: `Files have invalid extensions. Allowed extensions are: ${allowedExtensions.join(
          ", "
        )}`,
      });
    }
    // Update submission path with all valid filenames (if applicable)
    console.log("Document Path: " + submission.document_path);
    // Count the number of uploaded docx files
    const docxFiles = uploadedFiles.filter((file) => {
      const ext = path.extname(file.name).toLowerCase();
      return ext === ".docx" || ext === ".doc" || ext === ".pdf";
    });
    console.log("Word file: " + docxFiles);
    const duplicate = new Set(uploadedFiles.map((item) => item.name));
    if (uploadedFiles.length - duplicate.size > 0) {
      return res.status(400).json({ message: "Duplicated file name." });
    }
    // Validate docx file count
    if (docxFiles.length != 1) {
      return res
        .status(400)
        .json({ message: "One and only word file is allowed." });
    }
    const errorLog = [];
    for (const uploadedFile of uploadedFiles) {
      const fileName = `${submission._id}${student._id}${uploadedFile.name}`;
      // Validate file extensions and handle each file
      const filePath = path.join(__dirname, "..", "./uploads/", fileName);
      try {
        // Use mv with await to wait for the move to finish
        await uploadedFile.mv(filePath);
        fileNames.push(fileName);
        console.log("File uploaded successfully!");
        // You can perform other actions here after successful move (e.g., database updates)
      } catch (err) {
        errorLog.push(`${uploadedFile.name} - ${err}`);
        // Handle errors during move process (e.g., logging or notifying admins)
      }
    }
    if (fileNames.length > 0) {
      submission.document_path = fileNames.join(",");
    } else {
      submission.document_path = fileNames.toString();
    }
    await submission.save();
    const user = await User.findById(req.user.id);
    
    try {
      if (!submission) {
        return res.status(404).json({ message: "Article not found" });
      }
      const coordinators = await User.find({
        faculty: user.faculty,
        role: "coordinator",
      });
      const emailSubject = "New submission!!";
      const emailContent = `New submission from student ${user.username}. You have 14 days to make a comment.`;
      if (coordinators != null && coordinators.length > 0) {
        coordinators.forEach(async (coordinator) => {
          try {
            await emailService.sendEmailNotification(
              user.email,
              user.username,
              user.role,
              coordinator.email,
              coordinator.username,
              emailSubject,
              emailContent
            );
          } catch (err) {
            return res.status(404).json({ message: err });
          }
        });
      }

      return res.status(200).json({
        message: "Submission created success!!",
      });
    } catch (error) {
      console.error("Error sending email:", error);
      return res.status(500).json({ message: "Error sending email" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error creating submission" });
  }
};

exports.getSubmissionsByRole = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    console.log(user.role);
    if (user.role === "manager") {
      this.getAllSelectedSubmissions(req, res);
    } else if (user.role === "coordinator") {
      this.getSubmissionsByFaculty(req, res);
    } else if (user.role === "student") {
      this.getSubmissionsByUser(req, res);
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching submissions" });
  }
};
// Get all submissions
exports.getAllSelectedSubmissions = async (req, res) => {
  try {
    const data = [];
    const submissions = await Submission.find({ status: "selected" })
      .populate({
        path: "entry",
        populate: {
          path: "semester faculty",
        },
      })
      .populate("student");
    return res.json(submissions);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching submissions" });
  }
};

exports.getSubmissionsByFaculty = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("faculty");
    const { faculty } = user;
    console.log("coor faculty: " + faculty.name);

    const submissions = await Submission.find()
      .populate({
        path: "entry",
        populate: {
          path: "semester faculty",
        },
      })
      .populate("student");
    let sub = [];
    submissions.forEach((submission) => {
      if (faculty._id.equals(submission.entry?.faculty?._id || "")) {
        console.log(submission);
        sub.push(submission);
      }
    });
    return res.json(sub);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error getting submissions" });
  }
};
exports.getSubmissionsByUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const submissions = await Submission.find({ student: user })
      .populate({
        path: "entry",
        populate: {
          path: "semester faculty",
        },
      })
      .populate("student");
    return res.json(submissions);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error getting submissions" });
  }
};

exports.getSubmissionsById = async (req, res) => {
  console.log("Get submission by faculty");
  try {
    const id = req.params.id;
    const submission = await Submission.findById(id)
      .populate({
        path: "entry",
        populate: {
          path: "semester faculty",
        },
      })
      .populate("student");
    const documentPaths = submission.document_path.split(",");

    const files = await Promise.all(
      documentPaths.map(async (documentPath) => {
        const filePath = `${rootDir}/uploads/${documentPath}`;
        try {
          const fileBuffer = await fs.readFile(filePath);
          const stats = await fs.stat(filePath);
          const fileType = getFileType(filePath);
          return {
            name: documentPath.substring(id.length * 2),
            type: fileType,
            data: Buffer.from(fileBuffer),
            size: stats.size,
          };
        } catch (error) {
          console.error(`Error reading file: ${filePath}`, error);
          return null;
        }
      })
    );

    const filteredFiles = files.filter((file) => file !== null);

    return res.json({
      submission,
      files: filteredFiles,
      message: "Get item successfully!",
    });
  } catch (err) {
    console.error("Error getting submissions:", err);
    return res.status(500).json({ message: "Error getting submissions" });
  }
};
function getFileType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".docx":
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".doc": "application/msword",
    ".pdf": "application/pdf"
  };
  return mimeTypes[extension];
}

exports.editSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    const student = await User.findById(submission.student);
    const entry = await Entry.findById(submission.entry);
    if (!student) {
      return res.status(400).json({ message: "student not found" });
    }
    if (!entry) {
      return res
        .status(400)
        .json({ message: "We dont have entry for this faculty now" });
    }
    if (entry.closed) {
      return res
        .status(400)
        .json({ message: "Entry closed, you cant edit submission anymore" });
    }
    const { title } = req.body;
    if (!title) {
      return res
        .status(400)
        .json({ message: "You dont have title for this submission now" });
    }
    console.log(req.body.title);
    if (!req.files || !req.files.File) {
      return res.status(400).json({ message: "Please upload a file." });
    }
    const Files = req.files.File;
    if (!Array.isArray(Files)) {
      // Single file uploaded

      var uploadedFiles = [Files];
      console.log("Upload File: " + uploadedFiles.map((file) => file.name));
    } else {
      var uploadedFiles = Files;
      console.log("Upload File: " + uploadedFiles.map((file) => file.name));
    }

    // Validate file extensions
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".docx", ".doc", ".pdf"];
    const invalidFiles = uploadedFiles.filter((file) => {
      const extension = path.extname(file.name).toLowerCase();
      return !allowedExtensions.includes(extension);
    });

    if (invalidFiles.length > 0) {
      return res.status(400).json({
        message: `Files have invalid extensions. Allowed extensions are: ${allowedExtensions.join(
          ", "
        )}`,
      });
    }
    // Update submission path with all valid filenames (if applicable)
    console.log("Document Path: " + submission.document_path);
    // Count the number of uploaded docx files
    const docxFiles = uploadedFiles.filter((file) => {
      const ext = path.extname(file.name).toLowerCase();
      return ext === ".docx" || ext === ".doc" || ext === ".pdf";
    });
    console.log("Word file: " + docxFiles);
    const duplicate = new Set(uploadedFiles.map((item) => item.name));
    if (uploadedFiles.length - duplicate.size > 0) {
      return res.status(400).json({ message: "Duplicated file name." });
    }
    // Validate docx file count
    if (docxFiles.length != 1) {
      return res
        .status(400)
        .json({ message: "One and only word file is allowed." });
    }
    const errorLog = [];
    const fileNames = [];
    for (const uploadedFile of uploadedFiles) {
      console.log("File: " + uploadedFile.name);
      const fileName = `${submission._id}${student._id}${uploadedFile.name}`;
      // Validate file extensions and handle each file
      const filePath = path.join(__dirname, "..", "./uploads/", fileName);
      try {
        // Use mv with await to wait for the move to finish
        await uploadedFile.mv(filePath);
        fileNames.push(fileName);
        console.log("File uploaded successfully!");
        // You can perform other actions here after successful move (e.g., database updates)
      } catch (err) {
        errorLog.push(`${uploadedFile.name} - ${err}`);
        // Handle errors during move process (e.g., logging or notifying admins)
      }
    }
    if (fileNames.length < 1) {
      submission.document_path = "";
    } else if (fileNames.length > 1) {
      submission.document_path = fileNames.join(",");
    } else {
      submission.document_path = fileNames.toString();
    }
    console.log("last path: " + submission.document_path);
    submission.title = title;
    submission.updated_at = getLocalTime.getDateNow();
    await submission.save();
    return res.json({ message: "Submission edited success!!", errorLog });
  } catch (error) {
    return res.status(500).json({ message: "Error edit submission" });
  }
};

// Update a submission
exports.updateSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    const student = await User.findById(submission.student);
    const { title } = req.body;
    if (!title) {
      return res
        .status(400)
        .json({ message: "You dont have title for this submission now" });
    }
    const entry = await Entry.findById(submission.entry);
    if (!entry.closed) {
      return res.status(400).json({
        message: "Now you can edit entire submission instead of only update",
      });
    }
    const semester = await Semester.findById(entry.semester);
    if (!semester) {
      return res.status(400).json({
        message: "We dont have semester for this entry of submission now",
      });
    }
    if (semester.closed) {
      return res.status(400).json({ message: "Semester closed" });
    }
    if (!req.files || !req.files.File) {
      return res.status(400).json({ message: "Please upload a file." });
    }
    const Files = req.files.File;
    if (!Array.isArray(Files)) {
      // Single file uploaded

      var uploadedFiles = [Files];
      console.log("Upload File: " + uploadedFiles);
    } else {
      var uploadedFiles = Files;
      console.log("Upload File: " + uploadedFiles);
    }

    const fileNames = [];
    // Validate file extensions
    const allowedExtensions = [".jpg", ".jpeg", ".png"];
    const invalidFiles = uploadedFiles.filter((file) => {
      const extension = path.extname(file.name).toLowerCase();
      return !allowedExtensions.includes(extension);
    });

    if (invalidFiles.length > 0) {
      return res.status(400).json({
        message: `Files have invalid extensions. Allowed extensions are: ${allowedExtensions.join(
          ", "
        )}`,
      });
    }
    // Update submission path with all valid filenames (if applicable)
    console.log("Document Path: " + submission.document_path);
    const duplicate = new Set(uploadedFiles.map((item) => item.name));
    if (uploadedFiles.length - duplicate.size > 0) {
      return res.status(400).json({ message: "Duplicated file name." });
    }

    const errorLog = [];
    for (const uploadedFile of uploadedFiles) {
      const fileName = `${submission._id}${student._id}${uploadedFile.name}`;
      // Validate file extensions and handle each file
      const filePath = path.join(__dirname, "..", "./uploads/", fileName);
      try {
        await uploadedFile.mv(filePath);
        fileNames.push(fileName);
        console.log("File uploaded successfully!");
      } catch (err) {
        errorLog.push(`${uploadedFile.name} - ${err}`);
      }
    }
    const current_path = submission.document_path;
    if (fileNames.length > 0) {
      if (fileNames.length > 1) {
        submission.document_path = current_path + "," + fileNames.join(",");
      } else {
        submission.document_path = current_path + "," + fileNames.toString();
      }
    }
    submission.title = title;
    submission.updated_at = getLocalTime.getDateNow();
    submission.save();
    return res.json({ message: "Submission Update successfully!" });
  } catch (error) {
    return res.status(500).json({ message: "Error updating submission" });
  }
};

exports.updateComment = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { comment_content, status } = req.body;
    console.log(comment_content);
    console.log(status);
    if (!comment_content || !status) {
      return res.status(400).json({ message: "Missing input" });
    }
    try {
    } catch (err) {}
    const currentTime = getLocalTime.getDateNow();
    try {
      const updatedSubmission = await Submission.findByIdAndUpdate(
        req.params.id,
        {
          status: status,
          comment_content: comment_content,
          comment_at: currentTime,
        },
        { new: true }
      );
    } catch (err) {
      return res.status(400).json({ message: `Invalid input` });
    }

    try {

      const recipient = await User.findById(updatedSubmission.student._id);
      if (recipient != null) {
        const title = `Dear ${recipient?.username}! You have a new comment on the article you sent us.!`;
        const senderEmail = user.email;
        const role = user.role;
        await sendEmail.sendEmailNotification(
          senderEmail,
          user.username,
          role,
          recipient?.email,
          recipient?.username,
          title,
          comment_content
        );
      }
    } catch (err) {
      return res.status(500).json({ message: "Error sending email" });
    }

    return res.json({ message: "Comment successfully!" });
  } catch (error) {
    return res.status(500).json({ message: "Error comment submission" });
  }
};

// Delete a submission
exports.deleteSubmission = async (req, res) => {
  try {
    await Submission.findByIdAndDelete(req.params.id);
    return res.json({ message: "Submission deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting submission" });
  }
};

exports.downloadSelectedSubmissions = async (req, res) => {
  try {
    // Find selected contributions
    const submissions = await Submission.find({ status: "selected" });

    // Check if any contributions found
    if (submissions.length === 0) {
      return res.status(404).send("No contributions found for selected");
    }

    // Create a ZIP archive
    var zip = new AdmZip();

    // Set content disposition for download
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=contributions.zip"
    );
    res.setHeader("Content-Type", "application/zip");

    for (const contribution of submissions) {
      const submissionFolder = path.join(rootDir, contribution._id.toString());
      try {
        await fs.mkdir(submissionFolder, { recursive: true });
      } catch (error) {
        console.error(`Error creating folder: ${submissionFolder}`, error);
        continue;
      }

      document_pathArr = contribution.document_path.split(",");
      for (const document of document_pathArr) {
        const filePath = `${rootDir}/uploads/${document}`;
        const targetFilePath = path.join(submissionFolder, document);

        try {
          await fs.access(filePath, fs.constants.F_OK | fs.constants.R_OK);
          await fs.copyFile(filePath, targetFilePath);
        } catch (error) {
          console.error(`Error copying file: ${filePath}`, error);
        }
      }
      zip.addLocalFolder(submissionFolder, path.basename(submissionFolder));
      try {
        await fs.rm(submissionFolder, { recursive: true });
      } catch (error) {
        console.error(`Error deleting folder: ${submissionFolder}`, error);
        // Handle the error gracefully (e.g., log, skip deletion)
      }
    }

    var zipContent = zip.toBuffer();
    res.end(zipContent);
  } catch (error) {
    console.error(error);
  }
};

exports.downloadCheckedSubmissions = async (req, res) => {
  try {
    console.log(req.body.submissionIds);
    const { submissionIds } = req.body;

    if (submissionIds.length === 0) {
      return res.status(404).send("No contributions found for selected");
    }
    if (!Array.isArray(submissionIds)) {
      // Single file uploaded

      var submissionIdss = [submissionIds];
    } else {
      var submissionIdss = submissionIds;
    }
    var zip = new AdmZip();
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=contributions.zip"
    );
    res.setHeader("Content-Type", "application/zip");

    for (const submissionId of submissionIdss) {
      const submission = await Submission.findById(submissionId);
      const submissionFolder = path.join(rootDir, submission._id.toString());
      try {
        await fs.mkdir(submissionFolder, { recursive: true });
      } catch (error) {
        console.error(`Error creating folder: ${submissionFolder}`, error);
        continue;
      }

      document_pathArr = submission.document_path.split(",");
      for (const document of document_pathArr) {
        const filePath = `${rootDir}/uploads/${document}`;
        const targetFilePath = path.join(submissionFolder, document);

        try {
          await fs.access(filePath, fs.constants.F_OK | fs.constants.R_OK);
          await fs.copyFile(filePath, targetFilePath);
        } catch (error) {
          console.error(`Error copying file: ${filePath}`, error);
        }
      }
      zip.addLocalFolder(submissionFolder, path.basename(submissionFolder));
      try {
        await fs.rm(submissionFolder, { recursive: true });
      } catch (error) {
        console.error(`Error deleting folder: ${submissionFolder}`, error);
        // Handle the error gracefully (e.g., log, skip deletion)
      }
    }

    var zipContent = zip.toBuffer();
    res.end(zipContent);
  } catch (error) {
    console.error(error);
  }
};

exports.dowloadSubmissionById = async (req, res) => {
  try {
    console.log(req.params.id);
    const { id } = req.params;

    if (id.length === 0) {
      return res.status(404).send("Id not found ");
    }

    var zip = new AdmZip();
    const submission = await Submission.findById(id);
    document_pathArr = submission.document_path.split(",");
    for (const document of document_pathArr) {
      const filePath = `${rootDir}/uploads/${document}`;

      try {
        await fs.access(filePath, fs.constants.F_OK | fs.constants.R_OK);
      } catch (error) {
        console.error(`Error copying file: ${filePath}`, error);
        continue;
      }
      zip.addLocalFile(filePath);
    }
    var zipContent = zip.toBuffer();
    res.end(zipContent);
  } catch (error) {
    console.error(error);
  }
};
