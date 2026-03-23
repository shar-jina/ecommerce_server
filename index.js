const express = require("express");
const cors = require("cors");

const authRoutes=require('./routes/authRoutes')
const jwtmiddleware=require('./middleware/jwtmiddleware')
const productRoutes=require('./routes/productRoutes')
const postRoutes=require('./routes/postRoutes')
const orderRoutes=require('./routes/orderRoutes')
const notificationRoutes=require('./routes/notificationRoutes')

const app = express();

require('dotenv').config();
const pool = require('./config/db');
pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;`)
  .then(() => console.log("Migrated products table to support images array"))
  .catch(err => console.error("Migration error:", err.message));

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("./uploads"));
app.use("/api/auth", authRoutes);
app.use("/api/products",productRoutes)
app.use("/api/posts", postRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/notifications", notificationRoutes)

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