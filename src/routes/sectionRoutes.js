// src/routes/sectionRoutes.js
const express = require("express");
const {
  getSections,
  createSection,
  updateSection,
  getStudentsBySection,
  bulkImportSections,
  removeStudentFromSection,
  addStudentToSection,
} = require("../controllers/sectionController");

const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const router = express.Router();
router.use(authenticate);

router.get("/", authorize(["admin", "faculty", "student", "parent"]), getSections);
router.post("/", authorize(["admin"]), createSection);
router.put("/:id", authorize(["admin"]), updateSection);
router.get("/:sectionId/students", authorize(["admin", "faculty", "student", "parent"]), getStudentsBySection);
router.post("/bulk-import", authorize(["admin"]), bulkImportSections);
router.delete("/:sectionId/students/:studentId", authorize(["admin"]), removeStudentFromSection);
router.post("/:sectionId/students", authorize(["admin"]), addStudentToSection);


module.exports = router;
