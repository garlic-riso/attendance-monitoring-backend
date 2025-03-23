const express = require("express");
const { getAttendanceData, createAttendance, updateAttendance } = require('../controllers/attendanceController');

const router = express.Router();

router.get('/', getAttendanceData);
router.post('/', createAttendance);
router.put('/:id', updateAttendance);

module.exports = router;
