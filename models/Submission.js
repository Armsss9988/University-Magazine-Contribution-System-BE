// models/Submission.js
const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  document_path: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  closed: { type: Boolean, default: false },
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  faculty_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true }
  // Add other relevant fields
});

module.exports = mongoose.model('Submission', submissionSchema);
