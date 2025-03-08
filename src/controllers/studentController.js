const mongoose = require("mongoose");
const Student = require("../models/studentModel");

exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .populate({
        path: "parentID",
        model: "Parent",
        select: "firstName lastName",
      })
      .populate({
        path: "sectionID",
        model: "Section",
        select: "grade name",
      });

    // Format the response
    const formattedStudents = students.map(student => ({
      ...student.toObject(),
      parent: student.parentID 
        ? `${student.parentID.firstName} ${student.parentID.lastName}` 
        : "N/A",
      section: student.sectionID 
        ? `Grade ${student.sectionID.grade} - ${student.sectionID.name}`
        : "N/A",
    }));

    res.status(200).json(formattedStudents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new student
exports.createStudent = async (req, res) => {
  try {
    const newStudent = new Student(req.body);
    await newStudent.save();
    res.status(201).json(newStudent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update an existing student
exports.updateStudent = async (req, res) => {
  try {
    if (req.body.parentID) {
      req.body.parentID = new mongoose.Types.ObjectId(req.body.parentID);
    }
    if (req.body.sectionID) {
      req.body.sectionID = new mongoose.Types.ObjectId(req.body.sectionID);
    }
    const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedStudent) return res.status(404).json({ message: "Student not found" });
    res.json(updatedStudent);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err.message });
  }
};

// Delete a student
exports.deleteStudent = async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);
    if (!deletedStudent) return res.status(404).json({ message: "Student not found" });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
