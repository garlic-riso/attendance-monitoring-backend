// src/controllers/facultyController.js
const Faculty = require("../models/facultyModel");

// Fetch all faculty members
exports.getFaculties = async (req, res) => {
  try {
    const faculties = await Faculty.find();
    res.status(200).json(faculties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new faculty member
exports.createFaculty = async (req, res) => {
  try {
    const { name, email, specialization } = req.body;
    const faculty = new Faculty({ name, email, specialization });
    await faculty.save();
    res.status(201).json(faculty);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update an existing faculty member
exports.updateFaculty = async (req, res) => {
  try {
    const updatedFaculty = await Faculty.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedFaculty) return res.status(404).json({ message: "Faculty not found" });
    res.json(updatedFaculty);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete a faculty member
exports.deleteFaculty = async (req, res) => {
  try {
    const deletedFaculty = await Faculty.findByIdAndDelete(req.params.id);
    if (!deletedFaculty) return res.status(404).json({ message: "Faculty not found" });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Bulk import faculty members
exports.bulkImportFaculties = async (req, res) => {
  try {
    const { teachers } = req.body;
    if (!Array.isArray(teachers) || teachers.length === 0) {
      return res.status(400).json({ message: "Invalid or empty data provided." });
    }
    await Faculty.insertMany(teachers);
    res.status(201).json({ message: "Faculty members imported successfully." });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
