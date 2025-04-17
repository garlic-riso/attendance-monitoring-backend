// src/routes/sectionRoutes.js
const express = require("express");
const {
  getSections,
  createSection,
  updateSection,
  getStudentsBySection,
  bulkImportSections,
} = require("../controllers/sectionController");

const router = express.Router();

router.get("/", getSections);
router.post("/", createSection);
router.put("/:id", updateSection);
router.get("/:sectionId/students", getStudentsBySection);
router.post("/bulk-import", bulkImportSections);


module.exports = router;
