const DefaultSchedule = require('../models/defaultScheduleModel.js');

// Get the default values
exports.getDefaultSchedule = async (req, res) => {
  try {
    const defaultSchedule = await DefaultSchedule.findOne();
    if (!defaultSchedule) {
      return res.status(404).json({ message: 'Default values not found' });
    }
    res.json(defaultSchedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update the default values
exports.updateDefaultSchedule = async (req, res) => {
  const { sectionId, academicYear, quarter } = req.body;

  try {
    const defaultSchedule = await DefaultSchedule.findOne();
    if (!defaultSchedule) {
      return res.status(404).json({ message: 'Default values not found' });
    }

    defaultSchedule.sectionId = sectionId || defaultSchedule.sectionId;
    defaultSchedule.academicYear = academicYear || defaultSchedule.academicYear;
    defaultSchedule.quarter = quarter || defaultSchedule.quarter;

    const updatedDefaultSchedule = await defaultSchedule.save();
    res.json(updatedDefaultSchedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
