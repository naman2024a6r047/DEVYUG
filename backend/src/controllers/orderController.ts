import { Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

// Coupon code database simulation
const VALID_COUPONS = {
  'VEDIC10': 0.10, // 10% off
  'DIVINE20': 0.20, // 20% off
  'FIRST50': 50.0 // Flat 50 INR off
};

// --- CART MANAGEMENT ---

export const getCart = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: true
      }
    });

    const parsedCart = cartItems.map((item: any) => ({
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
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if item already in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: { userId, productId }
    });

    let cartItem;
    if (existingItem) {
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity }
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: { userId, productId, quantity }
      });
    }

    return res.status(200).json({ success: true, message: 'Added to cart', cartItem });
  } catch (error) {
    next(error);
  }
};

export const updateCartQuantity = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params; // cartItem ID
    const { quantity } = req.body;

    if (quantity === undefined || quantity <= 0) {
      return res.status(400).json({ success: false, message: 'Valid quantity is required' });
    }

    const cartItem = await prisma.cartItem.update({
      where: { id },
      data: { quantity }
    });

    return res.status(200).json({ success: true, cartItem });
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await prisma.cartItem.delete({ where: { id } });

    return res.status(200).json({ success: true, message: 'Item removed from cart' });
  } catch (error) {
    next(error);
  }
};

// --- ORDER OPERATIONS ---

export const createOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { items, shippingAddress, paymentMethod, couponCode, redeemPoints = false } = req.body;

    if (!items || items.length === 0 || !shippingAddress || !paymentMethod) {
      return res.status(400).json({ success: false, message: 'Missing required order details' });
    }

    let subTotal = 0;
    const orderItemsToCreate = [];

    // Verify stock and calculate total
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
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
      const couponValue = VALID_COUPONS[couponCode as keyof typeof VALID_COUPONS];
      if (couponValue !== undefined) {
        if (couponValue < 1.0) {
          discount = subTotal * couponValue; // percentage
        } else {
          discount = couponValue; // flat off
        }
      }
    }

    let finalTotal = subTotal - discount;

    // Handle Loyalty Points deduction
    const profile = await prisma.profile.findUnique({ where: { userId } });
    let pointsDeducted = 0;
    if (redeemPoints && profile && profile.loyaltyPoints > 0) {
      // 1 loyalty point = 1 INR discount
      const pointsToRedeem = Math.min(profile.loyaltyPoints, Math.floor(finalTotal));
      finalTotal -= pointsToRedeem;
      pointsDeducted = pointsToRedeem;
    }

    if (finalTotal < 0) finalTotal = 0;

    // Calculate Loyalty Points earned (10% of final total value)
    const pointsEarned = Math.floor(finalTotal * 0.10);

    // Create order transaction
    const order = await prisma.order.create({
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
    await prisma.$transaction([
      // Deduct stock
      ...items.map((item: any) =>
        prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        })
      ),
      // Update points
      prisma.profile.update({
        where: { userId },
        data: {
          loyaltyPoints: {
            decrement: pointsDeducted,
            increment: pointsEarned
          }
        }
      }),
      // Clear Cart items
      prisma.cartItem.deleteMany({ where: { userId } })
    ]);

    logger.info(`Order placed successfully: ${order.id} for user ${userId}`);

    // If Razorpay, generate a mock payment checkout details
    const razorpayOrderId = paymentMethod === 'COD' ? null : `order_rzp_mock_${Math.random().toString(36).substring(2, 12)}`;

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order,
      razorpayOrderId
    });

  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { orderId, paymentId, paymentStatus = 'PAID' } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus,
        paymentId
      }
    });

    logger.info(`Payment verified for order: ${orderId}, Transaction Ref: ${paymentId}`);

    return res.status(200).json({
      success: true,
      message: 'Payment status updated successfully',
      order: updatedOrder
    });

  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const orders = await prisma.order.findMany({
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

    const parsedOrders = orders.map((order: any) => ({
      ...order,
      items: order.items.map((item: any) => ({
        ...item,
        product: {
          ...item.product,
          images: typeof item.product.images === 'string' ? JSON.parse(item.product.images) : item.product.images,
        }
      }))
    }));

    return res.status(200).json({ success: true, orders: parsedOrders });
  } catch (error) {
    next(error);
  }
};
