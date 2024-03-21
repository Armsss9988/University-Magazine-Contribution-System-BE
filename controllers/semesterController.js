const Semester = require("../models/semesterModel");

const getSemesters = async (req, res) => {
  try {
    const semesters = await Semester.find();
    res.json(semesters);
  } 
  catch (err) {
    return res.status(500).json({ message: "Error retrieving semesters" }); // Informative error message
  }
};

const createSemester = async (req, res) => {
  try {
    const semester = new Semester(req.body);
    const overlappingSemesters = await Semester.find({
      $or: [
        {
          start_date: {
            $gte: semester.start_date,
            $lt: semester.final_closure_date,
          },
        },
        {
          final_closure_date: {
            $gt: semester.start_date,
            $lte: semester.final_closure_date,
          },
        },
      ],
    });
    if (overlappingSemesters.length > 0) {
      return res
        .status(400)
        .json({
          message: "Time conflict detected. Semester dates must be unique.",
        }); // Descriptive error message
    }

    await semester.save();
    res.json(semester);
  } catch (error) {
    if (error.code === 11000) {
      // Handle Mongoose duplicate key error specifically
      return res.status(400).json({ message: "Academic year must be unique" });
    } else {
      console.error(error.message);
      res.status(500).json({ message: "Error creating semester" });
    }
  }
};

const updateSemester = async (req, res) => {
  const { id } = req.params;

  try {
    const semester = await Semester.findById(id);
    
    if (!semester) {
      return res.status(404).json({ message: "Semester not found" });
    }
    semester.start_date = req.body.start_date;
    semester.final_closure_date = req.body.final_closure_date;
    semester.academic_year = req.body.academic_year;
    const overlappingSemesters = await Semester.find({
      $or: [
        {
          start_date: {
            $gte: semester.start_date,
            $lt: semester.final_closure_date,
          },
        },
        {
          final_closure_date: {
            $gt: semester.start_date,
            $lte: semester.final_closure_date,
          },
        },
      ],
    });
    if (overlappingSemesters.length > 0) {
      return res
        .status(400)
        .json({
          message: "Time conflict detected. Semester dates must be unique.",
        }); // Descriptive error message
    }
    
    semester.save();
    res.json(semester);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Error updating semester" });
  }
};

const deleteSemester = async (req, res) => {
  const { id } = req.params;

  try {
    await Semester.findByIdAndRemove(id);
    res.json({ message: "Semester deleted" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Error deleting semester" });
  }
};

module.exports = {
  createSemester,
  getSemesters,
  updateSemester,
  deleteSemester,
};
