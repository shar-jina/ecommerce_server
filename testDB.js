const pool = require("./config/db");

async function testDB() {
  const res = await pool.query("SELECT NOW()");
  console.log(res.rows,"db is connect to backend");
}

testDB();