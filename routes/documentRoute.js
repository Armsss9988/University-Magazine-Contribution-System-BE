
const express = require('express');
const router = express.Router();
const { uploadDocument,getDocument} = require('../controllers/documentController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Specify the upload directory  



router.post('/upload',upload.single("document"), uploadDocument);




// Serve images (example route)
router.get('/:documentId', getDocument);
module.exports = router;
