const express = require('express');
const entryController = require('../controllers/entryController');
const router = express.Router();
const authorization = require('../services/authorization');
router.use(authorization.verifyToken);



router.get('/entries',  entryController.getEntries);
router.post('/entries',  entryController.createEntry);
router.put('/entries/:id',  entryController.updateEntry);
router.delete('/entries/:id', entryController.deleteEntry);

module.exports = router;