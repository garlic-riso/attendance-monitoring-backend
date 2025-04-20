const mongoose = require("mongoose");
const Student = require("../models/studentModel");
const Section = require("../models/sectionModel");
const Subject = require("../models/subjectModel");
const Attendance = require("../models/attendanceModel");
const Schedule = require("../models/scheduleModel");

exports.getAttendanceData = async (req, res) => {
  try {
    const { sectionID, subjectID, date } = req.query;
    if (!sectionID || !subjectID || !date) {
      return res.status(400).json({ message: "Missing required filters" });
    }

    const dayOfWeek = new Date(date).toLocaleDateString("en-US", { weekday: "long" });

    const schedule = await Schedule.findOne({
      sectionID,
      subjectID,
      week: dayOfWeek,
    });

    if (!schedule) {
      return res.json({ students: [] });
    }

    const students = await Student.aggregate([
      {
        $match: {
          sectionID: new mongoose.Types.ObjectId(sectionID),
          isActive: true, // Only include active students
        },
      },
      {
        $lookup: {
          from: "attendances",
          let: { studentId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$studentID", "$$studentId"] },
                    { $eq: ["$scheduleID", schedule._id] },
                    { $eq: ["$date", new Date(date)] },
                  ],
                },
              },
            },
          ],
          as: "attendanceRecord",
        },
      },
      {
        $addFields: {
          attendance: { $arrayElemAt: ["$attendanceRecord", 0] },
        },
      },
      {
        $project: {
          _id: 1,
          fullName: { $concat: ["$lastName", ", ", "$firstName"] },
          gender: 1,
          emailAddress: 1,
          program: 1,
          scheduleID: schedule._id,
          attendanceID: "$attendance._id",
          attendanceStatus: "$attendance.status",
          timeIn: "$attendance.timeIn",
          remarks: "$attendance.remarks",
          excuseLetter: "$attendance.excuseLetter",
        },
      },
    ]);

    res.json({ students });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


exports.createAttendance = async (req, res) => {
  try {
    const { scheduleID, studentID, timeIn, status, remarks, excuseLetter, date } = req.body;

    const newAttendance = new Attendance({
      scheduleID,
      studentID,
      timeIn,
      status,
      remarks,
      excuseLetter,
      date
    });

    await newAttendance.save();
    res.status(201).json(newAttendance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create attendance" });
  }
};

exports.updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedAttendance = await Attendance.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedAttendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    res.json(updatedAttendance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update attendance" });
  }
};

exports.deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Attendance.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    res.json({ message: "Attendance deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete attendance" });
  }
};
