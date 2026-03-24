const express = require("express");
const router = express.Router();
const verifytoken = require('../middleware/jwtmiddleware');
const allowRoles = require('../middleware/allowRoles');
const userController = require("../controllers/usercontroller");

// All these routes are admin-protected
router.get("/", verifytoken, allowRoles("admin", "manager", "superadmin"), userController.getAllUsers);
router.put("/:id/block", verifytoken, allowRoles("admin", "manager", "superadmin"), userController.toggleUserBlock);
router.delete("/:id", verifytoken, allowRoles("admin", "manager", "superadmin"), userController.deleteUser);

module.exports = router;
