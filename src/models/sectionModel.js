// src/models/sectionModel.js
const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema({
  sectionId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  grade: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

const Section = mongoose.model("Section", sectionSchema);

module.exports = Section;
