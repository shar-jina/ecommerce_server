// const { Pool } = require("pg");

// const pool = new Pool({
//   user: "postgres",
//   host: "localhost",
//   database: "ecommerce_db",
//   password: "shar123",
//   port: 5432,
// });
// pool.connect()
//   .then(() => console.log("DB connected"))
//   .catch(err => console.error("DB connection error:", err));

// module.exports = pool;


const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = pool;