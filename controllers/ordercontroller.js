const pool = require("../config/db");

// Place a new order
exports.placeOrder = async (req, res) => {
  const client = await pool.connect();
  try {
    const { items, total_amount, shipping_address, contact_number } = req.body;
    const user_id = req.user.id; // user_id from jwtmiddleware

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    await client.query("BEGIN");

    // 1. Insert into orders table
    const orderResult = await client.query(
      `INSERT INTO orders (user_id, total_amount, shipping_address, contact_number)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [user_id, total_amount, shipping_address, contact_number]
    );

    const orderId = orderResult.rows[0].id;

    // 2. Insert into order_items table
    const itemPromises = items.map(item => {
      return client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.id, item.quantity, item.price]
      );
    });

    await Promise.all(itemPromises);

    await client.query("COMMIT");

    res.status(201).json({
      message: "Order placed successfully",
      orderId: orderId
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("ORDER ERROR:", error);
    res.status(500).json({ message: "Order failed", error: error.message });
  } finally {
    client.release();
  }
};

// Get orders for the logged-in user
exports.getUserOrders = async (req, res) => {
  try {
    const user_id = req.user.id;
    const orders = await pool.query(
      `SELECT o.*, 
       json_agg(json_build_object(
         'id', oi.id,
         'product_id', oi.product_id,
         'quantity', oi.quantity,
         'price', oi.price,
         'product_name', p.name,
         'product_image', p.image
       )) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [user_id]
    );

    res.status(200).json(orders.rows);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders", error: error.message });
  }
};

// Admin: Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await pool.query(
      `SELECT o.*, u.name as user_name, u.email as user_email,
       json_agg(json_build_object(
         'id', oi.id,
         'product_id', oi.product_id,
         'quantity', oi.quantity,
         'price', oi.price,
         'product_name', p.name
       )) as items
       FROM orders o
       JOIN users u ON o.user_id = u.id
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       GROUP BY o.id, u.id
       ORDER BY o.created_at DESC`
    );

    res.status(200).json(orders.rows);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch all orders", error: error.message });
  }
};

// Admin: Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedOrder = await pool.query(
      "UPDATE orders SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );

    if (updatedOrder.rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Order status updated",
      order: updatedOrder.rows[0]
    });
  } catch (error) {
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};
