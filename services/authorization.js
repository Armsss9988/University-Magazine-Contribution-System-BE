const jwt = require('jsonwebtoken');
const config = require('../config'); // Load configuration

const verifyToken = (req, res, next) => {
  const token = req.headers['x-access-token'] || req.query.token;
  if (!token) return res.status(401).json({ message: 'Unauthorized access' });

  jwt.verify(token, config.jwtSecret, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Invalid token' });
    req.user = decoded;
    next();
  });
};

const authorize = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden access' });
  }
  next();
};

module.exports = { verifyToken, authorize };