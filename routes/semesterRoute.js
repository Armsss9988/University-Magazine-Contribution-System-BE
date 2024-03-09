const express = require('express');
const semesterController = require('../controllers/semesterController');
const authorization = require('../services/authorization');
const router = express.Router();
router.use(authorization.verifyToken);

router.get('/semesters', semesterController.getSemesters); // Optional: Add auth middleware if needed
router.post('/semesters', semesterController.createSemester); // Optional: Add auth middleware if needed
router.put('/semesters/:id', semesterController.updateSemester); // Optional: Add auth middleware if needed
router.delete('/semesters/:id', semesterController.deleteSemester); // Optional: Add auth middleware if needed

module.exports = router;