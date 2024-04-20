const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
  name: {type: String, require: true},
  start_date: { type: Date, require: true},
  end_date: { type: Date, required: true },
  status: {type: String, enum: ['pending','opening','closed'] },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  semester: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
  // Add other relevant fields
});

module.exports = mongoose.model('Entry', entrySchema);
