// models/Submission.js
const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  
  title: { type: String, required: true },
  document_path: { type: String, required: true },
  entry_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Entry', required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  closed: { type: Boolean, default: false },
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

module.exports = mongoose.model('Submission', submissionSchema);
