// models/Report.js
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    type: { type: String, required: true },
    data: { type: mongoose.Schema.Types.Mixed, required: true }, // Use Mixed type for JSON data
    generated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Report', reportSchema);
