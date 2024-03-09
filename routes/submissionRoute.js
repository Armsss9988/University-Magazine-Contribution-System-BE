// routes/submissionRoutes.js
const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const authorization = require('../services/authorization');
router.use(authorization.verifyToken);

// Create a new submission
router.post('/', submissionController.createSubmission);

// Get all submissions
router.get('/', submissionController.getAllSubmissions);

// Update a submission
router.put('/:id', submissionController.updateSubmission);

// Delete a submission
router.delete('/:id', submissionController.deleteSubmission);

module.exports = router;
