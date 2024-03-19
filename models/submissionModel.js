// models/Submission.js
const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  document_path: { type: String, required: true },
  entry: { type: mongoose.Schema.Types.ObjectId, ref: 'Entry', required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  closed: { type: Boolean, default: false },
  status: { type: String, enum: ['approved', 'rejected', 'submitted'], default: 'submitted'},
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  comment_content: {type: String, required: false},
  comment_at: {type: Date, required: false}
});


module.exports = mongoose.model('Submission', submissionSchema);
