const Schedule = require('../models/scheduleModel'); // Adjust the path as needed

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
      let { sectionID, subjectID, teacherID, startTime, endTime, week, classMode, room } = req.body;

      // Convert times to 24-hour format
      startTime = convertTo24HourFormat(startTime);
      endTime = convertTo24HourFormat(endTime);

      // Check for overlapping schedules
      const overlapFilter = {
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

      const newSchedule = new Schedule({ sectionID, subjectID, teacherID, startTime, endTime, week, classMode, room });
      await newSchedule.save();

      return res.status(201).json({ message: 'Schedule created successfully', schedule: newSchedule });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error creating schedule', error });
    }
  },

  // Read all schedules
  getSchedules: async (req, res) => {
    try {
      const schedules = await Schedule.find()
        .populate({
          path: 'subjectID',
          select: 'subjectName',
        })
        .populate({
          path: 'teacherID',
          select: 'name',
        });

      // Format schedules with subjectName and teacherName
      const formattedSchedules = schedules.map((schedule) => ({
        ...schedule._doc,
        subjectName: schedule.subjectID?.subjectName || 'Unknown',
        teacherName: schedule.teacherID?.name || 'Unknown',
      }));

      return res.status(200).json(formattedSchedules);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      return res.status(500).json({ message: 'Error fetching schedules', error });
    }
  },

  // Update a schedule
  updateSchedule: async (req, res) => {
    try {
      const { id } = req.params;
      let { sectionID, subjectID, teacherID, startTime, endTime, week, classMode, room } = req.body;

      // Convert times to 24-hour format
      startTime = convertTo24HourFormat(startTime);
      endTime = convertTo24HourFormat(endTime);

      // Check for overlapping schedules
      const overlapFilter = {
        $or: [
          { sectionID, week, startTime: { $lt: endTime }, endTime: { $gt: startTime }, _id: { $ne: id } },
          { room, week, startTime: { $lt: endTime }, endTime: { $gt: startTime }, _id: { $ne: id } },
          { teacherID, week, startTime: { $lt: endTime }, endTime: { $gt: startTime }, _id: { $ne: id } }
        ]
      };

      const existingSchedule = await checkOverlappingSchedule(overlapFilter);

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
