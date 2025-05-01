const express = require('express');
const scheduleController = require('../controllers/scheduleController');
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const router = express.Router();
router.use(authenticate);

// Define routes
router.post('/', authorize(["admin", "faculty"]), scheduleController.createSchedule); // Create a new schedule
router.get('/', authorize(["admin", "faculty", "student", "parent"]), scheduleController.getSchedules); // Get all schedules
router.put('/:id', authorize(["admin", "faculty"]), scheduleController.updateSchedule); // Update a schedule by ID
router.delete('/:id', authorize(["admin", "faculty"]), scheduleController.deleteSchedule); // Delete a schedule by ID
router.post("/import", authorize(["admin", "faculty"]), scheduleController.importSchedules);

module.exports = router;
