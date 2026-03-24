const pool = require("../config/db");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await pool.query("SELECT id, name, email, role, is_verified, is_blocked FROM users ORDER BY id DESC");
    res.status(200).json(users.rows);
  } catch (error) {
    console.error("GET USERS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.toggleUserBlock = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_blocked } = req.body;

    const updatedUser = await pool.query(
      `UPDATE users SET is_blocked=$1 WHERE id=$2 RETURNING id, name, email, is_blocked`,
      [is_blocked, id]
    );

    if (updatedUser.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: `User ${is_blocked ? 'blocked' : 'unblocked'} successfully`,
      user: updatedUser.rows[0]
    });
  } catch (error) {
    console.error("TOGGLE BLOCK ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await pool.query("DELETE FROM users WHERE id=$1 RETURNING id", [id]);

    if (deletedUser.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("DELETE USER ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};
