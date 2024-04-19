
const User = require('../models/userModel'); 
const Faculty = require('../models/facultyModel');


const getUserByID = async (req,res) => {
  try {
    const user = await User.findById(req.params.id).populate("faculty");
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
    const user = await User.findById(req.user.id).populate("faculty");
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
const editUser = async (req, res) => {
  try {
    const { username, email, password, role, faculty} = req.body;
    const { id } = req.params;

    // Input validation and sanitization (consider using libraries like Joi or validator)
    if (!username || !email || !role) {
      return res.status(400).json({ message: 'Missing required fields' })
    }
    const user = await User.findById(id);
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    const userFaculty = await Faculty.findById(faculty);
    if (!userFaculty && (role == "coordinator" || role == "student")) {
      return res.status(400).json({ message: 'Invalid faculty' });
    }

    // Check for existing user with same email
    const existingUser = await User.findOne({ email });
    console.log(existingUser._id);
    console.log(user._id);
    if (existingUser != null && existingUser._id.toString != user._id.toString) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    if(password.length > 0 && password.length < 6){
      return res.status(400).json({message: "Password must be at least 6 ditgit"});
    }
    user.username = username;
    user.email = email;
    if(password.length > 0) user.password = password;
    user.role = role;
    user.faculty = (userFaculty != null) ?  userFaculty : null ;
    
    await user.save();
    res.json({message: "User edit susscesful"});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating user' });
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

module.exports = { getProfile, getUsers, getUsersByFaculty, deleteUser , getUserByID, editUser};
