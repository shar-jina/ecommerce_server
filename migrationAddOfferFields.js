const pool = require("./config/db");

async function addOfferFields() {
  try {
    await pool.query(`
      ALTER TABLE posts 
      ADD COLUMN IF NOT EXISTS discount_label VARCHAR(100);
    `);
    console.log("Posts table updated with discount_label");

    // Also ensure content is used for 'description'
    
    process.exit(0);
  } catch (error) {
    console.error("Error updating posts table:", error);
    process.exit(1);
  }
}

addOfferFields();
