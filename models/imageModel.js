const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  filename: String,
  originalName: String,
  mimeType: String,
  uploadDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Image', imageSchema);