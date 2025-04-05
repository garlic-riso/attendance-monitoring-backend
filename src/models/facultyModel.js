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
    role: {
      type: String,
      default: "Faculty",
      enum: ["Faculty"],
    },
  },
  { timestamps: true }
);

const Faculty = mongoose.model("Faculty", facultySchema);

module.exports = Faculty;
