// src/models/userModel.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
  },
  role: {
    type: String,
    enum: ["Admin"],
    default: "Admin",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the model
const User = mongoose.model("User", userSchema);

module.exports = User;
