const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel'); // Import user model
const Faculty = require('../models/facultyModel');

// Create a new user
const signup = async (req, res) => {
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

    // Hash password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role,
      faculty: faculty._id, // Assuming you have a foreign key relationship
    });

    await newUser.save();

    // Generate and send JWT token
    const token = jwt.sign({ _id: newUser._id, role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ message: 'User created successfully', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating user' });
  }
};

// User login
const login = async (req, res) => {
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
    const token = jwt.sign({ _id: user._id, role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ message: 'Login successful', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error logging in' });
  }
};

// Get user profile (protected route)
const getProfile = async (req, res) => {
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
};
const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error getting users' });
  }
};
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting user' });
  }
};

module.exports = {signup, login, getProfile, getUsers, deleteUser};
