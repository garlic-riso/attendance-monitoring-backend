const Subject = require('../models/subjectModel'); // Adjust path as needed

module.exports = {
  // Create a new subject
  createSubject: async (req, res) => {
    try {
      const { subjectName, gradeLevel, isActive = true } = req.body;

      const newSubject = new Subject({
        subjectName,
        gradeLevel,
        isActive,
      });

      await newSubject.save();

      res.status(201).json({
        message: 'Subject created successfully',
        subject: newSubject,
      });
    } catch (error) {
      res.status(500).json({ message: 'Error creating subject', error: error.message });
    }
  },

  bulkImportSubjects: async (req, res) => {
    try {
      const subjects = req.body;
  
      if (!Array.isArray(subjects) || subjects.length === 0) {
        return res.status(400).json({ message: "No data provided for import." });
      }
  
      const errors = [];
      const subjectsToInsert = [];
  
      for (let i = 0; i < subjects.length; i++) {
        const entry = subjects[i];
        const subjectName = entry.subjectName?.trim();
        const gradeLevel = entry.gradeLevel;
  
        if (!subjectName || gradeLevel === undefined || gradeLevel === null) {
          errors.push(`Row ${i + 2}: Missing subjectName or gradeLevel.`);
          continue;
        }
  
        const existing = await Subject.findOne({
          subjectName,
          gradeLevel,
        });
  
        if (existing) {
          errors.push(`Row ${i + 2}: Duplicate subject (${subjectName}, Grade ${gradeLevel}) already exists.`);
          continue;
        }
  
        subjectsToInsert.push({
          subjectName,
          gradeLevel,
        });
      }
  
      if (subjectsToInsert.length > 0) {
        await Subject.insertMany(subjectsToInsert);
      }
  
      if (errors.length > 0) {
        return res.status(400).json({ message: "Some entries failed.", errors });
      }
  
      res.status(201).json({ message: "All subjects imported successfully." });
    } catch (error) {
      res.status(500).json({ message: "Bulk import failed.", error: error.message });
    }
  },  
  

  // Get all subjects
  getAllSubjects: async (req, res) => {
    try {
      const filter =
        req.query.active === "true"
          ? { isActive: true }
          : req.query.active === "false"
          ? { isActive: false }
          : {};
  
      const subjects = await Subject.find(filter);
      res.status(200).json(subjects);
    } catch (error) {
      res.status(500).json({ message: "Error fetching subjects", error: error.message });
    }
  },
  

  // Get a single subject by ID
  getSubjectById: async (req, res) => {
    try {
      const { id } = req.params;
      const subject = await Subject.findById(id);

      if (!subject) {
        return res.status(404).json({ message: 'Subject not found' });
      }

      res.status(200).json(subject);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching subject', error: error.message });
    }
  },

  // Update a subject by ID
  updateSubject: async (req, res) => {
    try {
      const { id } = req.params;
      const { subjectName, gradeLevel, isActive } = req.body;
  
      const updatedSubject = await Subject.findByIdAndUpdate(
        id,
        { subjectName, gradeLevel, isActive },
        { new: true, runValidators: true }
      );
  
      if (!updatedSubject) {
        return res.status(404).json({ message: 'Subject not found' });
      }
  
      res.status(200).json({
        message: 'Subject updated successfully',
        subject: updatedSubject,
      });
    } catch (error) {
      res.status(500).json({ message: 'Error updating subject', error: error.message });
    }
  },
  
};
