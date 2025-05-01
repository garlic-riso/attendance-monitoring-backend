const express = require("express");
const settingsController = require("../controllers/settingsController");

const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const router = express.Router();
router.use(authenticate);

router.get("/", authorize(["admin", "faculty", "student", "parent"]), settingsController.getSettings);
router.post("/", authorize(["admin"]), settingsController.createSettings);
router.put("/", authorize(["admin"]), settingsController.updateSettings);

module.exports = router;
