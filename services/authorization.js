const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Faculty = require('../models/facultyModel');
const Submission = require('../models/submissionModel');

const verifyToken = (req, res, next) => {
  try 
  {
    const token = req.cookies.token;
    console.log(token);
    if (!token) return res.status(401).json({ message: 'Unauthorized access' });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(401).json({ message: 'Invalid token' });
      req.user = decoded.user;
      console.log("decoded: " + decoded.user);
      next();   
    });
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating user' });
  }
};

const authorizeRole = (role) => (req, res, next) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  console.log("role needed: " + role );
  console.log("user role: " + user.role);
  // Check role requirement (if any)
  if (role !== user.role) {
    return res.status(403).json({ message: "Forbidden" });
  }

  // Check faculty affiliation if required
  
  next();
};

module.exports = { verifyToken, authorizeRole };