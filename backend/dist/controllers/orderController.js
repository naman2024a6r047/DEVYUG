"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyOrders = exports.verifyPayment = exports.createOrder = exports.removeFromCart = exports.updateCartQuantity = exports.addToCart = exports.getCart = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const logger_1 = require("../utils/logger");
// Coupon code database simulation
const VALID_COUPONS = {
    'VEDIC10': 0.10, // 10% off
    'DIVINE20': 0.20, // 20% off
    'FIRST50': 50.0 // Flat 50 INR off
};
// --- CART MANAGEMENT ---
const getCart = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const cartItems = await prisma_1.default.cartItem.findMany({
            where: { userId },
            include: {
                product: true
            }
        });
        const parsedCart = cartItems.map((item) => ({
            id: item.id,
            quantity: item.quantity,
            product: {
                ...item.product,
                images: typeof item.product.images === 'string' ? JSON.parse(item.product.images) : item.product.images,
                ingredients: typeof item.product.ingredients === 'string' ? JSON.parse(item.product.ingredients) : item.product.ingredients,
                benefits: typeof item.product.benefits === 'string' ? JSON.parse(item.product.benefits) : item.product.benefits,
            }
        }));
        return res.status(200).json({ success: true, cart: parsedCart });
    }
    catch (error) {
        next(error);
    }
};
exports.getCart = getCart;
const addToCart = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { productId, quantity = 1 } = req.body;
        if (!productId) {
            return res.status(400).json({ success: false, message: 'Product ID is required' });
        }
        // Check if product exists
        const product = await prisma_1.default.product.findUnique({ where: { id: productId } });
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        // Check if item already in cart
        const existingItem = await prisma_1.default.cartItem.findFirst({
            where: { userId, productId }
        });
        let cartItem;
        if (existingItem) {
            cartItem = await prisma_1.default.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + quantity }
            });
        }
        else {
            cartItem = await prisma_1.default.cartItem.create({
                data: { userId, productId, quantity }
            });
        }
        return res.status(200).json({ success: true, message: 'Added to cart', cartItem });
    }
    catch (error) {
        next(error);
    }
};
exports.addToCart = addToCart;
const updateCartQuantity = async (req, res, next) => {
    try {
        const { id } = req.params; // cartItem ID
        const { quantity } = req.body;
        if (quantity === undefined || quantity <= 0) {
            return res.status(400).json({ success: false, message: 'Valid quantity is required' });
        }
        const cartItem = await prisma_1.default.cartItem.update({
            where: { id },
            data: { quantity }
        });
        return res.status(200).json({ success: true, cartItem });
    }
    catch (error) {
        next(error);
    }
};
exports.updateCartQuantity = updateCartQuantity;
const removeFromCart = async (req, res, next) => {
    try {
        const { id } = req.params;
        await prisma_1.default.cartItem.delete({ where: { id } });
        return res.status(200).json({ success: true, message: 'Item removed from cart' });
    }
    catch (error) {
        next(error);
    }
};
exports.removeFromCart = removeFromCart;
// --- ORDER OPERATIONS ---
const createOrder = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { items, shippingAddress, paymentMethod, couponCode, redeemPoints = false } = req.body;
        if (!items || items.length === 0 || !shippingAddress || !paymentMethod) {
            return res.status(400).json({ success: false, message: 'Missing required order details' });
        }
        let subTotal = 0;
        const orderItemsToCreate = [];
        // Verify stock and calculate total
        for (const item of items) {
            const product = await prisma_1.default.product.findUnique({ where: { id: item.productId } });
            if (!product) {
                return res.status(404).json({ success: false, message: `Product not found: ${item.productId}` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for product ${product.name}. Available: ${product.stock}`
                });
            }
            const activePrice = product.salePrice ? product.salePrice : product.price;
            subTotal += activePrice * item.quantity;
            orderItemsToCreate.push({
                productId: product.id,
                quantity: item.quantity,
                price: activePrice
            });
        }
        let discount = 0;
        if (couponCode) {
            const couponValue = VALID_COUPONS[couponCode];
            if (couponValue !== undefined) {
                if (couponValue < 1.0) {
                    discount = subTotal * couponValue; // percentage
                }
                else {
                    discount = couponValue; // flat off
                }
            }
        }
        let finalTotal = subTotal - discount;
        // Handle Loyalty Points deduction
        const profile = await prisma_1.default.profile.findUnique({ where: { userId } });
        let pointsDeducted = 0;
        if (redeemPoints && profile && profile.loyaltyPoints > 0) {
            // 1 loyalty point = 1 INR discount
            const pointsToRedeem = Math.min(profile.loyaltyPoints, Math.floor(finalTotal));
            finalTotal -= pointsToRedeem;
            pointsDeducted = pointsToRedeem;
        }
        if (finalTotal < 0)
            finalTotal = 0;
        // Calculate Loyalty Points earned (10% of final total value)
        const pointsEarned = Math.floor(finalTotal * 0.10);
        // Create order transaction
        const order = await prisma_1.default.order.create({
            data: {
                userId,
                totalAmount: finalTotal,
                status: 'PENDING',
                shippingAddress,
                paymentMethod,
                paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
                couponCode: couponCode || null,
                pointsEarned,
                items: {
                    create: orderItemsToCreate
                }
            },
            include: {
                items: {
                    include: { product: true }
                }
            }
        });
        // Update user's profile loyalty points & deduct inventory stock
        // NOTE: Prisma does not allow increment and decrement on the same field in one operation.
        // We compute the net change and apply a single update with raw arithmetic.
        const netPointsChange = pointsEarned - pointsDeducted;
        await prisma_1.default.$transaction([
            // Deduct stock for each ordered item
            ...items.map((item) => prisma_1.default.product.update({
                where: { id: item.productId },
                data: { stock: { decrement: item.quantity } }
            })),
            // Update loyalty points with net change (positive = gain, negative = spend)
            prisma_1.default.profile.update({
                where: { userId },
                data: {
                    loyaltyPoints: netPointsChange >= 0
                        ? { increment: netPointsChange }
                        : { decrement: Math.abs(netPointsChange) }
                }
            }),
            // Clear user's cart after successful order
            prisma_1.default.cartItem.deleteMany({ where: { userId } })
        ]);
        logger_1.logger.info(`Order placed successfully: ${order.id} for user ${userId}`);
        // If Razorpay, generate a mock payment checkout details
        const razorpayOrderId = paymentMethod === 'COD' ? null : `order_rzp_mock_${Math.random().toString(36).substring(2, 12)}`;
        return res.status(201).json({
            success: true,
            message: 'Order created successfully',
            order,
            razorpayOrderId
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createOrder = createOrder;
const verifyPayment = async (req, res, next) => {
    try {
        const { orderId, paymentId, paymentStatus = 'PAID' } = req.body;
        if (!orderId) {
            return res.status(400).json({ success: false, message: 'Order ID is required' });
        }
        const updatedOrder = await prisma_1.default.order.update({
            where: { id: orderId },
            data: {
                paymentStatus,
                paymentId
            }
        });
        logger_1.logger.info(`Payment verified for order: ${orderId}, Transaction Ref: ${paymentId}`);
        return res.status(200).json({
            success: true,
            message: 'Payment status updated successfully',
            order: updatedOrder
        });
    }
    catch (error) {
        next(error);
    }
};
exports.verifyPayment = verifyPayment;
const getMyOrders = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const orders = await prisma_1.default.order.findMany({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        const parsedOrders = orders.map((order) => ({
            ...order,
            items: order.items.map((item) => ({
                ...item,
                product: {
                    ...item.product,
                    images: typeof item.product.images === 'string' ? JSON.parse(item.product.images) : item.product.images,
                }
            }))
        }));
        return res.status(200).json({ success: true, orders: parsedOrders });
    }
    catch (error) {
        next(error);
    }
};
exports.getMyOrders = getMyOrders;
