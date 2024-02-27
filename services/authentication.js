const jwt = require('jsonwebtoken');
const User = require('./userModel');

const generateAuthToken = (user) => {
  const payload = { _id: user._id, role: user.role };
  const secret = process.env.JWT_SECRET; // Store secret securely in environment variables
  return jwt.sign(payload, secret, { expiresIn: '1h' });
};

const login = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('Invalid email or password');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new Error('Invalid email or password');

  const token = generateAuthToken(user);
  return { user, token };
};

module.exports = { login, generateAuthToken };