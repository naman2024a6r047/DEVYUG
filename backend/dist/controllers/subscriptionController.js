"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSubscriptionStatus = exports.createSubscription = exports.getMySubscriptions = exports.getSubscriptionPlans = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const logger_1 = require("../utils/logger");
const SUBSCRIPTION_PLANS = [
    { id: 'sub-tea', name: 'Herbal Tea Kit', price: 599.0, description: 'Monthly delivery of handpicked premium herbal, green and Tulsi teas' },
    { id: 'sub-wellness', name: 'Daily Wellness Pack', price: 999.0, description: 'Monthly custom dose packs of Ashwagandha, Giloy, and immunity supplements' },
    { id: 'sub-puja', name: 'Monthly Puja Kit', price: 799.0, description: 'Monthly delivery of organic incense, pure camphor, ghee, and puja essentials' }
];
const getSubscriptionPlans = async (req, res, next) => {
    return res.status(200).json({ success: true, plans: SUBSCRIPTION_PLANS });
};
exports.getSubscriptionPlans = getSubscriptionPlans;
const getMySubscriptions = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const subscriptions = await prisma_1.default.subscription.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
        return res.status(200).json({ success: true, subscriptions });
    }
    catch (error) {
        next(error);
    }
};
exports.getMySubscriptions = getMySubscriptions;
const createSubscription = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { planId } = req.body;
        if (!planId) {
            return res.status(400).json({ success: false, message: 'Plan ID is required' });
        }
        const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
        if (!plan) {
            return res.status(404).json({ success: false, message: 'Subscription plan not found' });
        }
        // Check if user already has this active subscription
        const existing = await prisma_1.default.subscription.findFirst({
            where: {
                userId,
                planName: plan.name,
                status: 'ACTIVE'
            }
        });
        if (existing) {
            return res.status(400).json({ success: false, message: 'You already have an active subscription for this plan' });
        }
        // Set next delivery date to 30 days from now
        const nextDeliveryDate = new Date();
        nextDeliveryDate.setDate(nextDeliveryDate.getDate() + 30);
        const subscription = await prisma_1.default.subscription.create({
            data: {
                userId,
                planName: plan.name,
                price: plan.price,
                frequency: 'Monthly',
                nextDeliveryDate,
                status: 'ACTIVE'
            }
        });
        logger_1.logger.info(`Subscription created: ${subscription.planName} for user ${userId}`);
        return res.status(201).json({
            success: true,
            message: 'Subscribed successfully',
            subscription
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createSubscription = createSubscription;
const updateSubscriptionStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'ACTIVE', 'PAUSED', 'CANCELLED'
        if (!['ACTIVE', 'PAUSED', 'CANCELLED'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid subscription status' });
        }
        const subscription = await prisma_1.default.subscription.update({
            where: { id },
            data: { status }
        });
        logger_1.logger.info(`Subscription ${id} status updated to ${status}`);
        return res.status(200).json({
            success: true,
            message: `Subscription has been successfully ${status.toLowerCase()}`,
            subscription
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateSubscriptionStatus = updateSubscriptionStatus;
