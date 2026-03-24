const pool = require("../config/db");

// Get payment settings (public route)
exports.getPaymentSettings = async (req, res) => {
  try {
    const result = await pool.query("SELECT value FROM settings WHERE key = 'payment'");
    if (result.rows.length === 0) {
      // Return default instantly
      return res.status(200).json({
        cod_enabled: true,
        online_enabled: false,
        instructions: ""
      });
    }
    res.status(200).json(result.rows[0].value);
  } catch (error) {
    console.error("GET SETTINGS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch settings", error: error.message });
  }
};

// Update payment settings (admin route)
exports.updatePaymentSettings = async (req, res) => {
  try {
    const { cod_enabled, online_enabled, instructions } = req.body;
    
    // Store all config as JSONB
    const valuePayload = {
      cod_enabled: !!cod_enabled,
      online_enabled: !!online_enabled,
      instructions: instructions || ""
    };

    await pool.query(
      "INSERT INTO settings (key, value) VALUES ('payment', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
      [valuePayload]
    );

    res.status(200).json({ message: "Payment settings updated successfully", settings: valuePayload });
  } catch (error) {
    console.error("PUT SETTINGS ERROR:", error);
    res.status(500).json({ message: "Failed to update settings", error: error.message });
  }
};
