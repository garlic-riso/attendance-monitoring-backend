const express = require("express");
const {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  bulkImportStudents,
} = require("../controllers/studentController");

const router = express.Router();

router.get("/", getStudents);
router.post("/", createStudent);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);
router.post("/bulk-import", bulkImportStudents);

module.exports = router;
