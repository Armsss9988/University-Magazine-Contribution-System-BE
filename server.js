const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const dbConnection = require('./configs/database');
var bodyParser = require("body-parser");
const userRouter = require('./routes/userRoute'); 
const facultyRouter = require('./routes/facultyRoute');
const submissionRouter = require('./routes/submissionRoute');
const cookieParser = require('cookie-parser');
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(bodyParser.urlencoded({
    extended: true
  }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(function middleware(req, res, next) {;//[]
    var simpleLogger = req.method + " " + req.path + " - " + req.ip;
    console.log(simpleLogger);
    next();
  });

app.use('/api/user', userRouter);
app.use('/api/submission', submissionRouter);
app.use('/api/faculty', facultyRouter);

dbConnection();
app.listen(8000, () => {
    console.log(`Server is running on port 8000.`);
});