const { OAuth2Client } = require("google-auth-library");
const Student = require("../models/studentModel");
const Parent = require("../models/parentModel");
const Faculty = require("../models/facultyModel");
const User = require("../models/userModel");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

exports.test = async (req, res) => {
  const User = require("./models/userModel"); // adjust path if needed

  try {
    const newUser = await User.create({
      firstName: "Janelle",
      lastName: "Domingo",
      email: "janelle@smis.edu.ph",
    });
    res.json({ success: true, user: newUser });
  } catch (err) {
    res.status(500).json({ message: "Insert error", error: err.message });
  }
};

exports.googleLogin = async (req, res) => {
    const { token } = req.body;
  
    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
  
      const payload = ticket.getPayload();
      const email = payload.email;
  
      const student = await Student.findOne({ emailAddress: email });
      const parent = await Parent.findOne({ emailAddress: email });
      const faculty = await Faculty.findOne({ email });
      const user = await User.findOne({ email });

      console.log("Email :", email);
  
      const foundUser = student || parent || faculty || user;

      console.log("Found User :", foundUser);
  
      if (!foundUser) {
        return res.status(401).json({ success: false, message: "Email not registered" });
      }
  
      const jwtPayload = {
        id: foundUser._id,
        email: foundUser.email || foundUser.emailAddress,
        role: foundUser.role || "student", // Assume default role if not present
        name: foundUser.firstName + " " + foundUser.lastName || "User",
        sectionID: foundUser.sectionID || undefined, // Add sectionID if it exists
      };
  
      const accessToken = jwt.sign(jwtPayload, JWT_SECRET, { expiresIn: "1d" });
  
      res.status(200).json({
        success: true,
        user: jwtPayload,
        token: accessToken,
      });
    } catch (error) {
      res.status(400).json({ success: false, message: "Invalid token", error: error.message });
    }
  };