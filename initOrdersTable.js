const pool = require("./config/db");

async function initOrdersDB() {
  try {
    // Orders Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        total_amount DECIMAL(12, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        shipping_address TEXT NOT NULL,
        contact_number VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Orders table initialized successfully");

    // Order Items Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INT REFERENCES orders(id) ON DELETE CASCADE,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(12, 2) NOT NULL
      )
    `);
    console.log("Order Items table initialized successfully");

    process.exit(0);
  } catch (error) {
    console.error("Error initializing orders database:", error);
    process.exit(1);
  }
}

initOrdersDB();
