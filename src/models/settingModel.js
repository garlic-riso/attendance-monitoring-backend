const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema({
  currentQuarter: {
    type: String,
    required: true,
    enum: ["First", "Second", "Third", "Fourth"],
  },
});

module.exports = mongoose.model("Setting", settingSchema);
