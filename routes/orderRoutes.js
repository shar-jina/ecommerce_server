const express = require('express');
const router = express.Router();
const orderController = require('../controllers/ordercontroller');
const jwtMiddleware = require('../middleware/jwtmiddleware');
const allowRoles = require('../middleware/allowRoles');

// Place an order
router.post('/', jwtMiddleware, orderController.placeOrder);

// Get logged-in user's orders
router.get('/user', jwtMiddleware, orderController.getUserOrders);

// Admin: Get all orders
router.get('/all', jwtMiddleware, allowRoles("admin", "manager", "superadmin"), orderController.getAllOrders);

// Admin: Update order status
router.put('/status/:id', jwtMiddleware, allowRoles("admin", "manager", "superadmin"), orderController.updateOrderStatus);

module.exports = router;
