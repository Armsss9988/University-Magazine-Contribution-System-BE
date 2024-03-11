const User = require('../models/userModel');
const Faculty = require('../models/facultyModel');
const Submission = require('../models/submissionModel');
const checkSubmissionFaculty = () => (req, res, next) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userFaculty = user.faculty;
    const submission = Submission.findById(req.params.id);
    const targetUserFaculty = submission.student.faculty;
    // Check role requirement (if any)
    if (userFaculty !== targetUserFaculty) {
      return res.status(403).json({ message: "Forbidden" });
    }
  
    // Check faculty affiliation if required
    
    next();
  };
  const checkSubmissionUser = () => (req, res, next) => {
    const submission = Submission.findById(req.param.id);
    if(submission.student !== req.user)
    {
      return res.status(500).json({ error: `Student do not have the right to update other people's submission ` });
    }
    next();
  }
 
  module.exports = { checkSubmissionFaculty, checkSubmissionUser};