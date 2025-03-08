const Parent = require("../models/parentModel");

// Fetch all parents
exports.getParents = async (req, res) => {
  try {
    const parents = await Parent.find();
    res.status(200).json(parents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new parent
exports.createParent = async (req, res) => {
  try {
    const newParent = new Parent(req.body);
    await newParent.save();
    res.status(201).json(newParent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update an existing parent
exports.updateParent = async (req, res) => {
  try {
    const updatedParent = await Parent.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedParent) return res.status(404).json({ message: "Parent not found" });
    res.json(updatedParent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete a parent
exports.deleteParent = async (req, res) => {
  try {
    const deletedParent = await Parent.findByIdAndDelete(req.params.id);
    if (!deletedParent) return res.status(404).json({ message: "Parent not found" });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
