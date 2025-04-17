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

router.get("/", authorize(["admin", "faculty"]), getFaculties);
router.post("/", createFaculty);
router.put("/:id", updateFaculty);
router.post("/bulk-import", bulkImportFaculties);

module.exports = router;
