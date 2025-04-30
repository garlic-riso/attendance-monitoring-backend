const express = require("express");
const router = express.Router();
const settingsController = require("../controllers/settingsController"); // adjust the path

// GET current settings
router.get("/", settingsController.getSettings);

// POST create settings (usually only used once)
router.post("/", settingsController.createSettings);

// PUT update settings
router.put("/", settingsController.updateSettings);

module.exports = router;
