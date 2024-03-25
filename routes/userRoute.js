const express = require("express");
const userController = require("../controllers/userController"); // Import controller
const authorization = require("../services/authorization");
const authentication = require("../services/authentication");
const router = express.Router();

router.post("/login", authentication.checkLogin);
router.get("/detail/:id", userController.getUserByID);
router.get("/list/all", userController.getUsers);

router.use(authorization.verifyToken);

router.get("/list/faculty",authorization.authorizeRole(["coordinator"]), userController.getUsersByFaculty);
router.get("/profile", userController.getProfile);
router.post("/logout", authentication.checkLogout);

// router.use(authorization.authorizeRole(["admin"]));
router.post("/signup", authentication.checkSignup);
router.delete("/delete/:id", userController.deleteUser);

module.exports = router;
