
const Image = require('../models/imageModel');

const uploadImage = async (req, res) => {
    try {
      const { originalname, mimetype } = req.file;
      const newImage = await Image.create({
        filename: req.file.filename,
        originalName: originalname,
        mimeType: mimetype,
      });
      res.status(201).json({ message: 'Image uploaded successfully', image: newImage });
    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({ error: 'Image upload failed' });
    }
  };
  const getImage = async (req, res) => {

      try {
      console.log(req.params.imageId);
        const image = await Image.findById(req.params.imageId);
        
        if (!image) {
          return res.status(404).json({ error: 'Image not found' });
        }
        // Set the appropriate Content-Type header based on the stored MIME type
        res.set('Content-Type', image.mimeType);
        res.send(image.fileData); // Assuming you have a field named 'fileData' in your model
      } catch (error) {
        console.error('Error retrieving image:', error);
        res.status(500).json({ error: 'Image retrieval failed' });
      }
    };

module.exports = { uploadImage , getImage};
