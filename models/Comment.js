// models/Comment.js
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  status: { type: String},
  date: { type: Date, default: Date.now },
  // Add other relevant fields if needed
});

module.exports = mongoose.model('Comment', commentSchema);
