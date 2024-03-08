
const express = require('express');
const router = express.Router();
const { uploadImage,getImage} = require('../controllers/imageController');
const storage = require('../configs/fileStorage');
const multer = require('multer');
const uploads = multer({ storage: storage });



router.post('/upload',uploads.single("image"), uploadImage);




// Serve images (example route)
router.get('/:imageId', getImage );
module.exports = router;
