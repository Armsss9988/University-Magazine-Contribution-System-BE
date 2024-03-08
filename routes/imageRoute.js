// routes/api.js
const express = require('express');
const router = express.Router();
const { uploadImage,getImage} = require('../controllers/imageController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Specify the upload directory  



router.post('/upload',upload.single("image"), uploadImage);




// Serve images (example route)
router.get('/:imageId', getImage );
module.exports = router;
