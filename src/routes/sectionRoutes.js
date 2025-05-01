// src/routes/sectionRoutes.js
const express = require("express");
const {
  getSections,
  createSection,
  updateSection,
  getStudentsBySection,
  bulkImportSections,
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


module.exports = router;
