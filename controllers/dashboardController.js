const Submission = require("../models/submissionModel");
const Entry = require("../models/entryModel");
const User = require("../models/userModel");
const Semester = require("../models/semesterModel");
const Faculty = require("../models/facultyModel");
const localTime = require("../services/getLocalTime");

const contributorsEachFacultyEachSemester = async (req, res) => {
  try {
    const pipeline = [
      {
        $lookup: {
          from: "users",
          localField: "student",
          foreignField: "_id",
          as: "studentInfo",
        },
      },
      {
        $unwind: "$studentInfo",
      },
      {
        $lookup: {
          from: "entries",
          localField: "entry",
          foreignField: "_id",
          as: "entryInfo",
        },
      },
      {
        $unwind: "$entryInfo",
      },
      {
        $group: {
          _id: {
            faculty: "$entryInfo.faculty",
            semester: "$entryInfo.semester",
            student: "$studentInfo._id",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: {
            faculty: "$_id.faculty",
            semester: "$_id.semester",
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          faculty: "$_id.faculty",
          semester: "$_id.semester",
          count: 1,
        },
      },
    ];
    const results = await Submission.aggregate(pipeline);
    const studentCountByFacultyAndSemester = results.map((result) => ({
      faculty: result.faculty,
      semester: result.semester,
      count: result.count,
    }));

    res.json(studentCountByFacultyAndSemester);
  } catch (error) {
    console.error(error);
    return res.json({ message: "Internal Server Error" });
  }
};

const getFacultySubmissionsPerSemester = async (req, res) => {
  try {
    const pipeline = [
      {
        $lookup: {
          from: "users",
          localField: "student",
          foreignField: "_id",
          as: "studentInfo",
        },
      },
      {
        $unwind: "$studentInfo",
      },
      {
        $lookup: {
          from: "entries",
          localField: "entry",
          foreignField: "_id",
          as: "entryInfo",
        },
      },
      {
        $unwind: "$entryInfo",
      },
      {
        $group: {
          _id: {
            faculty: "$studentInfo.faculty",
            semester: "$entryInfo.semester",
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          faculty: "$_id.faculty",
          semester: "$_id.semester",
          count: 1,
        },
      },
    ];

    const results = await Submission.aggregate(pipeline);

    const submissionsByFacultySemester = results.map((result) => ({
      faculty: result.faculty,
      semester: result.semester,
      count: result.count,
    }));
    res.json(submissionsByFacultySemester);
  } catch (error) {
    console.error(error);
  }
};
const percentageOfContributionsByFaculty = async (req, res) => {
  try {
    const semester = await Semester.findById(req.params.id);
    console.log(semester.academic_year);
    if (!semester) {
      console.log("Semester not found.");
      return res.status(500).json({ message: "Semester not found." });
    }
    const entries = await Entry.find({ semester: semester }).populate(
      "faculty"
    );

    // Get all submissions for the specified semester
    const submissions = await Submission.find({
      entry: { $in: entries },
    }).populate("entry");
    console.log({ submissions });

    // Initialize an object to store faculty submissions
    const facultySubmissions = {};

    // Count submissions for each faculty
    submissions.forEach((submission) => {
      const faculty = submission.entry.faculty;
      if (!facultySubmissions[faculty]) {
        facultySubmissions[faculty] = 0;
      }
      facultySubmissions[faculty]++;
    });

    // Calculate total submissions
    const totalSubmissions = submissions.length;

    // Calculate percentage submissions
    const percentageSubmissions = [];
    for (const faculty in facultySubmissions) {
      const submissionsCount = facultySubmissions[faculty];
      const percentage = (submissionsCount / totalSubmissions) * 100;
      percentageSubmissions.push({'faculty':faculty, 'percentage': percentage.toFixed(2)}); // Round to 2 decimal places
    }
    res.json(percentageSubmissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error get percentage" });
  }
};

const submissionWithoutComment = async (req, res) => {
  try {
    const submissions = await Submission.find({ comment: null });
    res.json(submissions);
  } catch (error) {
    console.log(error);
  }
};
const submissionWithoutCommentafter14days = async (req, res) => {
  try {
    const currentDate = localTime.getDateNow();
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setTime(currentDate - 14 * 24 * 60 * 60 * 1000);
    const submissions = await Submission.find({
      created_at: { $lt: fourteenDaysAgo }, comment: null
    });
    res.json(submissions);
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  contributorsEachFacultyEachSemester,
  getFacultySubmissionsPerSemester,
  percentageOfContributionsByFaculty,
  submissionWithoutCommentafter14days,
  submissionWithoutComment
};
