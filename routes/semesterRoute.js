const express = require('express');
const semesterController = require('../controllers/semesterController');
const authorization = require('../services/authorization');
const router = express.Router();

router.get('/', semesterController.getSemesters); 
router.get('/:id', semesterController.getSemesterById);

router.use(authorization.verifyToken);
router.use(authorization.authorizeRole(['admin']));

router.post('/', semesterController.createSemester); 
router.put('/:id', semesterController.updateSemester); 
router.delete('/:id', semesterController.deleteSemester); 

module.exports = router;