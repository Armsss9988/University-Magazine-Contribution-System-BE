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
const { getEntryById } = require("./entryController");

// Create a new submission
exports.createSubmission = async (req, res) => {
  try {
    console.log(req.user.id);
    const student = await User.findById(req.user.id);
    console.log(req.params.entryId)
    const entry = await Entry.findById(req.params.entryId);
    console.log("test: ",entry)
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
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".docx", ".doc"];
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
      return ext === ".docx" || ext === ".doc";
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
    const coordinator = await User.findOne({
      faculty: user.faculty,
      role: "coordinator",
    });
    try {
      if (!submission) {
        return res.status(404).json({ message: "Article not found" });
      }
      const emailSubject = "New submission!!";
      const emailContent = `New submission from student ${user.username}. You have 14 days to make a comment.`;
      // Gửi email thông báo về bài viết mới
      await emailService.sendEmailNotification(
        user.email,
        user.role,
        coordinator.email,
        emailSubject,
        emailContent
      );

      res.status(200).json({
        message: "Submission created success!!",
      });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ message: "Error sending email" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error creating submission" });
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
    res.status(500).json({ message: "Error fetching submissions" });
  }
};
// Get all submissions
exports.getAllSelectedSubmissions = async (req, res) => {
  try {
    const data = [];
    const submissions = await Submission.find({ status: "selected" });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching submissions" });
  }
};


exports.getSubmissionsByFaculty = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { faculty } = user.faculty; // Get faculty ID from query parameter
    const submissions = await Submission.find({ faculty });
    res.json(submissions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error getting submissions" });
  }
};
exports.getSubmissionsByUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const submissions = await Submission.find({ student: user });
    res.json(submissions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error getting submissions" });
  }
};

exports.getSubmissionsById = async (req, res) => {
  try {
    const id = req.params.id;
    const submission = await Submission.findById(id);
    const documentPaths = submission.document_path.split(",");

    const files = await Promise.all(
      documentPaths.map(async (documentPath) => {
        const filePath = `${rootDir}/uploads/${documentPath}`;
        try {
          const fileBuffer = await fs.readFile(filePath);
          const stats = await fs.stat(filePath);
          const fileType = getFileType(filePath); // Function to determine file type
          return {
            name: documentPath.substring(id.length * 2),
            type: fileType,
            data: Buffer.from(fileBuffer),
            size: stats.size, // Base64 encode file buffer
          };
        } catch (error) {
          console.error(`Error reading file: ${filePath}`, error);
          // Optionally log specific error details or omit the file from response
          return null;
        }
      })
    );

    const filteredFiles = files.filter((file) => file !== null); // Remove null entries

    res.json({
      submission,
      files: filteredFiles,
      message: "Get item successfully!",
    });
  } catch (err) {
    console.error("Error getting submissions:", err);
    res.status(500).json({ message: "Error getting submissions" });
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
    // Add more mime types as needed
  };
  return mimeTypes[extension];
}

exports.editSubmission = async (req, res) => {
  try {
    console.log("File: " + req.files.File);
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
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".docx", ".doc"];
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
      return ext === ".docx" || ext === ".doc";
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
    res.json({ message: "Submission edited success!!", errorLog });
  } catch (error) {
    res.status(500).json({ message: "Error creating submission" });
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
    res.json({ message: "Submission Update successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error updating submission" });
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
    const currentTime = getLocalTime.getDateNow();
    console.log(currentTime);
    const updatedSubmission = await Submission.findByIdAndUpdate(
      req.params.id,
      {
        status: status,
        comment_content: comment_content,
        comment_at: currentTime,
      },
      { new: true }
    );
    const senderEmail = user.email;
    console.log("Sender: " + senderEmail);
    const recipient = await User.findById(updatedSubmission.student);
    console.log("Recipient: " + recipient);
    const recipientEmail = recipient.email;
    const role = user.role;
    console.log("Recipient Email: " + recipientEmail);
    const title = `Dear ${recipient.username}! You have a new comment on the article you sent us.!`;
    await sendEmail.sendEmailNotification(
      senderEmail,
      role,
      recipientEmail,
      title,
      comment_content
    );
    res.json({ message: "Comment successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error comment submission" });
  }
};

// Delete a submission
exports.deleteSubmission = async (req, res) => {
  try {
    await Submission.findByIdAndDelete(req.params.id);
    res.json({ message: "Submission deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting submission" });
  }
};

exports.downloadSelectedSubmissions = async (req, res) => {
  try {
    // Find selected contributions (replace with your actual filtering)
    const submissions = await Submission.find({ status: "selected" });

    // Check if any contributions found
    if (submissions.length === 0) {
      return res.status(404).send("No contributions found for selected");
    }

    // Create a ZIP archive
    const archive = archiver("zip");

    // Set content disposition for download (optional)
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=contributions.zip"
    );
    res.setHeader("Content-Type", "application/zip");

    // Pipe the archive to the response stream
    archive.pipe(res);
    for (const contribution of submissions) {
      // Replace with actual file path generation
      document_pathArr = contribution.document_path.split(", ");
      console.log({ document_pathArr });
      for (const document of document_pathArr) {
        const filePath = `${rootDir}/uploads/${document}`;
        console.log(filePath);
        try {
          const fileBuffer = await fs.readFile(filePath);
          await archive.file(filePath, { name: document });
        } catch (error) {
          console.error(`Error reading file: ${filePath}`, error);
          // Handle the error gracefully, e.g., log and continue
        }
      }
    }

    // Finalize the archive
    await archive.finalize();
  } catch (error) {
    console.error(error);
    res.status(500).send("Error downloading contributions");
  }
};

exports.downloadCheckedSubmissions = async (req, res) => {
  try {
    // Create a ZIP archive
    const archive = archiver("zip");

    // Set content disposition for download (optional)
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=contributions.zip"
    );
    res.setHeader("Content-Type", "application/zip");

    // Pipe the archive to the response stream
    archive.pipe(res);
    const { submissionIds } = req.body;
    for (const submissionId of submissionIds) {
      const submission = await Submission.findById(submissionId);
      document_pathArr = submission.document_path.split(", ");
      console.log({ document_pathArr });
      for (const document of document_pathArr) {
        const filePath = `${rootDir}/uploads/${document}`;
        console.log(filePath);
        try {
          const fileBuffer = await fs.readFile(filePath);
          await archive.file(filePath, { name: document });
        } catch (error) {
          console.error(`Error reading file: ${filePath}`, error);
          // Handle the error gracefully, e.g., log and continue
        }
      }
    }
    // Finalize the archive
    await archive.finalize();
  } catch (error) {
    console.error(error);
    res.status(500).send("Error downloading contributions");
  }
};
