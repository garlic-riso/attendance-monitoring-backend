const Schedule = require('../models/scheduleModel');
const mongoose = require('mongoose');

// Helper function to convert time to 24-hour format (HH:MM)
const convertTo24HourFormat = (time) => {
  const [hours, minutes] = time.split(":");
  const formattedHours = String(hours).padStart(2, "0"); // Ensure two-digit format
  return `${formattedHours}:${minutes}`;
};

// Helper function to check for overlapping schedules
const checkOverlappingSchedule = async (filter) => {
  return await Schedule.findOne(filter);
};

module.exports = {
  // Create a new schedule
  createSchedule: async (req, res) => {
    try {
      let { sectionID, academicYear, quarter, subjectID, teacherID, startTime, endTime, week, classMode, room } = req.body;

      // Convert times to 24-hour format
      startTime = convertTo24HourFormat(startTime);
      endTime = convertTo24HourFormat(endTime);

      // Check for overlapping schedules
      // This checks for: Room conflicts, Teacher double-booking,
      // Section time collisions (across all sections),
      // All within the same academicYear and quarter
      const overlapFilter = {
        academicYear,
        quarter,
        $or: [
          { sectionID, week, startTime: { $lt: endTime }, endTime: { $gt: startTime } },
          { room, week, startTime: { $lt: endTime }, endTime: { $gt: startTime } },
          { teacherID, week, startTime: { $lt: endTime }, endTime: { $gt: startTime } }
        ]
      };
 
      const existingSchedule = await checkOverlappingSchedule(overlapFilter);

      if (existingSchedule) {
        return res.status(400).json({ message: 'Schedule conflict detected. Please adjust the schedule.' });
      }

      const newSchedule = new Schedule({ sectionID, academicYear, quarter, subjectID, teacherID, startTime, endTime, week, classMode, room });
      await newSchedule.save();

      return res.status(201).json({ message: 'Schedule created successfully', schedule: newSchedule });
    } catch (error) {
      console.error(error)
      return res.status(500).json({ message: 'Error creating schedule', error });
    }
  },

  // Read all schedules with filters
  getSchedules: async (req, res) => {
    try { 
      const { sectionID, academicYear, quarter, teacherID } = req.query;
      const filter = {};
      if (sectionID) filter.sectionID = mongoose.Types.ObjectId(sectionID);
      if (teacherID) filter.teacherID = mongoose.Types.ObjectId(teacherID);
      if (academicYear) filter.academicYear = academicYear;
      if (quarter) filter.quarter = quarter;

      const schedules = await Schedule.find(filter)
        .populate("subjectID", "_id subjectName")
        .populate("teacherID", "_id firstName lastName")
        .populate("sectionID", "_id name grade");

        const formattedSchedules = schedules.map((schedule) => ({
          ...schedule.toObject(), // Convert Mongoose document to plain object
          subjectID: schedule.subjectID?._id || schedule.subjectID,
          subjectName: schedule.subjectID?.subjectName || "Unknown",
          teacherID: schedule.teacherID?._id || schedule.teacherID,
          teacherName: schedule.teacherID
            ? `${schedule.teacherID.firstName} ${schedule.teacherID.lastName}`
            : "Unknown",
        }));

      return res.status(200).json(formattedSchedules);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      return res.status(500).json({ message: "Error fetching schedules", error });
    }
  },

  importSchedules: async (req, res) => {
    const { sectionID, academicYear, quarter, schedules } = req.body;
  
    if (!Array.isArray(schedules)) {
      return res.status(400).json({ message: "Invalid data format." });
    }
  
    try {
      const [teachers, subjects, Section] = await Promise.all([
        require('../models/facultyModel').find().lean(),
        require('../models/subjectModel').find().lean(),
        require('../models/sectionModel').findById(sectionID).lean(),
      ]);
  
      if (!Section || !Section.isActive) {
        return res.status(400).json({ message: "Inactive or missing section." });
      }
  
      // Prepare teacher full names for matching
      const formattedTeachers = teachers.map(t => ({
        ...t,
        fullName: `${t.firstName || ""} ${t.middleName || ""} ${t.lastName || ""}`.replace(/\s+/g, " ").trim().toLowerCase()
      }));
  
      let successCount = 0;
      let errorCount = 0;
      const skipped = [];
  
      for (const r of schedules) {
        try {
          const teacherName = r.Teacher?.trim().toLowerCase();
          const subjectName = r.Subject?.trim();
  
          if (!teacherName || !subjectName) {
            skipped.push({ record: r, reason: "Missing Teacher or Subject" });
            errorCount++;
            continue;
          }
  
          const teacher = formattedTeachers.find(t => t.fullName === teacherName);
          const subject = subjects.find(s => s.subjectName.trim() === subjectName);
  
          if (!teacher) {
            skipped.push({ record: r, reason: "Teacher not found" });
            errorCount++;
            continue;
          }
          if (!teacher.isActive) {
            skipped.push({ record: r, reason: "Teacher is inactive" });
            errorCount++;
            continue;
          }
          if (!subject) {
            skipped.push({ record: r, reason: "Subject not found" });
            errorCount++;
            continue;
          }
  
          const rawStart = r["Start Time"];
          const rawEnd = r["End Time"];
          if (!rawStart || !rawEnd || !rawStart.includes(":") || !rawEnd.includes(":")) {
            skipped.push({ record: r, reason: "Invalid or missing time format" });
            errorCount++;
            continue;
          }
  
          const startTime = convertTo24HourFormat(rawStart);
          const endTime = convertTo24HourFormat(rawEnd);
          const week = r.Day;
          const room = r.Room;
  
          const overlapFilter = {
            academicYear,
            quarter,
            $or: [
              { sectionID, week, startTime: { $lt: endTime }, endTime: { $gt: startTime } },
              { room, week, startTime: { $lt: endTime }, endTime: { $gt: startTime } },
              { teacherID: teacher._id, week, startTime: { $lt: endTime }, endTime: { $gt: startTime } }
            ]
          };
  
          const conflict = await checkOverlappingSchedule(overlapFilter);
          if (conflict) {
            skipped.push({ record: r, reason: "Schedule conflict detected" });
            errorCount++;
            continue;
          }
  
          await Schedule.create({
            sectionID,
            academicYear,
            quarter,
            subjectID: subject._id,
            teacherID: teacher._id,
            startTime,
            endTime,
            week,
            classMode: r["Class Mode"],
            room,
          });
  
          successCount++;
        } catch (e) {
          console.error("Unexpected import error for:", r, "\nError:", e);
          skipped.push({ record: r, reason: "Unexpected error during processing" });
          errorCount++;
        }
      }
  
      return res.status(200).json({ successCount, errorCount, skipped });
    } catch (error) {
      console.error("Import error:", error);
      return res.status(500).json({ message: "Failed to import schedules", error: error.message });
    }
  },
  
  

  // Update a schedule
  updateSchedule: async (req, res) => {
    try {
      const { id } = req.params;
      let { sectionID, subjectID, teacherID, startTime, endTime, week, classMode, room, academicYear, quarter } = req.body;

      // Convert times to 24-hour format
      startTime = convertTo24HourFormat(startTime);
      endTime = convertTo24HourFormat(endTime);

      // Exclude the current schedule from conflict check
      const existingSchedule = await Schedule.findOne({
        _id: { $ne: id },
        academicYear,
        quarter,
        $or: [
          { sectionID, week, startTime: { $lt: endTime }, endTime: { $gt: startTime } },
          { room, week, startTime: { $lt: endTime }, endTime: { $gt: startTime } },
          { teacherID, week, startTime: { $lt: endTime }, endTime: { $gt: startTime } }
        ]
      });

      if (existingSchedule) {
        return res.status(400).json({ message: 'Schedule conflict detected. Please adjust the schedule.' });
      }

      const updatedSchedule = await Schedule.findByIdAndUpdate(
        id,
        { sectionID, subjectID, teacherID, startTime, endTime, week, classMode, room },
        { new: true }
      );

      return res.status(200).json({ message: 'Schedule updated successfully', schedule: updatedSchedule });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error updating schedule', error });
    }
  },


  // Delete a schedule
  deleteSchedule: async (req, res) => {
    try {
      const { id } = req.params;

      await Schedule.findByIdAndDelete(id);

      return res.status(200).json({ message: 'Schedule deleted successfully' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error deleting schedule', error });
    }
  }
};
