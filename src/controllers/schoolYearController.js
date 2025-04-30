const SchoolYear = require("../models/schoolYearModel");

// Get all school years
exports.getAllSchoolYears = async (req, res) => {
  try {
    const schoolYears = await SchoolYear.find().sort({ label: -1 });
    res.status(200).json(schoolYears);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new school year
exports.createSchoolYear = async (req, res) => {
  try {
    const { label } = req.body;
    const existing = await SchoolYear.findOne({ label });
    if (existing) return res.status(400).json({ message: "School year already exists." });

    const newSY = new SchoolYear({ label });
    await newSY.save();
    res.status(201).json(newSY);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update school year
exports.updateSchoolYear = async (req, res) => {
  try {
    const updated = await SchoolYear.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "School year not found." });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete school year
exports.deleteSchoolYear = async (req, res) => {
  try {
    const deleted = await SchoolYear.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "School year not found." });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Set a school year as current
exports.setCurrentSchoolYear = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the school year to set as current
    const schoolYearToSet = await SchoolYear.findById(id);
    if (!schoolYearToSet) return res.status(404).json({ message: "School year not found." });

    // Unset current from all other school years
    await SchoolYear.updateMany({ isCurrent: true }, { isCurrent: false });

    // Set the selected school year as current
    schoolYearToSet.isCurrent = true;
    await schoolYearToSet.save();

    res.json({ message: `${schoolYearToSet.label} is now set as the current school year.` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
