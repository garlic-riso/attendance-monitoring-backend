const express = require("express");
const {
  getParents,
  createParent,
  updateParent,
  deleteParent,
  bulkImportParents
} = require("../controllers/parentController");

const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const router = express.Router();
router.use(authenticate);

router.get("/", authorize(["admin", "faculty", "student", "parent"]), getParents);
router.post("/", authorize(["admin"]), createParent);
router.put("/:id", authorize(["admin"]), updateParent);
router.delete("/:id", authorize(["admin"]), deleteParent);
router.post("/bulk-import", authorize(["admin"]), bulkImportParents);

module.exports = router;
