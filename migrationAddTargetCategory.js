require('dotenv').config();
const pool = require("./config/db");

async function migrate() {
  try {
    console.log("Starting migration: Adding target_category column to posts table...");
    
    await pool.query(`
      ALTER TABLE posts 
      ADD COLUMN IF NOT EXISTS target_category VARCHAR(255);
    `);
    
    console.log("Migration successful: target_category column added.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
