const Entry = require("../models/entryModel");
const Faculty = require("../models/facultyModel");
const Semester = require("../models/semesterModel");

const entryController = {

  async getEntries(req, res) {
    const entries = await Entry.find();
    res.json(entries);
  },
  async getEntryById(req, res) { 
    try {
      const entry = await Entry.findById(req.params.id);
      if (!entry) {
        return res.status(404).json({ message: 'entry not found' });
      }
      res.json(entry);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error getting entry' });
    }
  },

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
      if(semester.start_date > entry.start_date){
        return res.json({message: "Start date must be after start date of this semester"});
      }
      if(semester.final_closure_date < entry.end_date){
        return res.json({message: "End date is over time for this semester"});
      }     
      await entry.save();
      res.json({message: "Create successfully"});
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
      if(semester.start_date > entry.start_date){
        return res.json({message: "Start date must be after start date of this semester"});
      }
      if(semester.final_closure_date < entry.end_date){
        return res.json({message: "End date is over time for this semester"});
      }
      res.json({ message: "Update successfully"});
    } catch (error) {
      console.log(error);
      return res.json({ message: "Error update" });
    }
  },

  async deleteEntry(req, res) {
    await Entry.findByIdAndDelete(req.params.id);
    res.json({ message: "Entry deleted" });
  },
};

module.exports = entryController;
