const Submission = require('../models/submissionModel');
const Entry = require('../models/entryModel');
const sendEmail = require('../services/sendEmail');
const User = require('../models/userModel');
const fileUpload = require('express-fileupload');
const path = require('path');

// Enable files upload
const app = require('express')();
app.use(fileUpload({
    createParentPath: true,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for file size
}));

// Create a new submission
exports.createSubmission = async (req, res) => {
    try {
        console.log(req.user._id);
        const student = await User.findById(req.user._id);
        const entry = await Entry.findOne({ faculty: student.faculty, closed: 'false' });
        if (!entry) {
            return res.status(400).json({ message: 'We dont have entry for this faculty now' });
        }
        console.log(student);

        const submission = new Submission({
            document_path: "hi",
            entry: entry,
            student: student,
            title: "hi"
        });

        if (!req.files) {
          console.log("No files uploaded:", req.files);
            return res.status(400).send('No files were uploaded.');
        }

        // The name of the input field (i.e. "File") is used to retrieve the uploaded file
        let uploadedFile = req.files.File;

        // Use the mv() method to place the file on the server
        const fileName = `${submission._id}${student._id}${path.extname(uploadedFile.name).toLowerCase()}`;
        const uploadPath = path.join(__dirname, '../uploads/', fileName);

        // Validate file type
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.docx'];
        if (!allowedExtensions.includes(path.extname(uploadedFile.name).toLowerCase())) {
            return res.status(400).send('Invalid file type. Only jpg, jpeg, png, and docx files are allowed.');
        }

        // Use the mv() method to place the file in the upload directory (i.e. "uploads")
        uploadedFile.mv(uploadPath, async (err) => {
            if (err) {
                return res.status(500).send(err);
            }

            // Update the submission paths based on the uploaded file
            submission.document_path = fileName;
            submission.title = req.body.title;

            try {
                console.log(submission);
                await submission.save();
                res.status(201).json(submission);
            } catch (saveError) {
                console.error(saveError);
                res.status(500).json({ error: 'Submission save failed' });
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



// Get all submissions
exports.getAllSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find();
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching submissions' });
  }
};
exports.getSubmissionsByFaculty = async (req, res) => {
  try {
    const { faculty } = req.user.faculty; // Get faculty ID from query parameter
    const submissions = await Submission.find({faculty}); 
    res.json(submissions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error getting submissions' });
  }
};

// Update a submission
exports.updateSubmission = async (req, res) => {
  try {
    const { title, document_path} = req.body;
    const updatedSubmission = await Submission.findByIdAndUpdate(
      req.params.id,
      {
        title,
        document_path, 
        updated_at: Date.now().toString() 
      },
      { new: true }
    );
    res.json(updatedSubmission);
  } catch (error) {
    res.status(500).json({ error: 'Error updating submission' });
  }
};
exports.updateComment = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { comment_content } = req.body;
    console.log(comment_content);
    const currentTime = Date.now();

    // Get the submission from the database
    const submission = await Submission.findById(req.params.id);

    // Check if the submission is older than 14 days
    const submissionDate = new Date(submission.createdAt);
    const differenceInDays = Math.floor((currentTime - submissionDate) / (1000 * 60 * 60 * 24));

    if (differenceInDays > 14) {
      return res.status(400).json({ error: 'A comment can only be made within 14 days of submission.' });
    }

    const updatedSubmission = await Submission.findByIdAndUpdate(
      req.params.id,
      {
        comment_content,
        comment_at: currentTime.toString()
      },
      { new: true }
    );

    const senderEmail = user.email;
    console.log("Sender: " + senderEmail);
    const recipient = await User.findById(updatedSubmission.student);
    console.log("Recipient: " + recipient);
    const recipientEmail = recipient.email;
    console.log("Recipient Email: " + recipientEmail);
    const title = `Dear ${recipient.username}! You have a new comment on the article you sent us.!`
    await sendEmail.sendEmailNotification(senderEmail, recipientEmail, title, updatedSubmission.comment_content);
    res.json(updatedSubmission);
  } catch (error) {
    res.status(500).json({ error: 'Error comment submission' });
  }
};


// Delete a submission
exports.deleteSubmission = async (req, res) => {
  try {
    await Submission.findByIdAndDelete(req.params.id);
    res.json({ message: 'Submission deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting submission' });
  }
};



exports.getSubmissionById = async function(id) {
  try {
    const submission = await Submission.findById(id);
    return submission;
  } catch (error) {
    throw error;
  }
}