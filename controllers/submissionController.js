// controllers/submissionController.js
const Submission = require('../models/Submission');
const emailService = require('../services/sendEmail');
const User = require('../models/userModel');

// Create a new submission
exports.createSubmission = async (req, res) => {
  try {
    const submission = await Submission.create(req.body);
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
      
      res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ message: 'Error sending email' });
  }
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

// Update a submission
exports.updateSubmission = async (req, res) => {
  try {
    const updatedSubmission = await Submission.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedSubmission);
  } catch (error) {
    res.status(500).json({ error: 'Error updating submission' });
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

