// controllers/submissionController.js
const Submission = require('../models/Submission');
const emailService = require('../services/sendEmail');

// Create a new submission
exports.createSubmission = async (req, res) => {
  try {
    const submission = await Submission.create(req.body);
    res.status(201).json(submission);
    try {
      // Lấy dữ liệu bài viết từ cơ sở dữ liệu
      if (!submission) {
          return res.status(404).json({ message: 'Article not found' });
      }

      // Gửi email thông báo về bài viết mới
      await emailService.sendNewArticleEmail(submission.title, submission.content, req.body.recipientEmail);
      
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

