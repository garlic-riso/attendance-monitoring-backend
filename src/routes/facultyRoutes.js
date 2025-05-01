// src/routes/facultyRoutes.js
const express = require("express");
const {
  getFaculties,
  createFaculty,
  updateFaculty,
  bulkImportFaculties,
} = require("../controllers/facultyController");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");

const router = express.Router();
router.use(authenticate);

router.get("/", authorize(["admin", "faculty", "student", "parent"]), getFaculties);
router.post("/", authorize(["admin", "faculty"]), createFaculty);
router.put("/:id", authorize(["admin", "faculty"]), updateFaculty);
router.post("/bulk-import", authorize(["admin", "faculty"]), bulkImportFaculties);

module.exports = router;
