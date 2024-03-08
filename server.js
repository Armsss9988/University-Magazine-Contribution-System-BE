const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const dbConnection = require('./configs/database');
var bodyParser = require("body-parser");
const userRouter = require('./routes/userRoute'); 
const facultyRouter = require('./routes/facultyRoute');
const submissionRouter = require('./routes/submissionRoutes');
const imageRouter = require('./routes/imageRoute');
const documentRouter = require('./routes/documentRoute');
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({
    extended: true
  }));

app.use(bodyParser.json());
app.use(function middleware(req, res, next) {;//[]
    var simpleLogger = req.method + " " + req.path + " - " + req.ip;
    console.log(simpleLogger);
    next();
  });

app.use('/api/user', userRouter);
app.use('/api/submission', submissionRouter);
app.use('/api/faculty', facultyRouter);
app.use('/api/image', imageRouter);
app.use('/api/document', documentRouter);


dbConnection();
app.get('/message', (req, res) => {
    res.json({ message: "Hello from server!" });
});
app.post('/api/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const { user, token } = await auth.login(email, password);
      res.json({ user, token });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });
app.listen(8000, () => {
    console.log(`Server is running on port 8000.`);
});



const mongoose = require('mongoose');
const multer = require('multer');

// Set up Multer for file uploads
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage });

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the image upload API!');
});

// Upload route
app.post('/upload', upload.single('image'), (req, res) => {
  // Handle the uploaded image here
  // Save it to MongoDB or process it as needed
  const imageBuffer = req.file.buffer;
  // Your logic to save/process the image goes here
  res.status(200).send('Image uploaded successfully!');
});


