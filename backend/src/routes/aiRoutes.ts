import { Router } from 'express';
import { getAIRecommendations, processAIChat } from '../controllers/aiController';

const router = Router();

router.post('/recommend', getAIRecommendations);
router.post('/chat', processAIChat);

export default router;
