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
});

module.exports = mongoose.model("SchoolYear", schoolYearSchema);
