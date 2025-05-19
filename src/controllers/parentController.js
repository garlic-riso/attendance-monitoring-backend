const Parent = require("../models/parentModel");

// Fetch all parents
// Updated getParents controller
exports.getParents = async (req, res) => {
  try {
    const filter = {};
    if (req.query.active === "true") {
      filter.isActive = true;
    }

    const parents = await Parent.find(filter);
    res.status(200).json(parents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Create a new parent
exports.createParent = async (req, res) => {
  try {
    const { firstName, middleName, lastName, emailAddress } = req.body;
    const existing = await Parent.findOne({
      $or: [
        { emailAddress },
        { firstName, middleName, lastName }
      ]
    });
    if (existing) {
      return res.status(400).json({ message: "Duplicate parent (name or email) exists." });
    }

    const parent = new Parent(req.body);
    await parent.save();
    res.status(201).json(parent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.bulkImportParents = async (req, res) => {
  const records = req.body;
  const errors = [];

  for (let i = 0; i < records.length; i++) {
    const { firstName, middleName, lastName, emailAddress, contactNumber } = records[i];
    if (!firstName || !lastName || !emailAddress || !contactNumber) {
      errors.push("Missing required fields.");
      continue;
    }

    const contact = String(contactNumber).padStart(11, "0");

    const exists = await Parent.findOne({
      $or: [
        { emailAddress },
        { firstName, middleName, lastName }
      ]
    });

    if (exists) {
      errors.push("Duplicate parent (name or email) exists.");
      continue;
    }

    try {
      const parent = new Parent({
        firstName,
        middleName,
        lastName,
        emailAddress,
        contactNumber: contact,
      });
      await parent.save();
    } catch (err) {
      errors.push(err.message || "Validation failed.");
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  res.status(200).json({ message: "Bulk import complete." });
};




// Update an existing parent
exports.updateParent = async (req, res) => {
  try {
    const { firstName, middleName, lastName, emailAddress } = req.body;
    const existing = await Parent.findOne({
      _id: { $ne: req.params.id },
      $or: [
        { emailAddress },
        { firstName, middleName, lastName }
      ]
    });
    if (existing) {
      return res.status(400).json({ message: "Duplicate parent (name or email) exists." });
    }
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
