const pool = require("../config/db");

exports.addProduct = async (req, res) => {
  try {
    const { name, price, description, category, stock } = req.body;
    
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => file.path);
    } else if (req.file) {
      images = [req.file.path];
    }
    const image = images.length > 0 ? images[0] : null;

    const newProduct = await pool.query(
      `INSERT INTO products(name,price,description,image,images,category,stock)
       VALUES($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [name, parseFloat(price), description, image, JSON.stringify(images), category, parseInt(stock) || 0]
    );

    res.status(201).json({
      message: "Product added successfully",
      product: newProduct.rows[0]
    });
  } catch (error) {
    console.log("ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await pool.query("SELECT * FROM products ORDER BY id DESC");
    res.status(200).json(products.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await pool.query("SELECT * FROM products WHERE id=$1", [id]);
    if (product.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, category, stock } = req.body;
    
    let images = req.body.images ? JSON.parse(req.body.images) : [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => file.path); // Replace existing with newly uploaded
    } else if (req.file) {
      images = [req.file.path];
    }
    
    // Fallback logic
    if (images.length === 0 && req.body.image) {
      images = [req.body.image];
    }
    
    const dbImage = images.length > 0 ? images[0] : (req.body.image || null);

    const updatedProduct = await pool.query(
      `UPDATE products 
       SET name=$1, price=$2, description=$3, image=$4, images=$5, category=$6, stock=$7
       WHERE id=$8
       RETURNING *`,
      [name, parseFloat(price), description, dbImage, JSON.stringify(images), category, parseInt(stock) || 0, id]
    );

    if (updatedProduct.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct.rows[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await pool.query("DELETE FROM products WHERE id=$1 RETURNING *", [id]);
    if (deletedProduct.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};