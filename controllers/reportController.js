// controllers/reportController.js
const Report = require('../models/Report');

// Create a new report
exports.createReport = async (req, res) => {
  try {
    const report = new Report({ type: req.body.type });
    await report.save();
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ error: 'Error creating report' });
  }
};

// Delete a report by _id
exports.deleteReport = async (req, res) => {
    try {
      const reportId = req.params.id; // Assuming you pass the report ID as a route parameter
      const result = await Report.deleteOne({ _id: reportId });
      if (result.deletedCount === 1) {
        res.status(200).json({ message: 'Report deleted successfully' });
      } else {
        res.status(404).json({ error: 'Report not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error deleting report' });
    }
  };

// Update a report by _id
exports.updateReport = async (req, res) => {
    try {
      const reportId = req.params.id; // Assuming you pass the report ID as a route parameter
      const { content } = req.body; // Assuming you send the updated content in the request body
      const result = await Report.updateOne({ _id: reportId }, { $set: { content } });
      if (result.modifiedCount === 1) {
        res.status(200).json({ message: 'Report updated successfully' });
      } else {
        res.status(404).json({ error: 'Report not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error updating report' });
    }
  };

  // Get all reports
exports.getAllReports = async (req, res) => {
    try {
      const reports = await Report.find(); // Retrieve all reports
      res.status(200).json(reports); // Send the reports as a JSON response
    } catch (error) {
      res.status(500).json({ error: 'Error fetching reports' });
    }
  };