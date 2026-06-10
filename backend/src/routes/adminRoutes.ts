import { Router } from 'express';
import {
  adminAddProduct,
  adminEditProduct,
  adminDeleteProduct,
  adminGetOrders,
  adminUpdateOrderStatus,
  adminGetCustomers,
  adminGetAnalytics,
  adminAddBlogPost,
  adminEditBlogPost,
  adminDeleteBlogPost
} from '../controllers/adminController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// Apply auth & role guards to all admin actions
router.use(authenticateToken as any, requireAdmin as any);

router.post('/products', adminAddProduct);
router.put('/products/:id', adminEditProduct);
router.delete('/products/:id', adminDeleteProduct);

router.post('/blogs', adminAddBlogPost);
router.put('/blogs/:id', adminEditBlogPost);
router.delete('/blogs/:id', adminDeleteBlogPost);

router.get('/orders', adminGetOrders);
router.put('/orders/:id/status', adminUpdateOrderStatus);

router.get('/customers', adminGetCustomers);
router.get('/analytics', adminGetAnalytics);

export default router;
