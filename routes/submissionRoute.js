// routes/submissionRoutes.js
const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const authorization = require('../services/authorization');
const submissionMiddleware = require('../services/submissionAuth');


router.get("/guess/list", submissionController.getAllSelectedSubmissions);
router.get("/guess/download/:id",submissionController.dowloadSubmissionById);

router.use(authorization.verifyToken);
// Create a new submission
router.post('/:entryId',authorization.authorizeRole(['student']), submissionController.createSubmission);

// Get submissions
router.get('/:id',authorization.authorizeRole(['student','manager','coordinator']),submissionMiddleware.checkRBAC,submissionController.getSubmissionsById);

//Get list of subbmissions
router.get('/list/data',authorization.authorizeRole(['manager','coordinator','student']), submissionController.getSubmissionsByRole);

//Edit submission
router.put('/edit/:id',authorization.authorizeRole(['coordinator','student']),submissionMiddleware.checkRBAC, submissionController.editSubmission);
// Update a submission
router.put('/update/:id',authorization.authorizeRole(['coordinator','student']),submissionMiddleware.checkRBAC, submissionController.updateSubmission);
// Update a comment for submission
router.put('/comment/:id',authorization.authorizeRole(['coordinator']),submissionMiddleware.checkRBAC, submissionController.updateComment);
// Delete a submission
router.delete('/:id',authorization.authorizeRole(['coordinator']),submissionMiddleware.checkRBAC, submissionController.deleteSubmission);

//Download selected submission
router.get('/manager/download/selected', authorization.authorizeRole(['manager']), submissionController.downloadSelectedSubmissions);
router.post('/manager/download/checked', authorization.authorizeRole(['manager']), submissionController.downloadCheckedSubmissions);
module.exports = router;
