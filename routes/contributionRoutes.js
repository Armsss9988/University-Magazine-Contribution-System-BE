// routes/contributionRoutes.js
const express = require('express');
const contributionController = require('../controllers/contributionController');

const router = express.Router();

router.post('/download-contributions', contributionController.downloadContributions);

module.exports = router;
