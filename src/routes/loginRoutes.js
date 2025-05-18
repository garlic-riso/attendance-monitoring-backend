const express = require("express");
const router = express.Router();
const { googleLogin, test } = require("../controllers/loginControllers");

router.post("/google-login", googleLogin);
router.get("/test", test);

module.exports = router;