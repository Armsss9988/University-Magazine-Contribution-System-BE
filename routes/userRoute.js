const express = require('express');
const userController = require('../controllers/userController'); // Import controller
const authorization = require('../services/authorization');
const authentication = require('../services/authentication');
const router = express.Router();

router.use((req, res, next) => {
    const excludedPaths = ['/signup', '/login'];
    if (!excludedPaths.includes(req.path)) {
      authorization.verifyToken(req, res, next);
    } else {
      next();
    }
  });

router.post('/signup', authentication.checkSignup, userController.signup);
router.post('/login', authentication.checkLogin);
router.get('/profile', userController.getProfile);
router.get('/list', userController.getUsers);
router.delete('/delete/:id',authorization.authorizeRole(['coordinator']), userController.deleteUser);

module.exports = router;