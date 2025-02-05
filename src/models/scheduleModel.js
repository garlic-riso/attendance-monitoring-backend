const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  scheduleID: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
  },
  sectionID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
    required: true,
  },
  subjectID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  },
  teacherID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true,
  },
  startTime: {
    type: String,
    required: true,
    match: /^([01]\d|2[0-3]):([0-5]\d)$/ // Ensures 24-hour format HH:MM
  },
  endTime: {
    type: String,
    required: true,
    match: /^([01]\d|2[0-3]):([0-5]\d)$/ // Ensures 24-hour format HH:MM
  },
  week: {
    type: String,
    required: true,
  },
  classMode: {
    type: String,
    enum: ['Online', 'Face-to-Face', 'Hybrid'],
    required: true,
  },
  room: {
    type: String,
    default: null,
  },
  academicYear: {
    type: String,
    required: true, // Example format: '2024-2025'
  },
  quarter: {
    type: String,
    enum: ['First', 'Second', 'Third', 'Fourth'], // Defines the allowable quarters
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Schedule', scheduleSchema);