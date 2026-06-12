"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOTP = exports.sendOTP = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const logger_1 = require("../utils/logger");
const JWT_SECRET = process.env.JWT_SECRET || 'dvyug_super_secret_jwt_key_spiritual_elevation_2026';
// Helper to generate a referral code
const generateReferralCode = (name) => {
    const cleanName = name.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 5);
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `${cleanName}${randomNum}`;
};
const register = async (req, res, next) => {
    try {
        const { name, email, password, phone, referredBy } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Name, email and password are required' });
        }
        const existingUser = await prisma_1.default.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const referralCode = generateReferralCode(name);
        // If referredBy is provided, check if that profile exists
        let referralPointsAwarded = false;
        if (referredBy) {
            const referrer = await prisma_1.default.profile.findUnique({
                where: { referralCode: referredBy }
            });
            if (referrer) {
                referralPointsAwarded = true;
            }
        }
        const newUser = await prisma_1.default.user.create({
            data: {
                name,
                email,
                passwordHash,
                profile: {
                    create: {
                        phone,
                        referralCode,
                        referredBy: referredBy && referralPointsAwarded ? referredBy : null,
                        loyaltyPoints: referredBy && referralPointsAwarded ? 50 : 0 // 50 points welcome bonus if referred
                    }
                }
            },
            include: {
                profile: true
            }
        });
        // Credit referrer if code was valid
        if (referredBy && referralPointsAwarded) {
            await prisma_1.default.profile.update({
                where: { referralCode: referredBy },
                data: {
                    loyaltyPoints: { increment: 100 } // Give 100 points to the referrer
                }
            });
            logger_1.logger.info(`Referral points awarded to referrer with code ${referredBy}`);
        }
        // Generate JWT
        const token = jsonwebtoken_1.default.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
        logger_1.logger.info(`User registered successfully: ${email}`);
        const { passwordHash: _, ...userWithoutPassword } = newUser;
        return res.status(201).json({
            success: true,
            message: 'Registration successful',
            token,
            user: userWithoutPassword
        });
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }
        const user = await prisma_1.default.user.findUnique({
            where: { email },
            include: { profile: true }
        });
        if (!user || !user.passwordHash) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        logger_1.logger.info(`User logged in: ${email}`);
        const { passwordHash: _, ...userWithoutPassword } = user;
        return res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: userWithoutPassword
        });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
// Mock OTP verification code store
const otpStore = new Map();
const sendOTP = async (req, res, next) => {
    try {
        const { email, phone, name } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }
        // Generate a 6-digit mock OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = Date.now() + 5 * 60 * 1000; // 5 mins expiry
        otpStore.set(email, { otp, expires, name, phone });
        // Print to console logger so developer can read it
        logger_1.logger.info(`[MOCK OTP SERVICE] Sent OTP to ${email}: ${otp}`);
        return res.status(200).json({
            success: true,
            message: 'OTP sent successfully (Check console logs in development)',
            email
        });
    }
    catch (error) {
        next(error);
    }
};
exports.sendOTP = sendOTP;
const verifyOTP = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ success: false, message: 'Email and OTP are required' });
        }
        const storedData = otpStore.get(email);
        if (!storedData) {
            return res.status(400).json({ success: false, message: 'OTP request not found or expired' });
        }
        if (Date.now() > storedData.expires) {
            otpStore.delete(email);
            return res.status(400).json({ success: false, message: 'OTP expired' });
        }
        // Allow mock code '123456' or the generated otp
        if (otp !== storedData.otp && otp !== '123456') {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }
        // Verification succeeded
        otpStore.delete(email);
        // Check if user exists, if not create them
        let user = await prisma_1.default.user.findUnique({
            where: { email },
            include: { profile: true }
        });
        if (!user) {
            // Create user
            const referralCode = generateReferralCode(storedData.name || 'User');
            user = await prisma_1.default.user.create({
                data: {
                    name: storedData.name || email.split('@')[0],
                    email,
                    profile: {
                        create: {
                            phone: storedData.phone || '',
                            referralCode,
                            loyaltyPoints: 20 // 20 welcome points for OTP signup
                        }
                    }
                },
                include: {
                    profile: true
                }
            });
            logger_1.logger.info(`User registered via OTP: ${email}`);
        }
        else {
            logger_1.logger.info(`User logged in via OTP: ${email}`);
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        const { passwordHash: _, ...userWithoutPassword } = user;
        return res.status(200).json({
            success: true,
            message: 'OTP verified successfully',
            token,
            user: userWithoutPassword
        });
    }
    catch (error) {
        next(error);
    }
};
exports.verifyOTP = verifyOTP;
