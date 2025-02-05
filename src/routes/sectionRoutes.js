// src/routes/sectionRoutes.js
const express = require("express");
const {
  getSections,
  createSection,
  updateSection,
  deleteSection,
} = require("../controllers/sectionController");

const router = express.Router();

router.get("/", getSections);
router.post("/", createSection);
router.put("/:id", updateSection);
router.delete("/:id", deleteSection);

module.exports = router;
