// src/controllers/sectionController.js
const Section = require("../models/sectionModel");

// Fetch all sections
exports.getSections = async (req, res) => {
  try {
    const sections = await Section.find();
    res.status(200).json(sections);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new section
exports.createSection = async (req, res) => {
  try {
    const { sectionId, name, grade } = req.body;
    const newSection = new Section({ sectionId, name, grade });
    await newSection.save();
    res.status(201).json(newSection);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update an existing section
exports.updateSection = async (req, res) => {
  try {
    const updatedSection = await Section.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedSection) return res.status(404).json({ message: "Section not found" });
    res.json(updatedSection);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete a section
exports.deleteSection = async (req, res) => {
  try {
    const deletedSection = await Section.findByIdAndDelete(req.params.id);
    if (!deletedSection) return res.status(404).json({ message: "Section not found" });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
