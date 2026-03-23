require("dotenv").config();
const pool = require("./config/db");

async function updateProductsTableImages() {
  try {
    await pool.query(`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;
    `);
    console.log("Products table updated with images JSONB column");
    process.exit(0);
  } catch (error) {
    console.error("Error updating products table:", error);
    process.exit(1);
  }
}

updateProductsTableImages();
