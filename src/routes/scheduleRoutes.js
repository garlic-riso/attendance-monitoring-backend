const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');

// Define routes
router.post('/', scheduleController.createSchedule); // Create a new schedule
router.get('/', scheduleController.getSchedules); // Get all schedules
router.put('/:id', scheduleController.updateSchedule); // Update a schedule by ID
router.delete('/:id', scheduleController.deleteSchedule); // Delete a schedule by ID
router.post("/import", scheduleController.importSchedules);

module.exports = router;
