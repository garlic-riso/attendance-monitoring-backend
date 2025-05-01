// src/routes/userRoutes.js
const express = require("express");
const {
  getUsers,
  createUser,
  updateUser,
} = require("../controllers/userController");

const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const router = express.Router();
router.use(authenticate);

router.get("/", authorize(["admin"]), getUsers);
router.post("/", authorize(["admin"]), createUser);
router.put("/:id", authorize(["admin"]), updateUser);

module.exports = router;
