
const Document = require('../models/documentModel');

const uploadDocument = async (req, res) => {
    try {
      const { originalname, mimetype } = req.file;
      const newDocument = await Document.create({
        filename: req.file.filename,
        originalName: originalname,
        mimeType: mimetype,
      });
      res.status(201).json({ message: 'Document uploaded successfully', document: newDocument });
    } catch (error) {
      console.error('Error uploading Document:', error);
      res.status(500).json({ error: 'Document upload failed' });
    }
  };
  const getDocument = async (req, res) => {

      try {
      console.log(req.params.documentId);
        const document = await Document.findById(req.params.documentId);
        
        if (!document) {
          return res.status(404).json({ error: 'Document not found' });
        }
        // Set the appropriate Content-Type header based on the stored MIME type
        res.set('Content-Type', document.mimeType);
        res.send(document.fileData); // Assuming you have a field named 'fileData' in your model
      } catch (error) {
        console.error('Error retrieving Document:', error);
        res.status(500).json({ error: 'Document retrieval failed' });
      }
    };

module.exports = { uploadDocument , getDocument};
