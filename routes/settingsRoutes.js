const express = require("express");
const router = express.Router();
const settingsController = require('../controllers/settingscontroller');
const verifytoken = require('../middleware/jwtmiddleware');
const allowRoles = require("../middleware/allowRoles");

// Public can read the settings (needed for checkout)
router.get("/payment", settingsController.getPaymentSettings);

// Only admins can update the payment settings
router.put("/payment", verifytoken, allowRoles("admin", "manager", "superadmin"), settingsController.updatePaymentSettings);

module.exports = router;
