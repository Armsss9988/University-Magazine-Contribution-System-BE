const Faculty = require('../models/facultyModel');
const User = require('../models/userModel'); // Import user model
const jwt = require('jsonwebtoken');
const BlacklistedToken = require('../models/blackListedTokenModel');

const checkSignup = async (req, res) => {
    try {
      const { username, email, password, role, facultyName } = req.body;
  
      // Input validation and sanitization (consider using libraries like Joi or validator)
      if (!username || !email || !password || !role || !facultyName) {
        return res.status(400).json({ message: 'Missing required fields' })
      }
      const faculty = await Faculty.findOne({ name: facultyName });
      if (!faculty) {
        return res.status(400).json({ message: 'Invalid faculty name' });
      }
  
      // Check for existing user with same email
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      const newUser = new User({
        username,
        email,
        password,
        role,
        faculty: faculty, // Assuming you have a foreign key relationship
      });
      await newUser.save();
      res.json(newUser);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error creating user' });
    }
  };
  
  // User login
  const checkLogin = async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({email}).select("+password");
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      console.log(user.password, user.role);
      const isMatch = await user.comparePassword(password);
     
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      const token = jwt.sign({ id: user.id, role: user.role} , process.env.JWT_SECRET, { expiresIn: '1h' });
      res.cookie('token', token, { httpOnly: true });
      res.json({ message: 'User login successfully', token });
      // Generate and send JWT token
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error logging in' });
    }
  };
  const checkLogout = async (req,res) => {
    try {
      const token = req.cookies.token; // Assuming token is stored in a cookie
  
      // Add token to blacklist
      const blacklistedToken = new BlacklistedToken({ token });
      await blacklistedToken.save();
  
      // Optionally clear client-side cookie
      res.clearCookie('token');
  
      res.status(200).json({ message: 'Successfully logged out' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ message: 'Logout failed' });
    }
  }

  module.exports = { checkLogin, checkSignup, checkLogout};