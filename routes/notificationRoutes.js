const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationcontroller");
const jwtmiddleware = require("../middleware/jwtmiddleware");

// Get notifications (Public)
router.get("/", notificationController.getNotifications);

// Create notification (Admin Only)
router.post("/", jwtmiddleware, notificationController.createNotification);

// Delete notification (Admin Only)
router.delete("/:id", jwtmiddleware, notificationController.deleteNotification);

module.exports = router;
