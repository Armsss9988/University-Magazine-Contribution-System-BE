// routes/submissionRoutes.js
const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const authorization = require('../services/authorization');
const submissionMiddleware = require('../services/submissionAuth');
router.use(authorization.verifyToken);

// Create a new submission
router.post('/',authorization.authorizeRole(['student']), submissionController.createSubmission);

// Get submissions
router.get('/list/all',authorization.authorizeRole(['manager']), submissionController.getAllSubmissions);
router.get('/list/faculty',authorization.authorizeRole(['coordinator']), submissionController.getSubmissionsByFaculty);

// Update a submission
router.put('/coordinator/:id',authorization.authorizeRole(['coordinator']),submissionMiddleware.checkSubmissionFaculty, submissionController.updateSubmission);
router.put('/student/:id',authorization.authorizeRole(['student']),submissionMiddleware.checkSubmissionUser, submissionController.updateSubmission);
// Update a comment for submission
router.put('/coordinator/comment/:id',authorization.authorizeRole(['coordinator']),submissionMiddleware.checkSubmissionFaculty, submissionController.updateComment);
// Delete a submission
router.delete('/:id',authorization.authorizeRole(['coordinator']),submissionMiddleware.checkSubmissionFaculty, submissionController.deleteSubmission);

module.exports = router;
