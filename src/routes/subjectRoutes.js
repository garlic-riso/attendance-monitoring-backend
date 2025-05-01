const express = require('express');
const subjectController = require('../controllers/subjectController');

const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const router = express.Router();
router.use(authenticate);

// CRUD routes for Subject
router.get('/', authorize(["admin", "faculty", "student", "parent"]), subjectController.getAllSubjects); // Get all subjects
router.post('/', authorize(["admin"]), subjectController.createSubject); // Create a subject
router.get('/:id', authorize(["admin", "faculty", "student", "parent"]), subjectController.getSubjectById); // Get a subject by ID
router.put('/:id', authorize(["admin"]), subjectController.updateSubject); // Update a subject by ID
router.post("/bulk-import", authorize(["admin"]), subjectController.bulkImportSubjects);


module.exports = router;
