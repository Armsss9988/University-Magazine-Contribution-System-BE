// controllers/submissionController.js
const Submission = require('../models/Submission');

// Create a new submission
exports.createSubmission = async (req, res) => {
  try {
    const submission = await Submission.create(req.body);
    res.status(201).json(submission);
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
