// src/controllers/facultyController.js
const Faculty = require("../models/facultyModel");

// Fetch all faculty members
exports.getFaculties = async (req, res) => {
  try {
    console.log("GET /api/teachers triggered");
    console.log("Headers:", req.headers);
    console.log("User:", req.user);
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
  const records = req.body;
  const errors = [];

  for (let i = 0; i < records.length; i++) {
    const { name, email, specialization } = records[i];
    if (!name || !email || !specialization) {
      errors.push("Missing required fields.");
      continue;
    }

    try {
      const faculty = new Faculty({ name, email, specialization });
      await faculty.save();
    } catch (err) {
      errors.push(err.message || "Validation failed.");
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  res.status(200).json({ message: "Bulk import complete." });
};

