const express = require('express');
const userController = require('../controllers/userController'); // Import controller
const authorization = require('../services/authorization');
const authentication = require('../services/authentication');
const router = express.Router();

router.use((req, res, next) => {
    const excludedPaths = ['/login'];
    if (!excludedPaths.includes(req.path)) {
      authorization.verifyToken(req, res, next);
    } else {
      next();
    }
  });
  router.use((req, res, next) => {
    const excludedPaths = ['/login','/list/faculty','/profile'];
    if (!excludedPaths.includes(req.path)) {
      authorization.authorizeRole(['admin']);
      next();
    } else {
      next();
    }
  });

router.post('/signup', authentication.checkSignup);
router.post('/login', authentication.checkLogin);
router.get('/profile', userController.getProfile);
router.get('/list/all', userController.getUsers);
router.get('/list/faculty',authorization.authorizeRole(['coordinator']), userController.getUsersByFaculty);
router.delete('/delete/:id', userController.deleteUser);


module.exports = router;