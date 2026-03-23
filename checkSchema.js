const pool = require("./config/db");

async function checkSchema() {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'products'
    `);
    console.log("Products Table Schema:");
    console.table(result.rows);
    process.exit(0);
  } catch (error) {
    console.error("Error checking schema:", error);
    process.exit(1);
  }
}

checkSchema();
