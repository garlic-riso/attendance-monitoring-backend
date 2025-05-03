const mongoose = require("mongoose");
const Student = require("../models/studentModel");

exports.getStudents = async (req, res) => {
  try {
    const onlyActive = req.query.active === "true";
    const filter = onlyActive ? { isActive: true } : {};

    const students = await Student.find(filter)
      .populate("parentID", "_id firstName lastName")
      .populate({
        path: "sectionID",
        model: "Section",
        select: "grade name",
      });

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

// GET /api/students/by-parent?parentID=xxx
exports.getStudentsByParent = async (req, res) => {
  try {
    const { parentID } = req.query;

    if (!parentID) {
      return res.status(400).json({ message: "Missing parentID" });
    }

    const students = await Student.find({
      parentID,
      isActive: true,
    }).select("_id firstName lastName");

    res.json(students);
  } catch (error) {
    console.error("Failed to fetch students by parent:", error);
    res.status(500).json({ message: "Server error" });
  }
};



// Create a new student
exports.createStudent = async (req, res) => {
  try {
    const newStudent = new Student({
      ...req.body,
      isActive: req.body.isActive ?? true
    });
    await newStudent.save();
    res.status(201).json(newStudent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Bulk import students
exports.bulkImportStudents = async (req, res) => {
  try {
    const students = req.body;

    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ message: "No students provided for import." });
    }

    const requiredFields = [
      "firstName",
      "middleName",
      "lastName",
      "emailAddress",
      "gender",
      "program",
      "isActive",
      "dateEnrolled",
      "parentID",
      "sectionID"
    ];

    const invalidRows = [];

    students.forEach((student, index) => {
      const keys = Object.keys(student);
      const missing = requiredFields.filter((field) => !keys.includes(field));
      if (missing.length > 0) {
        invalidRows.push({ row: index + 1, missingFields: missing });
      }
    });

    if (invalidRows.length > 0) {
      return res.status(400).json({
        message: "Invalid column names or missing fields in some rows.",
        errors: invalidRows,
      });
    }

    const formattedStudents = students.map((student) => ({
      ...student,
      isActive: student.isActive ?? true,
      parentID: new mongoose.Types.ObjectId(student.parentID),
      sectionID: new mongoose.Types.ObjectId(student.sectionID),
    }));

    const result = await Student.insertMany(formattedStudents);
    res.status(201).json({ message: "Bulk import successful", insertedCount: result.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Bulk import failed", error: err.message });
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
