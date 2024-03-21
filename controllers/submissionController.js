// controllers/submissionController.js
const Submission = require("../models/submissionModel");
const Entry = require("../models/entryModel");
const User = require("../models/userModel");
const path = require("path");
const Semester = require("../models/semesterModel");
const fs = require("fs").promises;
const mammoth = require("mammoth");
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const rootDir = path.resolve(__dirname, '..');
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);
const emailService = require('../services/sendEmail');

// Create a new submission
exports.createSubmission = async (req, res) => {
  try {
    console.log(req.user._id);
    const student = await User.findById(req.user._id);
    const entry = await Entry.findOne({
      faculty: student.faculty,
      closed: "false",
    });
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
      return res
        .status(400)
        .json({
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
      return res.status(400).json({ error: "Duplicated file name." });
    }
    // Validate docx file count
    if (docxFiles.length != 1) {
      return res
        .status(400)
        .json({ error: "One and only word file is allowed." });
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
    const user = await User.findById(req.user._id);
    const coordinator = await User.findOne({ faculty: user.faculty, role: 'coordinator' });
    res.status(201).json(submission);
    try {
      // Lấy dữ liệu bài viết từ cơ sở dữ liệu
      if (!submission) {
          return res.status(404).json({ message: 'Article not found' });
      }
    const emailSubject = "New submission!!"
    const emailContent = `New submission from student ${user.username}. You have 14 days to make a comment.`
      // Gửi email thông báo về bài viết mới
      await emailService.sendEmailNotification(user.email, user.role, coordinator.email, emailSubject, emailContent);
      
      res.status(200).json({message: "Submission created success!!", message: 'Email sent successfully' });
  } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ message: 'Error sending email' });
  }
  } catch (error) {
    res.status(500).json({ error: "Error creating submission" });
  }
};

exports.getSubmissionsByRole = async (req, res) =>{
  try {
    const user = req.user;
    console.log(user.role);
    if(user.role === "manager"){
      this.getAllSelectedSubmissions(req,res);
    }
    else if(user.role === "coordinator"){
      this.getSubmissionsByFaculty(req,res);
    }
    else if(user.role ==="student" ){
      this.getSubmissionsByUser(req,res);
    }
  } catch (error) {
    res.status(500).json({ error: "Error fetching submissions" });
  }
}
// Get all submissions
exports.getAllSelectedSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ status: "selected" });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: "Error fetching submissions" });
  }
};

exports.getSubmissionsByFaculty = async (req, res) => {
  try {
    const { faculty } = req.user.faculty; // Get faculty ID from query parameter
    const submissions = await Submission.find({ faculty });
    res.json(submissions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error getting submissions" });
  }
};
exports.getSubmissionsByUser = async (req, res) => {
  try {
    const user = req.user; 
    const submissions = await Submission.find({ student: user });
    res.json(submissions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error getting submissions" });
  }
};

exports.getSubmissionsById = async (req, res) => {
  try {
    const submissions = await Submission.findById(req.params.id);
    document_pathArr = submissions.document_path.split(',');
      console.log({document_pathArr});
      const files = [];
      for (const document of document_pathArr) {    
        const filePath = `${rootDir}/uploads/${document}`;
        console.log(filePath);
        const fileBuffer = await fs.readFile(filePath).then((data) => {
          files.push(fileBuffer);
        })
        .catch((error) => {
            console.error("Error reading file:", error);
        });;
               
      };
    res.json({submissions, files});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error getting submissions" });
  }
};

exports.editSubmission = async (req, res) => {
  try {
    console.log(req.user._id);
    const student = await User.findById(req.user._id);
    const entry = await Entry.findOne({
      faculty: student.faculty,
      closed: "false",
    });
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
    const submission = await Submission.findById(req.params.id);
    const fileNames = [];
    // Validate file extensions
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".docx", ".doc"];
    const invalidFiles = uploadedFiles.filter((file) => {
      const extension = path.extname(file.name).toLowerCase();
      return !allowedExtensions.includes(extension);
    });

    if (invalidFiles.length > 0) {
      return res
        .status(400)
        .json({
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
      return res.status(400).json({ error: "Duplicated file name." });
    }
    // Validate docx file count
    if (docxFiles.length != 1) {
      return res
        .status(400)
        .json({ error: "One and only word file is allowed." });
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
    res.json({ message: "Submission edited success!!", errorLog });
  } catch (error) {
    res.status(500).json({ error: "Error creating submission" });
  }
};

// Update a submission
exports.updateSubmission = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res
        .status(400)
        .json({ message: "You dont have title for this submission now" });
    }
    const entry = await Entry.findOne({
      faculty: student.faculty,
      closed: "true",
    });
    const semester = await Semester.findById(entry.semester);
    if (!semester) {
      return res
        .status(400)
        .json({
          message: "We dont have semester for this entry of submission now",
        });
    }
    if (semester.closed) {
      return res.status(400).json({ message: "Semester closed" });
    }
    console.log(req.body.title);
    const updatedSubmission = await Submission.findByIdAndUpdate(
      req.params.id,
      {
        title,
        document_path,
        updated_at: Date.now().toString(),
      },
      { new: true }
    );
    res.json(updatedSubmission);
  } catch (error) {
    res.status(500).json({ error: "Error updating submission" });
  }
};

exports.updateComment = async (req, res) => {
  try {
    console.log(req.user._id);
    const student = await User.findById(req.user._id);
    const entry = await Entry.findOne({
      faculty: student.faculty,
      closed: "true",
    });
    if (!entry) {
      return res
        .status(400)
        .json({
          message: "Now you can edit entire submission instead of only update",
        });
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
    const submission = await Submission.findById(req.params.id);
    const fileNames = [];
    // Validate file extensions
    const allowedExtensions = [".jpg", ".jpeg", ".png"];
    const invalidFiles = uploadedFiles.filter((file) => {
      const extension = path.extname(file.name).toLowerCase();
      return !allowedExtensions.includes(extension);
    });

    if (invalidFiles.length > 0) {
      return res
        .status(400)
        .json({
          error: `Files have invalid extensions. Allowed extensions are: ${allowedExtensions.join(
            ", "
          )}`,
        });
    }
    // Update submission path with all valid filenames (if applicable)
    console.log("Document Path: " + submission.document_path);
    const duplicate = new Set(uploadedFiles.map((item) => item.name));
    if (uploadedFiles.length - duplicate.size > 0) {
      return res.status(400).json({ error: "Duplicated file name." });
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
    const current_path = submission.document_path;
    if (fileNames.length > 0) {
      submission.document_path = current_path + ", " + fileNames.join(",");
    } else {
      submission.document_path = current_path + ", " + fileNames.toString();
    }
    await submission.save();
    res.json({ message: "Submission uploaded success!!", errorLog });
  } catch (error) {
    res.status(500).json({ error: "Error creating submission" });
  }
};

exports.readDocxFile = async (req, res) => {
  // const submission = await Submission.findById(req.query.id);
  // const docName = submission.document_path.filter((path) => {path.split(".")[path.split(".").length-1] == 'docx' || 'doc'});
  const docPath = path.join(__dirname, "..", "uploads", req.query.name); // Assuming document path is stored
  const content = fs.readFileSync(docPath, "binary");
  convertDocxToHtml(docPath).then((html) => {
    if (html) {
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } else {
      res.status(500).json({ error: "Error reading submission" });
    }
  });
};
async function convertDocxToHtml(filePath) {
  try {
    const result = await mammoth.convertToHtml({ path: filePath });
    const sanitizedHtml = DOMPurify.sanitize(result.value);
    console.log("HTML: " + result.value);
    console.log("Fixed: " + sanitizedHtml);
    return sanitizedHtml; // HTML content
  } catch (error) {
    console.error("Error converting docx to html:", error);
    return null; // Handle error appropriately
  }
}

// Delete a submission
exports.deleteSubmission = async (req, res) => {
  try {
    await Submission.findByIdAndDelete(req.params.id);
    res.json({ message: "Submission deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting submission" });
  }
};

