const Faculty = require('../models/facultyModel');

const createFaculty = async (req, res) => {
  try {
    const { name } = req.body; // Destructure body data

    // Input validation and sanitization

    const newFaculty = new Faculty({ name });
    await newFaculty.save();

    res.json({ message: 'Faculty created successfully', faculty: newFaculty });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating faculty' });
  }
};

const getFaculties = async (req, res) => {
  try {
    const faculties = await Faculty.find();
    res.json({ faculties });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error getting faculties' });
  }
};

const getFacultyById = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    res.json({ faculty });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error getting faculty' });
  }
};

const updateFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body; // Destructure body data

    // Input validation and sanitization

    const updatedFaculty = await Faculty.findByIdAndUpdate(
      id,
      { name },
      { new: true } // Return updated document
    );
    if (!updatedFaculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    res.json({ message: 'Faculty updated successfully', faculty: updatedFaculty });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating faculty' });
  }
};

const deleteFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findByIdAndDelete(req.params.id);
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    res.json({ message: 'Faculty deleted successfully', faculty });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting faculty' });
  }
};

module.exports = {
  createFaculty,
  getFaculties,
  getFacultyById,
  updateFaculty,
  deleteFaculty,
};
