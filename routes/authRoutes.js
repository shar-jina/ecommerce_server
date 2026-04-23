const express = require("express");

const router = express.Router();

const {
  registerUser,
  loginUser,
  verifyOTP,
} = require('../controllers/authcontroller');

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/verify-otp", verifyOTP);

// Temporary emergency route to make yourself an admin
router.get("/promote-to-admin", (req, res, next) => {
  const { email, secret } = req.query;
  if(secret === "bitfix_admin_secret_99") {
    next();
  } else {
    res.status(403).send("Forbidden: Secret key mismatch");
  }
}, require('../controllers/authcontroller').promoteToAdmin);

module.exports = router;