const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController'); // Adjust path as needed

// CRUD routes for Subject
router.post('/', subjectController.createSubject); // Create a subject
router.get('/', subjectController.getAllSubjects); // Get all subjects
router.get('/:id', subjectController.getSubjectById); // Get a subject by ID
router.put('/:id', subjectController.updateSubject); // Update a subject by ID
router.delete('/:id', subjectController.deleteSubject); // Delete a subject by ID

module.exports = router;
