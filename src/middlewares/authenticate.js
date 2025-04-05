// src/middlewares/authenticate.js
const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  if (!req.headers || !req.headers.authorization) {
    return res.status(401).json({ message: "Missing authorization header" });
  }

  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token not found" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};
