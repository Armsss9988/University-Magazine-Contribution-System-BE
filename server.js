const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const dbConnection = require('./configs/database');
var bodyParser = require("body-parser");
const service = require('./services');
const router = require('./routes/'); 

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({
    extended: true
  }));

app.use(bodyParser.json());
app.use(function middleware(req, res, next) {
    var simpleLogger = req.method + " " + req.path + " - " + req.ip;
    console.log(simpleLogger);
    next();
  });

app.use('/api/user', router.user);



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