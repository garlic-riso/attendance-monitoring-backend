const express = require("express");
const {
  getAttendanceData,
  createAttendance,
  updateAttendance,
} = require("../controllers/attendanceController");
const {
  getDailySummary,
  getTopAbsentees,
  getStudentAttendanceByDateRange,
  getMonthlyTrend,
  getPerfectAttendance,
  getYearlyTrend,
  getDailyClassModeBreakdown,
  getAttendanceReport,
  getStudentBasedAttendanceReport,
  getAttendanceReportExport,
} = require("../controllers/reportsController");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const router = express.Router();
router.use(authenticate);

router.get("/", authorize(["admin", "faculty", "student", "parent"]), getAttendanceData);
router.post("/", authorize(["admin", "faculty"]), createAttendance);
router.put("/:id", authorize(["admin", "faculty"]), updateAttendance);
router.get("/daily-summary", authorize(["admin", "faculty"]), getDailySummary);
router.get("/top-absentees", authorize(["admin", "faculty"]), getTopAbsentees);
router.get("/student-attendance", authorize(["student", "parent"]), getStudentAttendanceByDateRange);
router.get("/monthly-trends", getMonthlyTrend);
router.get("/perfect", authorize(["admin", "faculty"]), getPerfectAttendance);
router.get("/yearly-trends", authorize(["admin", "faculty"]), getYearlyTrend);
router.get("/daily-classmode-breakdown", getDailyClassModeBreakdown);
router.get("/report", authorize(["admin", "faculty"]), getAttendanceReport);
router.get('/report/student-based', authorize(["admin", "faculty"]), getStudentBasedAttendanceReport);
router.get("/report/export", authorize(["admin", "faculty"]), getAttendanceReportExport);

module.exports = router;
