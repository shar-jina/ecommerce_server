const pool = require("../config/db");




exports.addProduct = async (req, res) => {
  try {

    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const { name, price, description, category, stock } = req.body;

    const image = req.file.path;

    const newProduct = await pool.query(
      `INSERT INTO products(name,price,description,image,category,stock)
       VALUES($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [name, parseFloat(price), description, image, category, parseInt(stock) || 0]
    );

    res.status(201).json({
      message: "Product added successfully",
      product: newProduct.rows[0]
    });

  } catch (error) {
    console.log("ERROR:", error);

    res.status(500).json({
      message: error.message
    });
  }
};

exports.getProducts = async (req, res) => {

  try {

    const products = await pool.query(
      "SELECT * FROM products ORDER BY id DESC"
    );

    res.status(200).json(products.rows);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

};

exports.getProductById = async (req, res) => {
  try {

    const { id } = req.params;

    const product = await pool.query(
      "SELECT * FROM products WHERE id=$1",
      [id]
    );

    if (product.rows.length === 0) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.status(200).json(product.rows[0]);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }
};

exports.updateProduct = async (req, res) => {

  try {

    const { id } = req.params;

    const { name, price, description, category, stock } = req.body;
    let image = req.body.image;

    if (req.file) {
      image = req.file.path;
    }

    const updatedProduct = await pool.query(
      `UPDATE products 
       SET name=$1, price=$2, description=$3, image=$4, category=$5, stock=$6
       WHERE id=$7
       RETURNING *`,
      [name, parseFloat(price), description, image, category, parseInt(stock) || 0, id]
    );

    if (updatedProduct.rows.length === 0) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct.rows[0]
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

};


exports.deleteProduct = async (req, res) => {

  try {

    const { id } = req.params;

    const deletedProduct = await pool.query(
      "DELETE FROM products WHERE id=$1 RETURNING *",
      [id]
    );

    if (deletedProduct.rows.length === 0) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.status(200).json({
      message: "Product deleted successfully"
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

};