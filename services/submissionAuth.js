const User = require('../models/userModel');
const Faculty = require('../models/facultyModel');
const Submission = require('../models/submissionModel');
const checkSubmissionFaculty  = async (req, res, next) => {
  try {
    console.log("Checking faculty of submission!")
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userFacultyId = user.faculty._id;
    const submission = await Submission.findById(req.params.id).populate("student")
    .populate("student.faculty");    
    const targetUserFacultyId = submission.student.faculty._id;
    console.log("User faculty: " + userFacultyId);
    console.log("Target User faculty: " + targetUserFacultyId);
    
    // Check role requirement (if any)
    
    if (!userFacultyId.equals(targetUserFacultyId)) {
      
      return res.status(403).json({ message: "You dont have permission!" });
    }
  
    // Check faculty affiliation if required
    console.log("Done check faculty!")
    next();
  }
  catch (error) {
    res.status(500).json({ error: 'Error check Submission Faculty' });
  }
  };
  const checkSubmissionUser  = async (req, res, next) => {
    console.log("Checking user of submission!");
    const submission = await Submission.findById(req.param.id);
    if(!submission){
      return res.status(500).json({ error: `Error get submission!` });
    }
    if(submission.student !== req.user)
    {
      return res.status(500).json({ error: `Student do not have the right to update other people's submission ` });
    }
    console.log("Done check user of submission!");
    next();
  }
 
  module.exports = { checkSubmissionFaculty, checkSubmissionUser};