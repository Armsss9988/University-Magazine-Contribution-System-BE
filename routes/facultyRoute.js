const express = require('express');
const facultyController = require('../controllers/facultyController');

const router = express.Router();

router.post('/', facultyController.createFaculty);
router.get('/', facultyController.getFaculties);
router.get('/:id', facultyController.getFacultyById);
router.put('/:id', facultyController.updateFaculty);
router.delete('/:id', facultyController.deleteFaculty);

module.exports = router;