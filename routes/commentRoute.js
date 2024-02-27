// routes/commentRoutes.js
const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

// Create a new comment
router.post('/', commentController.createComment);

// Get all comments (if needed)
// Implement other routes as per your requirements

module.exports = router;
