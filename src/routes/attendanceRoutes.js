const express = require("express");
const {
  getAttendanceData,
  createAttendance,
  updateAttendance,
  getDailySummary,
  getTopAbsentees,
  getStudentAttendanceByDateRange,
} = require("../controllers/attendanceController");
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

module.exports = router;
