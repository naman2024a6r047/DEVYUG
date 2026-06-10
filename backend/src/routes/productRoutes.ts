import { Router } from 'express';
import { getProducts, getProductBySlug, createReview, getFeaturedAndBestSellers } from '../controllers/productController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', getProducts);
router.get('/featured', getFeaturedAndBestSellers);
router.get('/:slug', getProductBySlug);
router.post('/review', authenticateToken as any, createReview);

export default router;
