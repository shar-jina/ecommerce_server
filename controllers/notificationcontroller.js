const pool = require("../config/db");

// Create Notification (Admin Only)
exports.createNotification = async (req, res) => {
    try {
        const { title, message } = req.body;
        if (!title || !message) {
            return res.status(400).json({ message: "Title and message are required" });
        }

        const newNotification = await pool.query(
            "INSERT INTO notifications (title, message) VALUES ($1, $2) RETURNING *",
            [title, message]
        );

        res.status(201).json(newNotification.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get All Notifications (Public)
exports.getNotifications = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM notifications ORDER BY created_at DESC");
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete Notification (Admin Only)
exports.deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("DELETE FROM notifications WHERE id = $1 RETURNING *", [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Notification not found" });
        }

        res.status(200).json({ message: "Notification deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
