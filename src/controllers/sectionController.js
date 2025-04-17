// src/controllers/sectionController.js
const Section = require("../models/sectionModel");
const Student = require("../models/studentModel");

// Fetch all sections
exports.getSections = async (req, res) => {
  try {
    const onlyActive = req.query.active === "true";
    const filter = onlyActive ? { isActive: true } : {};
    const sections = await Section.find(filter);
    res.status(200).json(sections);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getStudentsBySection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const students = await Student.find({ sectionID: sectionId }).select("firstName lastName emailAddress");
    
    res.status(200).json(students);
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

exports.bulkImportSections = async (req, res) => {
  try {
    const sections = req.body;
    if (!Array.isArray(sections) || sections.length === 0) {
      return res.status(400).json({ message: "No data provided for import." });
    }

    const errors = [];
    const sectionsToInsert = [];

    for (let i = 0; i < sections.length; i++) {
      const entry = sections[i];
      const name = entry.name?.trim();
      const grade = entry.grade;

      if (!name || grade === undefined || grade === null) {
        errors.push(`Row ${i + 2}: Missing name or grade.`);
        continue;
      }

      const exists = await Section.findOne({ name, grade });
      if (exists) {
        errors.push(`Row ${i + 2}: Duplicate section (${name}, Grade ${grade}) already exists.`);
        continue;
      }

      sectionsToInsert.push({
        name,
        grade
      });
    }

    if (sectionsToInsert.length > 0) {
      await Section.insertMany(sectionsToInsert);
    }

    if (errors.length > 0) {
      return res.status(400).json({ message: "Some entries failed.", errors });
    }

    res.status(201).json({ message: "All sections imported successfully." });
  } catch (err) {
    res.status(500).json({ message: "Bulk import failed.", error: err.message });
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

