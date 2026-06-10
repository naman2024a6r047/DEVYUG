import { Router } from 'express';
import { getCart, addToCart, updateCartQuantity, removeFromCart, createOrder, verifyPayment, getMyOrders } from '../controllers/orderController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Apply auth token validation to all cart & order endpoints
router.use(authenticateToken as any);

router.get('/cart', getCart);
router.post('/cart', addToCart);
router.put('/cart/:id', updateCartQuantity);
router.delete('/cart/:id', removeFromCart);

router.get('/my-orders', getMyOrders);
router.post('/checkout', createOrder);
router.post('/verify-payment', verifyPayment);

export default router;
