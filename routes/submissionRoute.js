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
router.get('/student/:id',authorization.authorizeRole(['student']),submissionMiddleware.checkSubmissionUser,submissionController.getSubmissionsById);
router.get('/manager/:id',authorization.authorizeRole(['manager']),submissionController.getSubmissionsById);
router.get('/coordinator/:id',authorization.authorizeRole(['coordinator']),submissionMiddleware.checkSubmissionFaculty,submissionController.getSubmissionsById);
//Get list of subbmissions
router.get('/list/all',authorization.authorizeRole(['manager']), submissionController.getAllSubmissions);
router.get('/list/faculty',authorization.authorizeRole(['coordinator']), submissionController.getSubmissionsByFaculty);
//Edit submission
router.put('/coordinator/edit/:id',authorization.authorizeRole(['coordinator']),submissionMiddleware.checkSubmissionFaculty, submissionController.editSubmission);
router.put('/student/edit/:id',authorization.authorizeRole(['student']),submissionMiddleware.checkSubmissionUser, submissionController.editSubmission);
// Update a submission
router.put('/coordinator/update/:id',authorization.authorizeRole(['coordinator']),submissionMiddleware.checkSubmissionFaculty, submissionController.updateSubmission);
router.put('/student/update/:id',authorization.authorizeRole(['student']),submissionMiddleware.checkSubmissionUser, submissionController.updateSubmission);
// Update a comment for submission
router.put('/coordinator/comment/:id',authorization.authorizeRole(['coordinator']),submissionMiddleware.checkSubmissionFaculty, submissionController.updateComment);
// Delete a submission
router.delete('/:id',authorization.authorizeRole(['coordinator']),submissionMiddleware.checkSubmissionFaculty, submissionController.deleteSubmission);

module.exports = router;
