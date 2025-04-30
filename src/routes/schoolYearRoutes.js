const express = require("express");
const router = express.Router();
const controller = require("../controllers/schoolYearController");

router.get("/", controller.getAllSchoolYears);
router.post("/", controller.createSchoolYear);
router.put("/:id", controller.updateSchoolYear);
router.delete("/:id", controller.deleteSchoolYear);
router.patch("/:id/set-current", controller.setCurrentSchoolYear); // for setting current

module.exports = router;
