const express = require("express");
const controller = require("../controllers/schoolYearController");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const router = express.Router();
router.use(authenticate);

router.get("/", authorize(["admin", "faculty", "student", "parent"]), controller.getAllSchoolYears);
router.post("/", authorize(["admin", "faculty"]), controller.createSchoolYear);
router.put("/:id", authorize(["admin", "faculty"]), controller.updateSchoolYear);
router.delete("/:id", authorize(["admin", "faculty"]), controller.deleteSchoolYear);
router.patch("/:id/set-current", authorize(["admin", "faculty"]), controller.setCurrentSchoolYear); // for setting current

module.exports = router;
