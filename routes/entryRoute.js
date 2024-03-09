const express = require('express');
const entryController = require('./controllers/entryController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/entries', authMiddleware, entryController.getEntries);
router.post('/entries', authMiddleware, entryController.createEntry);
router.put('/entries/:id', authMiddleware, entryController.updateEntry);
router.delete('/entries/:id', authMiddleware, entryController.deleteEntry);

module.exports = router;