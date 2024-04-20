const Faculty = require('../models/facultyModel');
const User = require('../models/userModel'); // Import user model
const jwt = require('jsonwebtoken');
const BlacklistedToken = require('../models/blackListedTokenModel');

const checkSignup = async (req, res) => {
    try {
      const { username, email, password, role, faculty } = req.body;
  
      // Input validation and sanitization (consider using libraries like Joi or validator)
      if (!username || !email || !password || !role) {
        return res.status(400).json({ message: 'Missing required fields' })
      }
      const userFaculty = await Faculty.findById(faculty);
  
      // Check for existing user with same email
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      if(password.length < 6 ) return res.status(400).json({message: "Password must be at least 6 digit"});
      const newUser = new User({
        username,
        email,
        password,
        role,
        faculty: (userFaculty != null)? userFaculty : null, 
      });
      await newUser.save();
      return res.json(newUser);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error creating user' });
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
      const token = jwt.sign({ id: user.id, role: user.role} , process.env.JWT_SECRET, { expiresIn: '3h' });
      res.cookie('token', token, { httpOnly: true });
      return res.json({ message: 'User login successfully', token });
      // Generate and send JWT token
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error logging in' });
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
  
      return res.status(200).json({ message: 'Successfully logged out' });
    } catch (error) {
      console.error('Logout error:', error);
      return res.status(500).json({ message: 'Logout failed' });
    }
  }

  module.exports = { checkLogin, checkSignup, checkLogout};