
const User = require('../models/userModel'); 



// Get user profile (protected route)
const getProfile = async (req, res) => {
  try {
    const user = req.user;
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
const getUsersByFaculty = async (req, res) => {
  try {
    const { faculty } = req.user.faculty; // Get faculty ID from query parameter

    // Filter based on faculty ID and role (optional)
    let filter = {};
    if (faculty) {
      filter = req.user.role === 'coordinator' ? { faculty } : { faculty, role: 'student' }; // Allow admin to see all users of a faculty, student to see only their own
    }

    const users = await User.find(filter);
    res.json(users);
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

module.exports = { getProfile, getUsers, getUsersByFaculty, deleteUser};
