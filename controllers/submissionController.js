// controllers/submissionController.js
const Submission = require('../models/submissionModel');
const Entry = require('../models/entryModel');
const sendEmail = require('../services/sendEmail');
const User = require('../models/userModel');
const multer = require('multer');
const path = require('path');
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
    
    const fileName = `${submission._id}${student._id}`;
    const storage = multer.diskStorage({
      destination: './uploads/', // Specify your upload directory
      filename: (req, file, cb) => {
        cb(null, fileName + file.originalname); // Keep the original filename
      }
    });
    
    const upload = multer({
      storage,
      fileFilter: (req, file, cb) => {
        // Validate file extensions
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.docx', '.doc'];
        const fileExtension = path.extname(file.originalname).toLowerCase();
    
        if (allowedExtensions.includes(fileExtension)) {
          cb(null, true);
        } else {
          cb(new Error('Invalid file type. Only jpg, jpeg, png, and docx files are allowed.'));
        }
      }
    });
    
    const maxDocxFiles = 1;
    
    upload.array('File', 10)(req, res, async (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'File upload failed' });
      }
    
      const files = req.files;
      console.log("file: " + files.map(file => file.filename));
    
      // Count the number of uploaded docx files
      const docxFiles = files.filter(file => {
        const ext = path.extname(file.originalname).toLowerCase();
        return ext === '.docx' || ext === '.doc';
      });
      
      // Validate docx file count
      if (docxFiles.length > maxDocxFiles) {
        return res.status(400).json({ error: 'Only one word file is allowed.' });   
      }
    
      // Update the submission paths based on the uploaded files
      submission.document_path = files.map(file => file.filename).join(', ');
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
    
    
    

  } catch (error) {
    res.status(500).json({ error: 'Error creating submission' });
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
exports.getSubmissionsById = async (req, res) => {
  try {
    const submissions = await Submission.findById(req.params.id);
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
    console.log(comment_content );
    const currentTime  = Date.now().toString();
    console.log(currentTime);
    const updatedSubmission = await Submission.findByIdAndUpdate(
      req.params.id,
      {
        comment_content,
        comment_at: currentTime 
      },
      { new: true }
    );
    const senderEmail = user.email;
    console.log("Sender: " + senderEmail);
    const recipient = await User.findById(updatedSubmission.student);
    console.log("Recipient: " + recipient);
    const recipientEmail = recipient.email;
    console.log("Recipient Email: " + recipientEmail );
    const title = `Dear ${recipient.username}! You have a new comment on the article you sent us.!`
    await sendEmail.sendEmailNotification(senderEmail,recipientEmail,title,updatedSubmission.comment_content);
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
