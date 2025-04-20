const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  attendanceID: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
  },
  scheduleID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Schedule',
    required: true,
  },
  studentID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  timeIn: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Tardy', 'Excused'],
    required: true,
  },
  remarks: {
    type: String,
    default: null,
  },
  excuseLetter: {
    type: String, // Assuming this stores a file path or URL
    default: null,
  },
  date: {
    type: Date,
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Attendance', attendanceSchema);
