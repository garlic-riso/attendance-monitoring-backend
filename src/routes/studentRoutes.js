const express = require("express");
const {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  bulkImportStudents,
  getStudentsByParent,
} = require("../controllers/studentController");

const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const router = express.Router();
router.use(authenticate);

router.get("/", authorize(["admin", "faculty", "student", "parent"]), getStudents);
router.post("/", authorize(["admin", "faculty"]), createStudent);
router.put("/:id", authorize(["admin", "faculty"]), updateStudent);
router.delete("/:id", authorize(["admin", "faculty"]), deleteStudent);
router.post("/bulk-import", authorize(["admin", "faculty"]), bulkImportStudents);
router.get("/by-parent", getStudentsByParent);

module.exports = router;
