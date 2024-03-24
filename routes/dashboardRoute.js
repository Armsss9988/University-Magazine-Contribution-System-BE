const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authorization = require('../services/authorization');

router.use(authorization.verifyToken);
router.use(authorization.authorizeRole(['manager']));

router.get('/submissions/', dashboardController.getFacultySubmissionsPerSemester);
router.get('/contributors/', dashboardController.contributorsEachFacultyEachSemester);
router.get('/percentage/:id', dashboardController.percentageOfContributionsByFaculty);
router.get('/uncommented/', dashboardController.submissionWithoutComment);
router.get('/uncommented14/', dashboardController.submissionWithoutCommentafter14days);

module.exports = router;