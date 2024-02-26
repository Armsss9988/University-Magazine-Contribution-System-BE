const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model'); // Import user model
const config = require('../config'); // Import secure configuration

const router = express.Router();

// Create a new user
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, role, facultyId } = req.body;

    // Input validation and sanitization (consider using libraries like Joi or validator)
    if (!username || !email || !password || !role || !facultyId) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    // Check for existing user with same email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Hash password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role,
      faculty: facultyId, // Assuming you have a foreign key relationship
    });

    await newUser.save();

    // Generate and send JWT token
    const token = jwt.sign({ _id: newUser._id, role }, config.jwtSecret, { expiresIn: '1h' });

    res.json({ message: 'User created successfully', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating user' });
  }
});

// User login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation and sanitization

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate and send JWT token
    const token = jwt.sign({ _id: user._id, role }, config.jwtSecret, { expiresIn: '1h' });

    res.json({ message: 'Login successful', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Get user profile (protected route)
router.get('/profile', auth.verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return only necessary user data (exclude password etc.)
    res.json({ user: { username: user.username, email: user.email, role: user.role, faculty: user.faculty } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error getting user profile' });
  }
});

module.exports = router;
