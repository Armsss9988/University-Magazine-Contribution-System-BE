// semesterModel.js

const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  start_date: { type: Date, required: true },
  final_closure_date: { type: Date, required: true },
  academic_year: { type: String, unique: true, required: true },
  // Add other relevant fields as needed
});

module.exports = mongoose.model('Semester', semesterSchema);
