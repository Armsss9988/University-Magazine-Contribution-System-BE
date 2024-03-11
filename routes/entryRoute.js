const express = require('express');
const entryController = require('../controllers/entryController');
const router = express.Router();
const authorization = require('../services/authorization');
router.use(authorization.verifyToken);
router.use(authorization.authorizeRole(['manager']));



router.get('/',  entryController.getEntries);
router.post('/',  entryController.createEntry);
router.put('/:id',  entryController.updateEntry);
router.delete('/:id', entryController.deleteEntry);

module.exports = router;