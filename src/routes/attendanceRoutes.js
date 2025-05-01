const express = require("express");
const { getAttendanceData, createAttendance, updateAttendance } = require('../controllers/attendanceController');
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const router = express.Router();
router.use(authenticate);


router.get('/', authorize(["admin", "faculty", "student", "parent"]), getAttendanceData);
router.post('/', authorize(["admin", "faculty"]), createAttendance);
router.put('/:id', authorize(["admin", "faculty"]), updateAttendance);

module.exports = router;
