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
async function initializeDatabase() {
  console.log("Starting Database Initialization...");
  try {
    const time = await pool.query("SELECT NOW()");
    console.log("DB connection verified at:", time.rows[0].now);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        category VARCHAR(100),
        stock INT DEFAULT 0,
        image TEXT,
        images JSONB DEFAULT '[]'::jsonb,
        specifications JSONB DEFAULT '{}'::jsonb,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Products table ready");
    // Ensure columns exist for existing tables
    await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS image TEXT;`);
    await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS specifications JSONB DEFAULT '{}'::jsonb;`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'customer',
        otp VARCHAR(10),
        otp_expires TIMESTAMP,
        is_verified BOOLEAN DEFAULT false,
        is_blocked BOOLEAN DEFAULT false,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Users table ready");

    // Ensure all columns exist for existing tables
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'customer';`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false;`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS otp VARCHAR(10);`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expires TIMESTAMP;`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(100) DEFAULT 'Offer',
        image TEXT,
        product_id INT REFERENCES products(id) ON DELETE SET NULL,
        discount_label VARCHAR(50),
        target_category VARCHAR(100),
        link TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Posts table ready");
    // Ensure all columns exist for existing tables
    await pool.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS product_id INT REFERENCES products(id) ON DELETE SET NULL;`);
    await pool.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS link TEXT;`);
    await pool.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS discount_label VARCHAR(50);`);
    await pool.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS target_category VARCHAR(100);`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        total_amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        shipping_address TEXT,
        contact_number VARCHAR(20),
        payment_method VARCHAR(50) DEFAULT 'unspecified',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Orders table ready");

    // Migration for orders table
    await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address TEXT;`);
    await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS contact_number VARCHAR(20);`);
    await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INT REFERENCES orders(id) ON DELETE CASCADE,
        product_id INT REFERENCES products(id) ON DELETE SET NULL,
        quantity INT NOT NULL DEFAULT 1,
        price DECIMAL(10,2) NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Order items table ready");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        key VARCHAR(50) PRIMARY KEY,
        value JSONB NOT NULL
      )
    `);
    console.log("Settings table ready");

    // initialize default payment settings if they don't exist
    const defaultSettings = JSON.stringify({
      cod_enabled: true,
      online_enabled: false,
      instructions: "Please prepare exact change for Cash on Delivery. Online payment is currently disabled."
    });
    await pool.query(`INSERT INTO settings (key, value) VALUES ('payment', $1) ON CONFLICT (key) DO NOTHING`, [defaultSettings]);
    console.log("Default settings initialized");

  } catch (err) {
    console.error("CRITICAL DATABASE INITIALIZATION ERROR:", err.message);
  }
}

initializeDatabase();

const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

app.use(helmet({
  crossOriginResourcePolicy: false, // Ensure image uploads can still be served if needed cross-origin
}));
app.use(cors({ 
  origin: [
    process.env.FRONTEND_URL, 
    "http://localhost:5173", 
    "https://ecommerce-qzvk-git-main-sharjinas-projects.vercel.app",
    "https://ecommerce-fjnw.vercel.app"
  ].filter(Boolean), 
  credentials: true 
}));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { message: "Too many requests from this IP, please try again after 15 minutes" }
});

app.use("/api/auth/login", apiLimiter);
app.use("/api/auth/register", apiLimiter);
app.use("/api/auth/verify-otp", apiLimiter);

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;

app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err);

  res.status(500).json({
    message: err.message,
    error: err
  });
});