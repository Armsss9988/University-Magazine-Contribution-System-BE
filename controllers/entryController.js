const Entry = require("../models/entryModel");
const Faculty = require("../models/facultyModel");
const Semester = require("../models/semesterModel");
const Submission = require("../models/submissionModel");

const entryController = {
  async getEntries(req, res){
    const entries = await Entry.find().populate("faculty semester");
        const submissions = await Submission.find(); 

        const entrySubmissionsCount = new Map();

        submissions.forEach(submission => {
            const entryId = submission.entry.toString(); 
            entrySubmissionsCount.set(entryId, (entrySubmissionsCount.get(entryId) || 0) + 1);
        });

        const entriesWithSubmissionsCount = entries.map(entry => {
            const entryId = entry._id.toString(); 
            const submissions_count = entrySubmissionsCount.get(entryId) || 0;
            return { ...entry.toObject(), submissions_count };
        });

        res.json(entriesWithSubmissionsCount);
  },

  async getEntriesByFaculty(req, res) {
    try{
      console.log("test:::", req.params.id);
      const entries = await Entry.find({
        faculty: req.params.id,
        status: "opening"
      }).populate(
        "faculty semester"
      );
      
      res.status(200).json(entries);
    }
    catch(error){
      console.log(error);
      return res.status(500).json({ message: "Error get entries" });
    }
    
  },
  async getEntryById(req, res) { 
    try {
      const entry = await Entry.findById(req.params.id).populate(
        "faculty semester"
      );
      console.log("Entry: " + entry);
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
      if(req.body.faculty == null || req.body.faculty == ""){
        return res.status(400).json({message: "Please input faculty"})
      }
      const faculty = await Faculty.findById(req.body.faculty);
      if (!faculty) {
        return res.status(404).json({ message: "Faculty not found" });
      }
      if(req.body.semester == null || req.body.semester == ""){
        return res.status(400).json({message: "Please input semester"})
      }
      const semester = await Semester.findById(req.body.semester);
      if (!semester) {
        return res.status(404).json({ message: "Semester not found" });
      }
      if (semester.status == "closed") {
        return res.status(400).json({ message: "Semester closed" });
      }
      if(req.body.name == null){
        return res.status(400).json({ message: "Please enter topic for magazine" });
      }
      
      const entry = new Entry(req.body);
      if(semester.start_date > entry.start_date){
        return res.status(400).json({message: "Start date must be after start date of this semester"});
      }
      if(semester.final_closure_date < entry.end_date){
        return res.status(400).json({message: "End date is over time for this semester"});
      }     
      await entry.save();
      res.json({message: "Create successfully"});
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Error create" });
    }
  },

  async updateEntry(req, res) {
    try {
      if(req.body.faculty == null || req.body.faculty == ""){
        return res.status(400).json({message: "Please input faculty"})
      }
      const faculty = await Faculty.findById(req.body.faculty);
      if (!faculty) {
        return res.json({ message: "Faculty not found" });
      }
      if(req.body.semester == null || req.body.semester == ""){
        return res.status(400).json({message: "Please input semester"})
      }
      const semester = await Semester.findById(req.body.semester);
      if (!semester) {
        return res.json({ message: "Semester not found" });
      }
      if (semester.status == "closed") {
        return res.json({ message: "Semester closed" });
      }
      const name = req.body.name;
      if(name == null || name.length == 0 ){
        return res.json({message: "Please enter magazine topic"});
      }

      const entry = await Entry.findById(req.params.id);
      console.log("Entry: " + entry);
      entry.name = name;
      entry.start_date = req.body.start_date;
      entry.end_date = req.body.end_date;
      entry.faculty = faculty;
      entry.semester = semester;
      if(semester.start_date > entry.start_date){
        return res.json({message: "Start date must be after start date of this semester"});
      }
      if(semester.final_closure_date < entry.end_date){
        return res.json({message: "End date is over time for this semester"});
      }
      entry.save();
      res.json({ message: "Update successfully"});
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Error update" });
    }
  },

  async deleteEntry(req, res) {
    try{
      if(req.params.id == null){
        return res.status(400).json({message: "Id not found"});
      }
      await Entry.findByIdAndDelete(req.params.id);
      return res.json({ message: "Entry deleted" });
    }
    catch(err){
      return res.status(500).json({message: err});
    }
    
  },
};

module.exports = entryController;
