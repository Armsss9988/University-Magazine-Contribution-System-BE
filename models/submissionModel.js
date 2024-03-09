// models/Submission.js
const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
  // Add other relevant fields
});

module.exports = mongoose.model('Submission', submissionSchema);
