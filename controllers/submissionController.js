// controllers/submissionController.js
const Submission = require('../models/submissionModel');
const Entry = require('../models/entryModel');

// Create a new submission
exports.createSubmission = async (req, res) => {
  try {
    const student = req.user;
    console.log(student);
    const { title, document_path} = req.body;
    const entry = await Entry.findOne({ faculty: student.faculty, closed: 'false' });
      if (!entry) {
        return res.status(400).json({ message: 'We dont have entry for this faculty now' });
      }
    console.log(student);
    const submission = new Submission(
      {
        title, 
        document_path, 
        entry: entry._id, 
        student: student._id
      });
    await submission.save();
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
        updated_at: Date.now
      },
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
