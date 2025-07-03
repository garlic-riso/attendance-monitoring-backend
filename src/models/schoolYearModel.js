const mongoose = require("mongoose");

const schoolYearSchema = new mongoose.Schema({
  label: {
    type: String, // e.g., "2025–2026"
    required: true,
    unique: true,
  },
  isCurrent: {
    type: Boolean,
    default: false,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("SchoolYear", schoolYearSchema);
