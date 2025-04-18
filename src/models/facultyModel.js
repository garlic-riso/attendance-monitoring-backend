// src/models/facultyModel.js
const mongoose = require("mongoose");

const facultySchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    middleName: {
      type: String,
      default: "",
    },
    lastName: {
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
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Faculty = mongoose.model("Faculty", facultySchema);

module.exports = Faculty;
