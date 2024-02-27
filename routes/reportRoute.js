// routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Create a new report
router.post('/', reportController.createReport);
router.put('/:id', reportController.deleteReport);
router.delete('/:id', reportController.updateReport);
router.get('/', reportController.getAllReports);


module.exports = router;
