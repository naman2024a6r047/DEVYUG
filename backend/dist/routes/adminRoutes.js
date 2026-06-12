"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Apply auth & role guards to all admin actions
router.use(auth_1.authenticateToken, auth_1.requireAdmin);
router.post('/products', adminController_1.adminAddProduct);
router.put('/products/:id', adminController_1.adminEditProduct);
router.delete('/products/:id', adminController_1.adminDeleteProduct);
router.post('/blogs', adminController_1.adminAddBlogPost);
router.put('/blogs/:id', adminController_1.adminEditBlogPost);
router.delete('/blogs/:id', adminController_1.adminDeleteBlogPost);
router.get('/orders', adminController_1.adminGetOrders);
router.put('/orders/:id/status', adminController_1.adminUpdateOrderStatus);
router.get('/customers', adminController_1.adminGetCustomers);
router.get('/analytics', adminController_1.adminGetAnalytics);
exports.default = router;
