const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "First name is required"],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, "Last name is required"],
    trim: true,
  },
  middleName: {
    type: String,
    trim: true,
  },
  sectionID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Section",
    required: [true, "Section ID is required"],
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: [true, "Gender is required"],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  dateEnrolled: {
    type: Date,
    required: [true, "Enrollment date is required"],
  },
  parentID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Parent",
    required: [true, "Parent ID is required"],
  },
  emailAddress: {
    type: String,
    required: [true, "Email address is required"],
    unique: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    trim: true,
  },
  program: {
    type: String,
    required: [true, "Program is required"],
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  role: {
    type: String,
    default: "Student",
    enum: ["Student"],
  },
});

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
