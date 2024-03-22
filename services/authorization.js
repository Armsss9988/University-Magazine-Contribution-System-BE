const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const BlacklistedToken = require('../models/blackListedTokenModel');
const verifyToken = async (req, res, next) => {
  try 
  {
    const token = req.cookies.token;
    console.log(token);
    if (!token) return res.status(401).json({ message: 'Unauthorized access' });
    const blacklistedToken = await BlacklistedToken.findOne({ token });
    if (blacklistedToken) {
      return res.status(401).json({ message: 'Unauthorized (blacklisted token)' });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(401).json({ message: 'Invalid token' });
      req.user = decoded;
      console.log("decoded: " + decoded);
      next();   
    });
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating user' });
  }
};

const authorizeRole = (roles) => async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  console.log("role needed: " + roles );
  console.log("user role: " + user.role);
  // Check role requirement (if any)
  if (!roles.includes(user.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  // Check faculty affiliation if required
  
  next();
};

module.exports = { verifyToken, authorizeRole };