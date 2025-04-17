const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  subjectID: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
  },
  subjectName: {
    type: String,
    required: true,
    trim: true,
  },
  gradeLevel: {
    type: Number,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Subject', subjectSchema);
