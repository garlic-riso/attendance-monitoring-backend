const express = require("express");
const {
  getParents,
  createParent,
  updateParent,
  deleteParent,
  bulkImportParents
} = require("../controllers/parentController");

const router = express.Router();

router.get("/", getParents);
router.post("/", createParent);
router.put("/:id", updateParent);
router.delete("/:id", deleteParent);
router.post("/bulk-import", bulkImportParents);

module.exports = router;
