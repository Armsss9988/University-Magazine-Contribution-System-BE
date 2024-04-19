const express = require("express");
const entryController = require("../controllers/entryController");
const router = express.Router();
const authorization = require("../services/authorization");

router.get("/faculty/:id", entryController.getEntriesByFaculty);
router.get("/list/all", entryController.getEntries);
router.get("/:id", entryController.getEntryById);
router.use(authorization.verifyToken);
router.use(authorization.authorizeRole(["manager"]));

router.post("/", entryController.createEntry);
router.put("/:id", entryController.updateEntry);
router.delete("/:id", entryController.deleteEntry);

module.exports = router;
