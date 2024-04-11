
const User = require('../models/userModel'); 


const getUserByID = async (req,res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return only necessary user data (exclude password etc.)
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error getting user profile' });
  }
};
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return only necessary user data (exclude password etc.)
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error getting user profile' });
  }
};
const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error getting users' });
  }
};
const getUsersByFaculty = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    const faculty = user.faculty;
    // Filter based on faculty ID and role (optional)
    let filter = {};
    if (faculty) {
      filter = user.role === 'coordinator' ? { faculty } : { faculty, role: 'student' }; // Allow admin to see all users of a faculty, student to see only their own
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
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      id,
      { email }
    );
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Error updating user" });
  }
};

module.exports = { getProfile, getUsers, getUsersByFaculty, deleteUser , getUserByID, updateUser};
