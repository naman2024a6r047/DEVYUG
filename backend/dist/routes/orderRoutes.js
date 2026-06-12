"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderController_1 = require("../controllers/orderController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Apply auth token validation to all cart & order endpoints
router.use(auth_1.authenticateToken);
router.get('/cart', orderController_1.getCart);
router.post('/cart', orderController_1.addToCart);
router.put('/cart/:id', orderController_1.updateCartQuantity);
router.delete('/cart/:id', orderController_1.removeFromCart);
router.get('/my-orders', orderController_1.getMyOrders);
router.post('/checkout', orderController_1.createOrder);
router.post('/verify-payment', orderController_1.verifyPayment);
exports.default = router;
