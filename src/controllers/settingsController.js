const Setting = require("../models/settingModel"); // adjust path based on your folder structure

// Fetch settings (assuming only one settings document exists)
exports.getSettings = async (req, res) => {
  try {
    const settings = await Setting.findOne(); // Fetch the single settings document
    if (!settings) return res.status(404).json({ message: "Settings not found" });
    res.status(200).json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create new settings (only if no settings exist yet)
exports.createSettings = async (req, res) => {
  try {
    const existing = await Setting.findOne();
    if (existing) return res.status(400).json({ message: "Settings already exist" });

    const newSetting = new Setting(req.body);
    await newSetting.save();
    res.status(201).json(newSetting);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update existing settings
exports.updateSettings = async (req, res) => {
  try {
    const updatedSetting = await Setting.findOneAndUpdate({}, req.body, {
      new: true,
    });
    if (!updatedSetting) return res.status(404).json({ message: "Settings not found" });
    res.json(updatedSetting);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// (Optional) Delete settings
exports.deleteSettings = async (req, res) => {
  try {
    const deletedSetting = await Setting.deleteMany({}); // delete all settings if needed
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
