// src/routes/facultyRoutes.js
const express = require("express");
const {
  getFaculties,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  bulkImportFaculties,
} = require("../controllers/facultyController");

const router = express.Router();

router.get("/", getFaculties);
router.post("/", createFaculty);
router.put("/:id", updateFaculty);
router.delete("/:id", deleteFaculty);
router.post("/bulk-import", bulkImportFaculties);

module.exports = router;
