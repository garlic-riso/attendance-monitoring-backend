const mongoose = require("mongoose");
const ExcelJS = require("exceljs");
const Student = require("../models/studentModel");
const Section = require("../models/sectionModel");
const Subject = require("../models/subjectModel");
const Attendance = require("../models/attendanceModel");
const Schedule = require("../models/scheduleModel");

// Daily Summary
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

// Top Absentees
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

// Student Attendance By Date Range
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

// Monthly Trend
exports.getMonthlyTrend = async (req, res) => {
  try {
    const { startDate, endDate, gradeLevel, sectionID, studentID } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Missing date range" });
    }

    const matchConditions = {
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    };

    if (studentID) matchConditions.studentID = new mongoose.Types.ObjectId(studentID);

    if (sectionID || gradeLevel) {
      const studentMatch = { isActive: true };
      if (sectionID) studentMatch.sectionID = new mongoose.Types.ObjectId(sectionID);
      if (gradeLevel) studentMatch.gradeLevel = parseInt(gradeLevel);

      const students = await Student.find(studentMatch).select("_id");
      const studentIds = students.map(s => s._id);
      matchConditions.studentID = { $in: studentIds };
    }

    const trends = await Attendance.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: {
            date: "$date",
            status: "$status",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          records: {
            $push: {
              status: "$_id.status",
              count: "$count",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          Present: {
            $let: {
              vars: {
                present: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$records",
                        as: "r",
                        cond: { $eq: ["$$r.status", "Present"] },
                      },
                    },
                    0,
                  ],
                },
              },
              in: "$$present.count",
            },
          },
          Absent: {
            $let: {
              vars: {
                absent: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$records",
                        as: "r",
                        cond: { $eq: ["$$r.status", "Absent"] },
                      },
                    },
                    0,
                  ],
                },
              },
              in: "$$absent.count",
            },
          },
          Tardy: {
            $let: {
              vars: {
                tardy: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$records",
                        as: "r",
                        cond: { $eq: ["$$r.status", "Tardy"] },
                      },
                    },
                    0,
                  ],
                },
              },
              in: "$$tardy.count",
            },
          },
        },
      },
    ]);

    res.json(trends);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get monthly trend" });
  }
};

// Yearly Trend
exports.getYearlyTrend = async (req, res) => {
  try {
    const { schoolYear, gradeLevel, sectionID } = req.query;
    if (!schoolYear) return res.status(400).json({ message: "Missing schoolYear" });

    const sy = await mongoose.connection.collection("schoolyears").findOne({ _id: new mongoose.Types.ObjectId(schoolYear) });
    if (!sy || !sy.startDate || !sy.endDate) return res.status(404).json({ message: "Invalid school year" });

    const matchConditions = {
      date: {
        $gte: new Date(sy.startDate),
        $lte: new Date(sy.endDate),
      },
    };

    // Only add sectionID filter if sectionID is provided and not an empty string
    if ((sectionID && sectionID !== "") || gradeLevel) {
      const studentMatch = { isActive: true };
      if (sectionID && sectionID !== "") studentMatch.sectionID = new mongoose.Types.ObjectId(sectionID);
      if (gradeLevel) studentMatch.gradeLevel = parseInt(gradeLevel);
      const students = await Student.find(studentMatch).select("_id");
      const studentIds = students.map(s => s._id);
      matchConditions.studentID = { $in: studentIds };
    }

    const trends = await Attendance.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: {
            month: { $dateToString: { format: "%Y-%m", date: "$date" } },
            status: "$status",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.month",
          records: {
            $push: {
              status: "$_id.status",
              count: "$count",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          month: "$_id",
          Present: {
            $let: {
              vars: {
                present: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$records",
                        as: "r",
                        cond: { $eq: ["$$r.status", "Present"] },
                      },
                    },
                    0,
                  ],
                },
              },
              in: "$$present.count",
            },
          },
          Absent: {
            $let: {
              vars: {
                absent: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$records",
                        as: "r",
                        cond: { $eq: ["$$r.status", "Absent"] },
                      },
                    },
                    0,
                  ],
                },
              },
              in: "$$absent.count",
            },
          },
          Tardy: {
            $let: {
              vars: {
                tardy: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$records",
                        as: "r",
                        cond: { $eq: ["$$r.status", "Tardy"] },
                      },
                    },
                    0,
                  ],
                },
              },
              in: "$$tardy.count",
            },
          },
        },
      },
      { $sort: { month: 1 } }
    ]);

    res.json(trends);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get yearly trend" });
  }
};

// Perfect Attendance
exports.getPerfectAttendance = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Missing date range" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const students = await Student.find({ isActive: true });

    const perfect = [];

    for (const student of students) {
      const attendance = await Attendance.find({
        studentID: student._id,
        date: { $gte: start, $lte: end },
      });

      const hasIssue = attendance.some((a) => a.status !== "Present");

      if (!hasIssue && attendance.length > 0) {
        perfect.push({
          studentID: student._id,
          fullName: `${student.lastName}, ${student.firstName}`,
        });
      }
    }

    res.json(perfect);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get perfect attendance" });
  }
};

// Daily Class Mode Breakdown
exports.getDailyClassModeBreakdown = async (req, res) => {
  try {
    const { date, gradeLevel, sectionID } = req.query;
    if (!date) return res.status(400).json({ message: "Missing date" });

    const dayStart = new Date(date);
    dayStart.setUTCHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

    let match = {
      date: { $gte: dayStart, $lt: dayEnd },
    };

    // Optional: filter by section or grade if needed
    if (sectionID || gradeLevel) {
      const studentMatch = { isActive: true };
      if (sectionID) studentMatch.sectionID = new mongoose.Types.ObjectId(sectionID);
      if (gradeLevel) studentMatch.gradeLevel = parseInt(gradeLevel);
      const students = await mongoose.model("Student").find(studentMatch, "_id");
      const studentIDs = students.map(s => s._id);
      match.studentID = { $in: studentIDs };
    }

    const breakdown = await Attendance.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$classMode",
          value: { $sum: 1 }
        }
      }
    ]);

    // Ensure all class modes are present in the result
    const modes = ["Online", "Face-to-Face", "Homeschooling"];
    const result = modes.map(mode => ({
      name: mode,
      value: breakdown.find(b => b._id === mode)?.value || 0
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get class mode breakdown" });
  }
};

// Attendance Report
exports.getAttendanceReport = async (req, res) => {
  try {
    const { sectionID, month, schoolYear, quarter, subjectID } = req.query; // <-- subjectID

    // Build match conditions for Attendance and Schedule
    const match = {};
    const scheduleMatch = {};

    if (sectionID) scheduleMatch.sectionID = new mongoose.Types.ObjectId(sectionID);
    if (subjectID) scheduleMatch.subjectID = new mongoose.Types.ObjectId(subjectID); // <-- subject filter
    if (quarter) scheduleMatch.quarter = ["First", "Second", "Third", "Fourth"][parseInt(quarter) - 1];
    if (schoolYear) {
      // Try to resolve ObjectId to label if needed
      if (mongoose.Types.ObjectId.isValid(schoolYear)) {
        const syDoc = await mongoose.connection.collection("schoolyears").findOne({ _id: new mongoose.Types.ObjectId(schoolYear) });
        if (syDoc && syDoc.label) {
          scheduleMatch.academicYear = syDoc.label;
        }
      } else {
        scheduleMatch.academicYear = schoolYear;
      }
    }

    // Find schedules that match the filters
    const schedules = await Schedule.find(scheduleMatch).select("_id sectionID subjectID teacherID academicYear quarter");
    const scheduleIds = schedules.map(s => s._id);

    if (scheduleIds.length === 0) {
      return res.json([]);
    }

    match.scheduleID = { $in: scheduleIds };

    // Filter by month if provided
    if (month) {
      // month format: YYYY-MM
      const [year, mon] = month.split("-");
      const start = new Date(`${year}-${mon}-01`);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      match.date = { $gte: start, $lt: end };
    }

    // Aggregate attendance records
    const attendance = await Attendance.aggregate([
      { $match: match },
      {
        $lookup: {
          from: "students",
          localField: "studentID",
          foreignField: "_id",
          as: "student"
        }
      },
      { $unwind: "$student" },
      {
        $lookup: {
          from: "sections",
          localField: "student.sectionID",
          foreignField: "_id",
          as: "section"
        }
      },
      { $unwind: "$section" },
      {
        $lookup: {
          from: "schedules",
          localField: "scheduleID",
          foreignField: "_id",
          as: "schedule"
        }
      },
      { $unwind: "$schedule" },
      {
        $lookup: {
          from: "subjects",
          localField: "schedule.subjectID",
          foreignField: "_id",
          as: "subject"
        }
      },
      { $unwind: "$subject" },
      {
        $project: {
          _id: 1,
          fullName: {
            $concat: [
              "$student.lastName", ", ", "$student.firstName",
              {
                $cond: [
                  { $ne: [ { $ifNull: [ "$student.middleName", "" ] }, "" ] },
                  { $concat: [ " ", "$student.middleName" ] },
                  ""
                ]
              }
            ]
          },
          sectionName: "$section.name",
          subjectName: "$subject.subjectName", // <-- Add this line
          date: 1,
          status: 1,
          classMode: 1
        }
      },
      { $sort: { date: 1, fullName: 1 } }
    ]);

    res.json(attendance);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get attendance report" });
  }
};

// Student-Based Attendance Report
exports.getStudentBasedAttendanceReport = async (req, res) => {
  try {
    const { studentID, month, schoolYear, quarter, subjectID } = req.query;

    if (!studentID) {
      return res.status(400).json({ message: "Missing studentID" });
    }

    // Build match conditions for Attendance and Schedule
    const match = { studentID: new mongoose.Types.ObjectId(studentID) };
    const scheduleMatch = {};

    if (subjectID) scheduleMatch.subjectID = new mongoose.Types.ObjectId(subjectID);
    if (quarter) scheduleMatch.quarter = ["First", "Second", "Third", "Fourth"][parseInt(quarter) - 1];
    if (schoolYear) {
      if (mongoose.Types.ObjectId.isValid(schoolYear)) {
        const syDoc = await mongoose.connection.collection("schoolyears").findOne({ _id: new mongoose.Types.ObjectId(schoolYear) });
        if (syDoc && syDoc.label) {
          scheduleMatch.academicYear = syDoc.label;
        }
      } else {
        scheduleMatch.academicYear = schoolYear;
      }
    }

    // Find schedules that match the filters
    const schedules = await Schedule.find(scheduleMatch).select("_id sectionID subjectID teacherID academicYear quarter");
    const scheduleIds = schedules.map(s => s._id);

    if (scheduleIds.length === 0) {
      return res.json([]);
    }

    match.scheduleID = { $in: scheduleIds };

    // Filter by month if provided
    if (month) {
      // month format: YYYY-MM
      const [year, mon] = month.split("-");
      const start = new Date(`${year}-${mon}-01`);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      match.date = { $gte: start, $lt: end };
    }

    // Aggregate attendance records
    const attendance = await Attendance.aggregate([
      { $match: match },
      {
        $lookup: {
          from: "students",
          localField: "studentID",
          foreignField: "_id",
          as: "student"
        }
      },
      { $unwind: "$student" },
      {
        $lookup: {
          from: "sections",
          localField: "student.sectionID",
          foreignField: "_id",
          as: "section"
        }
      },
      { $unwind: "$section" },
      {
        $lookup: {
          from: "schedules",
          localField: "scheduleID",
          foreignField: "_id",
          as: "schedule"
        }
      },
      { $unwind: "$schedule" },
      {
        $lookup: {
          from: "subjects",
          localField: "schedule.subjectID",
          foreignField: "_id",
          as: "subject"
        }
      },
      { $unwind: "$subject" },
      {
        $project: {
          _id: 1,
          fullName: {
            $concat: [
              "$student.lastName", ", ", "$student.firstName",
              {
                $cond: [
                  { $ne: [ { $ifNull: [ "$student.middleName", "" ] }, "" ] },
                  { $concat: [ " ", "$student.middleName" ] },
                  ""
                ]
              }
            ]
          },
          sectionName: "$section.name",
          subjectName: "$subject.subjectName",
          date: 1,
          status: 1,
          classMode: 1
        }
      },
      { $sort: { date: 1, fullName: 1 } }
    ]);

    res.json(attendance);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get student-based attendance report" });
  }
};

// Attendance Report Export
exports.getAttendanceReportExport = async (req, res) => {
  try {
    const { sectionID, month, schoolYear, quarter, subjectID, studentID } = req.query;

    // Build match conditions for Attendance and Schedule
    const match = {};
    const scheduleMatch = {};

    // If studentID is present, use student-based logic
    if (studentID) {
      match.studentID = new mongoose.Types.ObjectId(studentID);
    }
    if (sectionID) scheduleMatch.sectionID = new mongoose.Types.ObjectId(sectionID);
    if (subjectID) scheduleMatch.subjectID = new mongoose.Types.ObjectId(subjectID);
    if (quarter) scheduleMatch.quarter = ["First", "Second", "Third", "Fourth"][parseInt(quarter) - 1];
    if (schoolYear) {
      if (mongoose.Types.ObjectId.isValid(schoolYear)) {
        const syDoc = await mongoose.connection.collection("schoolyears").findOne({ _id: new mongoose.Types.ObjectId(schoolYear) });
        if (syDoc && syDoc.label) {
          scheduleMatch.academicYear = syDoc.label;
        }
      } else {
        scheduleMatch.academicYear = schoolYear;
      }
    }

    // Find schedules that match the filters
    const schedules = await Schedule.find(scheduleMatch).select("_id sectionID subjectID teacherID academicYear quarter");
    const scheduleIds = schedules.map(s => s._id);

    if (scheduleIds.length === 0) {
      // Return an empty Excel file
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Attendance Report");
      worksheet.addRow(["No data found"]);
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", "attachment; filename=attendance_report.xlsx");
      await workbook.xlsx.write(res);
      return res.end();
    }

    match.scheduleID = { $in: scheduleIds };

    // Filter by month if provided
    if (month) {
      const [year, mon] = month.split("-");
      const start = new Date(`${year}-${mon}-01`);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      match.date = { $gte: start, $lt: end };
    }

    // Aggregate attendance records
    const attendance = await Attendance.aggregate([
      { $match: match },
      {
        $lookup: {
          from: "students",
          localField: "studentID",
          foreignField: "_id",
          as: "student"
        }
      },
      { $unwind: "$student" },
      {
        $lookup: {
          from: "sections",
          localField: "student.sectionID",
          foreignField: "_id",
          as: "section"
        }
      },
      { $unwind: "$section" },
      {
        $lookup: {
          from: "schedules",
          localField: "scheduleID",
          foreignField: "_id",
          as: "schedule"
        }
      },
      { $unwind: "$schedule" },
      {
        $lookup: {
          from: "subjects",
          localField: "schedule.subjectID",
          foreignField: "_id",
          as: "subject"
        }
      },
      { $unwind: "$subject" },
      {
        $project: {
          _id: 1,
          fullName: {
            $concat: [
              "$student.lastName", ", ", "$student.firstName",
              {
                $cond: [
                  { $ne: [ { $ifNull: [ "$student.middleName", "" ] }, "" ] },
                  { $concat: [ " ", "$student.middleName" ] },
                  ""
                ]
              }
            ]
          },
          sectionName: "$section.name",
          subjectName: "$subject.subjectName",
          date: 1,
          status: 1,
          classMode: 1
        }
      },
      { $sort: { date: 1, fullName: 1 } }
    ]);

    // Generate Excel file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Attendance Report");

    // Add header row
    worksheet.addRow(["Student Name", "Section", "Subject", "Date", "Status", "Class Mode"]);

    // Add data rows
    attendance.forEach(record => {
      worksheet.addRow([
        record.fullName,
        record.sectionName,
        record.subjectName,
        record.date ? record.date.toISOString().split("T")[0] : "",
        record.status,
        record.classMode
      ]);
    });

    // Set response headers
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=attendance_report.xlsx");

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to export attendance report" });
  }
};