// src/controllers/userController.js
const User = require("../models/userModel");

// Fetch all users
exports.getUsers = async (req, res) => {
  try {
    const filter = req.query.active === "true"
      ? { isActive: true }
      : req.query.active === "false"
      ? { isActive: false }
      : {};
    const users = await User.find(filter);
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new user
exports.createUser = async (req, res) => {
  try {
    const { firstName, middleName = "", lastName, email, role } = req.body;
    const newUser = new User({ firstName, middleName, lastName, email, role });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update an existing user
exports.updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedUser) return res.status(404).json({ message: "User not found" });
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


