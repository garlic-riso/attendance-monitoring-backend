const mongoose = require("mongoose");
const Student = require("../models/studentModel");
const Parent = require("../models/parentModel");
const Section = require("../models/sectionModel");

exports.getStudents = async (req, res) => {
  try {
    const onlyActive = req.query.active === "true";
    const filter = onlyActive ? { isActive: true } : {};

    const students = await Student.find(filter)
      .populate("parentID", "_id firstName lastName")
      .populate({
        path: "sectionID",
        model: "Section",
        select: "grade name",
      });

    const formattedStudents = students.map(student => ({
      ...student.toObject(),
      parent: student.parentID
        ? `${student.parentID.firstName} ${student.parentID.lastName}`
        : "N/A",
      section: student.sectionID
        ? `Grade ${student.sectionID.grade} - ${student.sectionID.name}`
        : "N/A",
    }));

    res.status(200).json(formattedStudents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/students/unassigned
// This endpoint fetches all students who are not assigned to any section
exports.getUnassignedStudents = async (req, res) => {
  try {
    const students = await Student.find({ sectionID: null }).select("firstName lastName _id");
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch unassigned students." });
  }
};


// GET /api/students/by-parent?parentID=xxx
exports.getStudentsByParent = async (req, res) => {
  try {
    const { parentID } = req.query;

    if (!parentID) {
      return res.status(400).json({ message: "Missing parentID" });
    }

    const students = await Student.find({
      parentID,
      isActive: true,
    }).select("_id firstName lastName");

    res.json(students);
  } catch (error) {
    console.error("Failed to fetch students by parent:", error);
    res.status(500).json({ message: "Server error" });
  }
};



// Create a new student
exports.createStudent = async (req, res) => {
  try {
    const { firstName, middleName = "", lastName, emailAddress } = req.body;

    const existingStudent = await Student.findOne({
      $or: [
        {
          firstName: firstName.trim(),
          middleName: middleName.trim(),
          lastName: lastName.trim(),
        },
        { emailAddress: emailAddress.trim() },
      ],
    });

    if (existingStudent) {
      return res.status(400).json({
        message: "A student with the same name or email already exists.",
      });
    }

    const newStudent = new Student({
      ...req.body,
      isActive: req.body.isActive ?? true,
    });

    await newStudent.save();
    res.status(201).json(newStudent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


// PUT /api/students/:id/assign
exports.assignSection = async (req, res) => {
  try {
    const { id } = req.params;
    const { sectionID } = req.body;

    const student = await Student.findById(id);
    if (!student) return res.status(404).json({ message: "Student not found." });

    student.sectionID = sectionID;
    await student.save();

    res.json({ message: "Student assigned to section." });
  } catch (err) {
    res.status(500).json({ message: "Failed to assign student.", error: err.message });
  }
};


// Bulk import students
exports.bulkImportStudents = async (req, res) => {
  try {
    const students = req.body;

    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ message: "No students provided for import." });
    }

    const requiredFields = [
      "firstName",
      "middleName",
      "lastName",
      "emailAddress",
      "gender",
      "program",
      "dateEnrolled",
      "parentFirstName",
      "parentLastName",
      "sectionName",
      "grade"
    ];
    

    const invalidRows = [];
    const skippedDuplicates = [];
    const errorRecords = [];
    const uniqueStudents = [];

    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const keys = Object.keys(student);
      const missing = requiredFields.filter(field => !keys.includes(field));
      if (missing.length > 0) {
        invalidRows.push({ row: i + 1, missingFields: missing });
        continue;
      }

      const duplicate = await Student.findOne({
        $or: [
          {
            firstName: student.firstName.trim(),
            middleName: (student.parentMiddleName || "").trim(),
            lastName: student.lastName.trim(),
          },
          {
            emailAddress: student.emailAddress.trim(),
          }
        ]
      });

      if (duplicate) {
        skippedDuplicates.push({ row: i + 1, reason: "Duplicate student" });
        continue;
      }

      const parentQuery = {
        firstName: student.parentFirstName?.trim(),
        lastName: student.parentLastName?.trim(),
      };
      
      if (student.parentMiddleName !== undefined) {
        parentQuery.middleName = student.parentMiddleName?.trim() || "";
      }
      
      const parent = await Parent.findOne(parentQuery);

      if (!parent) {
        errorRecords.push({ row: i + 1, reason: "Parent not found" });
        continue;
      }

      const section = await Section.findOne({
        name: student.sectionName.trim(),
        grade: Number(student.grade),
      });

      if (!section) {
        errorRecords.push({ row: i + 1, reason: "Section not found" });
        continue;
      }

      uniqueStudents.push({
        ...student,
        parentID: parent._id,
        sectionID: section._id,
        isActive: student.isActive ?? true,
        dateEnrolled: typeof student.dateEnrolled === "number"
          ? new Date((student.dateEnrolled - 25569) * 86400 * 1000) // Excel serial to JS date
          : new Date(student.dateEnrolled),
      });
      
    }

    if (invalidRows.length > 0) {
      return res.status(400).json({
        message: "Missing fields in some rows.",
        errors: invalidRows,
      });
    }

    const result = await Student.insertMany(uniqueStudents);

    res.status(201).json({
      message: "Bulk import completed.",
      insertedCount: result.length,
      skippedDuplicates,
      errorRecords,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Bulk import failed", error: err.message });
  }
};


// Update an existing student
exports.updateStudent = async (req, res) => {
  try {
    if (req.body.parentID) {
      req.body.parentID = new mongoose.Types.ObjectId(req.body.parentID);
    }
    if (req.body.sectionID) {
      req.body.sectionID = new mongoose.Types.ObjectId(req.body.sectionID);
    }
    const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedStudent) return res.status(404).json({ message: "Student not found" });
    res.json(updatedStudent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete a student
exports.deleteStudent = async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);
    if (!deletedStudent) return res.status(404).json({ message: "Student not found" });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
