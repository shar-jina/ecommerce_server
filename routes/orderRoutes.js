const express = require('express');
const router = express.Router();
const orderController = require('../controllers/ordercontroller');
const jwtMiddleware = require('../middleware/jwtmiddleware');

// Place an order
router.post('/', jwtMiddleware, orderController.placeOrder);

// Get logged-in user's orders
router.get('/user', jwtMiddleware, orderController.getUserOrders);

// Admin: Get all orders
router.get('/all', jwtMiddleware, orderController.getAllOrders);

// Admin: Update order status
router.put('/status/:id', jwtMiddleware, orderController.updateOrderStatus);

module.exports = router;
