const express = require('express');
const userController = require('../controllers/user.controller'); // Import controller

const router = express.Router();

router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.get('/profile', userController.getProfile); // Assuming protected with auth middleware

module.exports = router;