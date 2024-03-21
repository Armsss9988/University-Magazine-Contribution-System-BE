// routes/submissionRoutes.js
const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const authorization = require('../services/authorization');
const submissionMiddleware = require('../services/submissionAuth');
const zipDownload = require('../services/zipDownload'); 

router.use(authorization.verifyToken);

// Create a new submission
router.post('/',authorization.authorizeRole(['student']), submissionController.createSubmission);

// Get submissions
router.get('/:id',authorization.authorizeRole(['student','manager','coordinator']),submissionMiddleware,submissionController.getSubmissionsById);

//Get list of subbmissions
router.get('/list/data',authorization.authorizeRole(['manager','coordinator','student']), submissionController.getSubmissionsByRole);
//Edit submission
router.put('/edit/:id',authorization.authorizeRole(['coordinator','student']),submissionMiddleware, submissionController.editSubmission);
// Update a submission
router.put('/update/:id',authorization.authorizeRole(['coordinator','student']),submissionMiddleware, submissionController.updateSubmission);
// Update a comment for submission
router.put('/comment/:id',authorization.authorizeRole(['coordinator']),submissionMiddleware, submissionController.updateComment);
// Delete a submission
router.delete('/:id',authorization.authorizeRole(['coordinator']),submissionMiddleware, submissionController.deleteSubmission);

//Download selected submission
router.get('/manager/download', authorization.authorizeRole(['manager']), zipDownload);
module.exports = router;
