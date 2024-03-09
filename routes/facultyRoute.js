const express = require('express');
const facultyController = require('../controllers/facultyController');
const authorization = require('../services/authorization');
const router = express.Router();
router.use(authorization.verifyToken);

router.post('/', facultyController.createFaculty);
router.get('/', facultyController.getFaculties);
router.get('/:id', facultyController.getFacultyById);
router.put('/:id', facultyController.updateFaculty);
router.delete('/:id', facultyController.deleteFaculty);

module.exports = router;