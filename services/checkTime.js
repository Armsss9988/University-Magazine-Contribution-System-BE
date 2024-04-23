const cron = require("node-cron");
const Entry = require("../models/entryModel");
const localTime = require("../services/getLocalTime");
const Semester = require("../models/semesterModel");

const autoCloseEntriesAndSemesters = async () => {
  console.log("Checking");
  const currentDate = new Date();
  await Semester.find()
  .then((semesters) => {
    semesters.forEach(async (semester) => {
      if (currentDate < semester.start_date) {
        semester.status = "pending";
      } else if (
        currentDate >= semester.start_date &&
        currentDate <= semester.final_closure_date
      ) {
        semester.status = "opening";
      } else {
        semester.status = "closed";
      }

      try {
        await semester.save();
        console.log(
          `Semester ${semester.academic_year} status updated to ${semester.status}`
        );
      } catch (error) {
        console.error("Error updating entry status:", error);
      }
    });
  })
  .catch((error) => {
    console.error("Error closing semesters:", error);
  });
  await Entry.find()
    .then(async (entries) => {
      entries.forEach(async (entry) => {
        if (currentDate < entry.start_date) {
          entry.status = "pending";
        } else if (
          currentDate >= entry.start_date &&
          currentDate <= entry.end_date
        ) {
          entry.status = "opening";
        } else {
          entry.status = "closed";
        }

        try {
          await entry.save();
          console.log(`Entry ${entry.name} status updated to ${entry.status}`);
        } catch (error) {
          console.error("Error updating entry status:", error);
        }
      });
    })
    .catch((error) => {
      console.error("Error closing entries:", error);
    });

 
};

const check = cron.schedule("* * * * *", autoCloseEntriesAndSemesters);
module.exports = check;
