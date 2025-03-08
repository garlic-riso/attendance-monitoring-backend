const mongoose = require("mongoose");

const DefaultScheduleSchema = new mongoose.Schema({
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Section", // Reference to the Section model
    required: true,
  },
  academicYear: {
    type: String,
    required: true,
  },
  quarter: {
    type: String,
    required: true,
    min: 1,
    max: 4, // Assuming 4 quarters in an academic year
  },
}, { timestamps: true });

const DefaultSchedule = mongoose.model("DefaultSchedule", DefaultScheduleSchema);

module.exports = DefaultSchedule;
