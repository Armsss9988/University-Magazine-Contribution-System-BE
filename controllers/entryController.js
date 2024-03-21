const Entry = require("../models/entryModel");
const Faculty = require("../models/facultyModel");
const Semester = require("../models/semesterModel");

const entryController = {
  // READ (với phân quyền)
  async getEntries(req, res) {
    const { role, facultyId } = req.user;
    const filter = role === "faculty" ? { faculty_id: facultyId } : {};
    const entries = await Entry.find(filter);
    res.json(entries);
  },

  // CREATE (chưa có phân quyền cụ thể)
  async createEntry(req, res) {
    try {
      const faculty = await Faculty.findById(req.body.faculty);
      if (!faculty) {
        return res.json({ message: "Faculty not found" });
      }

      const semester = await Semester.findById(req.body.semester);
      if (!semester) {
        return res.json({ message: "Semester not found" });
      }
      if (semester.closed) {
        return res.json({ message: "Semester closed" });
      }
      
      const entry = new Entry(req.body);
      if(semester.final_closure_date < entry.end_date){
        return res.json({message: "End date is over time for this semester"});
      }
      const overlappingEntries = await Entry.find({
        $or: [
          {
            start_date: {
              $gte: entry.start_date,
              $lt: entry.end_date,
            },
          },
          {
            final_closure_date: {
              $gt: entry.start_date,
              $lte: entry.end_date,
            },
          },
        ],
      });
      if (overlappingEntries.length > 0) {
        return res
          .status(400)
          .json({
            message: "Time conflict detected. Entry dates must be unique.",
          }); // Descriptive error message
      }
      
      await entry.save();
      res.json(entry);
    } catch (error) {
      console.log(error);
      return res.json({ message: "Error create" });
    }
  },

  async updateEntry(req, res) {
    try {
      const faculty = await Faculty.findById(req.body.faculty);
      if (!faculty) {
        return res.json({ message: "Faculty not found" });
      }

      const semester = await Semester.findById(req.body.semester);
      if (!semester) {
        return res.json({ message: "Semester not found" });
      }
      if (semester.closed) {
        return res.json({ message: "Semester closed" });
      }

      const entry = await Entry.findById(req.param.id);
      entry.start_date = req.body.start_date;
      entry.end_date = req.body.end_date;
      if(semester.final_closure_date < entry.end_date){
        return res.json({message: "End date is over time for this semester"});
      }
      const overlappingEntries = await Entry.find({
        $or: [
          {
            start_date: {
              $gte: entry.start_date,
              $lt: entry.end_date,
            },
          },
          {
            final_closure_date: {
              $gt: entry.start_date,
              $lte: entry.end_date,
            },
          },
        ],
      });
      if (overlappingEntries.length > 0) {
        return res
          .status(400)
          .json({
            message: "Time conflict detected. Entry dates must be unique.",
          }); // Descriptive error message
      }

      res.json(entry);
    } catch (error) {
      console.log(error);
      return res.json({ message: "Error update" });
    }
  },

  async deleteEntry(req, res) {
    await Entry.findByIdAndRemove(req.params.id);
    res.json({ message: "Entry deleted" });
  },
};

module.exports = entryController;
