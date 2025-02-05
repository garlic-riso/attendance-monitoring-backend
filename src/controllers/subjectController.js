const Subject = require('../models/subjectModel'); // Adjust path as needed

module.exports = {
  // Create a new subject
  createSubject: async (req, res) => {
    try {
      const { subjectName, gradeLevel, status } = req.body;

      // Create a new subject document
      const newSubject = new Subject({
        subjectName,
        gradeLevel,
        status,
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

  // Get all subjects
  getAllSubjects: async (req, res) => {
    try {
      const subjects = await Subject.find();
      res.status(200).json(subjects);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching subjects', error: error.message });
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
      const { subjectName, gradeLevel, status } = req.body;

      const updatedSubject = await Subject.findByIdAndUpdate(
        id,
        { subjectName, gradeLevel, status },
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

  // Delete a subject by ID
  deleteSubject: async (req, res) => {
    try {
      const { id } = req.params;

      const deletedSubject = await Subject.findByIdAndDelete(id);

      if (!deletedSubject) {
        return res.status(404).json({ message: 'Subject not found' });
      }

      res.status(200).json({ message: 'Subject deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting subject', error: error.message });
    }
  },
};
