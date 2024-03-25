const User = require("../models/userModel");
const Faculty = require("../models/facultyModel");
const Submission = require("../models/submissionModel");

const checkRBAC = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  console.log(req.params);
  if (user.role.includes("manager")) {
    checkSelectedSubmission(req, res);
  }
  if (user.role.includes("coordinator")) {
    checkSubmissionFaculty(req, res);
  }
  if (user.role.includes("student")) {
    checkSubmissionUser(req, res);
  }
  next();
};
const checkSubmissionFaculty = async (req, res) => {
  try {
    console.log("Checking faculty of submission!");
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userFacultyId = user.faculty._id;
    const submission = await Submission.findById(req.params.id)
      .populate("student")
      .populate("student.faculty");
    const targetUserFacultyId = submission.student.faculty._id;
    console.log("User faculty: " + userFacultyId);
    console.log("Target User faculty: " + targetUserFacultyId);

    // Check role requirement (if any)

    if (!userFacultyId.equals(targetUserFacultyId)) {
      return res.status(403).json({ message: "You dont have permission!" });
    }

    // Check faculty affiliation if required
    console.log("Done check faculty!");
  } catch (err) {
    console.log("Error checking user");
  }
};
const checkSubmissionUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    console.log("Checking user of submission!");
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(500).json({ message: `Error get submission!` });
    }
    if (!user.equals(submission.student)) {
      return res
        .status(500)
        .json({
          message: `Student do not have the right to update other people's submission `,
        });
    }
    console.log("Done check user of submission!");
  } catch (err) {
    console.log("Error checking user");
  }
};

const checkSelectedSubmission = async (req, res) => {
  try {
    console.log("Checking status of submission!");
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(500).json({ error: `Error get submission!` });
    }
    const status = submission.status;
    if (!status.equals("selected")) {
      return res
        .status(403)
        .json({ error: `You dont have permission to view this submission!` });
    }
    console.log("Done check status of submission!");
  } catch (err) {
    console.log("Error checking user");
  }
};

module.exports = { checkRBAC, checkSelectedSubmission };
