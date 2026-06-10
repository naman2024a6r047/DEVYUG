import { Router } from 'express';
import { getSubscriptionPlans, getMySubscriptions, createSubscription, updateSubscriptionStatus } from '../controllers/subscriptionController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/plans', getSubscriptionPlans);
router.get('/my-subscriptions', authenticateToken as any, getMySubscriptions);
router.post('/subscribe', authenticateToken as any, createSubscription);
router.put('/:id/status', authenticateToken as any, updateSubscriptionStatus);

export default router;
