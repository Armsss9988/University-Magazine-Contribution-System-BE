const express = require('express');
const userController = require('../controllers/userController'); // Import controller
const authorization = require('../services/authorization')

const router = express.Router();

router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.get('/profile', authorization.verifyToken, userController.getProfile);
router.get('/list', userController.getUsers);
router.delete('/delete/:id', userController.deleteUser);

module.exports = router;