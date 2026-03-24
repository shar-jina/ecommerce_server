const express = require("express");
const cors = require("cors");

const authRoutes=require('./routes/authRoutes')
const jwtmiddleware=require('./middleware/jwtmiddleware')
const productRoutes=require('./routes/productRoutes')
const postRoutes=require('./routes/postRoutes')
const orderRoutes=require('./routes/orderRoutes')
const notificationRoutes=require('./routes/notificationRoutes')
const userRoutes=require('./routes/userRoutes')
const settingsRoutes=require('./routes/settingsRoutes')

const app = express();

require('dotenv').config();
const pool = require('./config/db');
pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;`)
  .then(() => console.log("Migrated products table to support images array"))
  .catch(err => console.error("Migration error:", err.message));

pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false;`)
  .then(() => console.log("Migrated users table to support is_blocked status"))
  .catch(err => console.error("Migration error (users):", err.message));

pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'unspecified';`)
  .then(() => console.log("Migrated orders table to support payment_method"))
  .catch(err => console.error("Migration error (orders):", err.message));

pool.query(`
  CREATE TABLE IF NOT EXISTS settings (
    key VARCHAR(50) PRIMARY KEY,
    value JSONB NOT NULL
  )
`).then(async () => {
    // initialize default payment settings if they don't exist
    const defaultSettings = JSON.stringify({
      cod_enabled: true,
      online_enabled: false,
      instructions: "Please prepare exact change for Cash on Delivery. Online payment is currently disabled."
    });
    await pool.query(`INSERT INTO settings (key, value) VALUES ('payment', $1) ON CONFLICT (key) DO NOTHING`, [defaultSettings]);
    console.log("Migrated settings table to support global configurations");
}).catch(err => console.error("Migration error (settings):", err.message));

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("./uploads"));
app.use("/api/auth", authRoutes);
app.use("/api/products",productRoutes)
app.use("/api/posts", postRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/notifications", notificationRoutes)
app.use("/api/users", userRoutes)
app.use("/api/settings", settingsRoutes)

app.get("/", (req, res) => {
  res.status(200).send("Ecommerce Backend Running");
});

PORT=process.env.PORT||3000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err);

  res.status(500).json({
    message: err.message,
    error: err
  });
});