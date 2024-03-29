const cron = require('node-cron');
const Entry = require('../models/entryModel');
const localTime = require('../services/getLocalTime');
const Submission = require('../models/submissionModel');

function autoCloseEntriesAndSemesters() {
  console.log("Checking");
  const currentDate = localTime.getDateNow();
  
  Entry.find({ end_date: { $lt: currentDate }, closed: 'false' })
    .then(entriesToClose => {
      if (entriesToClose.length === 0) { console.log("Not found entry"); }
      entriesToClose.forEach(entry => {
        console.log("entry");
        console.log(entry.end_date);
        entry.closed = true;
        entry.save(); 
      Submission.find({entry: entry}).then(submissionToClosed => {
        if (submissionToClosed.length === 0) { console.log("Not found sbmission"); }
        submissionToClosed.forEach(submission => {
          submission.closed = "true"
          submission.save();
        })
      })
      });
    })
    .catch(error => {
      console.error('Error closing entries:', error);
    });

  Semester.find({ endDate: { $lt: currentDate }, closed: 'false' })
    .then(semestersToClose => {
      semestersToClose.forEach(semester => {
        semester.closed = true;
        semester.save(); // Update the semester status in the database
        // Send notification (optional)
        // ...
      });
    })
    .catch(error => {
      console.error('Error closing semesters:', error);
    });
}

// Schedule cron job to run every second (consider a more appropriate schedule)
const check = cron.schedule('* * * * *', autoCloseEntriesAndSemesters);
module.exports = check;