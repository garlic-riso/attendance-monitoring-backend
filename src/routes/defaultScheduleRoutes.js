const express = require("express");
const { getDefaultSchedule, updateDefaultSchedule } = require('../controllers/defaultScheduleController.js');

const router = express.Router();

router.get('/', getDefaultSchedule);
router.put('/', updateDefaultSchedule);

module.exports = router;
