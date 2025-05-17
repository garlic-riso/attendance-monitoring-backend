// src/models/sectionModel.js
const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  grade: {
    type: Number,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  advisorID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Faculty",
    required: false, // optional
  }
}, { timestamps: true });

sectionSchema.index({ name: 1}, { unique: true });

const Section = mongoose.model("Section", sectionSchema);

module.exports = Section;
