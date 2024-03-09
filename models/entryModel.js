const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
  id: { type: Number, required: true },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  faculty_id: { type: Number, required: true },
  semester_id: { type: Number, required: true },
  // Add other relevant fields
});

module.exports = mongoose.model('Entry', entrySchema);
