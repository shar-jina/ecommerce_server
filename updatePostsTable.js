const pool = require("./config/db");

async function updatePostsTable() {
  try {
    await pool.query(`
      ALTER TABLE posts 
      ADD COLUMN IF NOT EXISTS product_id INTEGER REFERENCES products(id) ON DELETE SET NULL;
    `);
    console.log("Posts table updated with product_id column");
    process.exit(0);
  } catch (error) {
    console.error("Error updating posts table:", error);
    process.exit(1);
  }
}

updatePostsTable();
