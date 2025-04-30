// src/app.js
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const sectionRoutes = require("./routes/sectionRoutes");
const facultyRoutes = require("./routes/facultyRoutes");
const scheduleRoutes = require('./routes/scheduleRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const defaultScheduleRoutes = require('./routes/defaultScheduleRoutes');
const parentRoutes = require('./routes/parentRoutes');
const studentRoutes = require('./routes/studentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const loginRoutes = require('./routes/loginRoutes');
const settingsRoutes = require("./routes/settingsRoutes");
const schoolYearRoutes = require("./routes/schoolYearRoutes");

require("dotenv").config();
const app = express();

// Middleware
app.use(express.json());

// Enable CORS
app.use(cors({
    origin: 'http://localhost:3001', // Replace with your frontend URL
    credentials: true, // If you use cookies or authentication
}));

// Database Connection
connectDB();

// Routes
app.use("/api/users", userRoutes);
app.use("/api/sections", sectionRoutes);
app.use("/api/teachers", facultyRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/defaultSchedule', defaultScheduleRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/parents", parentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/auth", loginRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/school-years", schoolYearRoutes);

// Default route
app.get("/", (req, res) => {
    res.send("API is running...");
});

module.exports = app;
