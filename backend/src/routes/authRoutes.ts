import { Router } from 'express';
import { register, login, sendOTP, verifyOTP } from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/otp-send', sendOTP);
router.post('/otp-verify', verifyOTP);

export default router;
