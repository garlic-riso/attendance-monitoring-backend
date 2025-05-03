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

exports.getStudentAttendanceByDateRange = async (req, res) => {
  try {
    const { studentID, startDate, endDate } = req.query;

    if (!studentID || !startDate || !endDate) {
      return res.status(400).json({ message: "Missing required filters" });
    }

    const attendance = await Attendance.find({
      studentID,
      date: { $gte: new Date(startDate), $lte: new Date(endDate) },
    })
    .populate({
      path: "scheduleID",
      select: "classMode subjectID",
      populate: {
        path: "subjectID",
        select: "subjectName",
        model: "Subject",
      },
    })
    
    

    console.log("Populated Attendance Data:", attendance); // Debugging log

    const response = attendance.map((record) => ({
      ...record.toObject(),
      classMode: record.scheduleID?.classMode || "N/A",
      subject: record.scheduleID?.subjectID?.subjectName || "N/A",
    }));

    res.json(response);
  } catch (err) {
    console.error("Error fetching student attendance:", err);
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

exports.getDailySummary = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: "Missing date" });

    const dayStart = new Date(date);
    dayStart.setUTCHours(0, 0, 0, 0);

    const dayEnd = new Date(dayStart);
    dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

    const summary = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: dayStart, $lt: dayEnd },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {
      Present: 0,
      Absent: 0,
      Tardy: 0,
      Excused: 0,
    };

    summary.forEach(({ _id, count }) => {
      result[_id] = count;
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get daily summary" });
  }
};

exports.getTopAbsentees = async (req, res) => {
  try {
    const { startDate, endDate, limit = 10 } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Missing date range" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const absences = await Attendance.aggregate([
      {
        $match: {
          status: "Absent",
          date: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: "$studentID",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: parseInt(limit),
      },
      {
        $lookup: {
          from: "students",
          localField: "_id",
          foreignField: "_id",
          as: "student",
        },
      },
      {
        $unwind: "$student",
      },
      {
        $project: {
          studentID: "$_id",
          fullName: {
            $concat: ["$student.lastName", ", ", "$student.firstName"],
          },
          count: 1,
        },
      },
    ]);

    res.json(absences);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get top absentees" });
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
