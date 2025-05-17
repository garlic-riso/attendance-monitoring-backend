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
    const { sectionId, name, grade, advisorID } = req.body;
    const newSection = new Section({ sectionId, name, grade, advisorID });
    await newSection.save();
    res.status(201).json(newSection);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Duplicate section name." });
    }    
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


exports.updateSection = async (req, res) => {
  try {
    const { name, grade } = req.body;
    const { id } = req.params;

    const duplicate = await Section.findOne({ name, grade, _id: { $ne: id } });
    if (duplicate) {
      return res.status(400).json({ message: "Duplicate section name and grade combination." });
    }

    const updatedSection = await Section.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedSection) {
      return res.status(404).json({ message: "Section not found" });
    }

    res.json(updatedSection);
  } catch (err) {
    // Final safeguard: handle MongoDB E11000
    if (err.code === 11000) {
      return res.status(400).json({ message: "Duplicate section name and grade combination." });
    }
    res.status(400).json({ message: err.message });
  }
};




exports.removeStudentFromSection = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    student.sectionID = null; // or remove the student entirely if needed
    await student.save();

    res.json({ message: "Student removed from section" });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove student", error: err.message });
  }
};

exports.addStudentToSection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const data = req.body;

    const student = new Student({
      ...data,
      sectionID: sectionId,
      dateEnrolled: new Date(), // or from req.body
      isActive: true,
      role: "Student"
    });

    await student.save();
    res.status(201).json(student);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "Email already exists." });
    }    
    res.status(400).json({ message: "Failed to add student", error: err.message });
  }
};


