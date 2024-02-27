// server.js
const express = require('express');
const mongoose = require('mongoose');
const submissionRoutes = require('./routes/submissionRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB (replace with your MongoDB URI)
mongoose.connect('mongodb://localhost/submissionDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(express.json());
app.use('/submissions', submissionRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
