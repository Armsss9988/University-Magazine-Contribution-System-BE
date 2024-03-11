const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
  start_date: { type: Date, default: Date.now },
  end_date: { type: Date, required: true },
  closed: { type: Boolean, default: false},
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  semester: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
  // Add other relevant fields
});

module.exports = mongoose.model('Entry', entrySchema);
