// src/models/facultyModel.js
const mongoose = require("mongoose");

const facultySchema = new mongoose.Schema(
  {
    teacherID: {
      type: mongoose.Schema.Types.ObjectId,
      auto: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    specialization: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Faculty = mongoose.model("Faculty", facultySchema);

module.exports = Faculty;
