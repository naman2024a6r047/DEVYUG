"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFeaturedAndBestSellers = exports.createReview = exports.getProductBySlug = exports.getProducts = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const logger_1 = require("../utils/logger");
const getProducts = async (req, res, next) => {
    try {
        const { category, minPrice, maxPrice, search, sortBy, page = '1', limit = '12' } = req.query;
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 12;
        const skipNum = (pageNum - 1) * limitNum;
        // Build Prisma query filter
        const whereClause = {};
        if (category) {
            whereClause.category = category;
        }
        if (minPrice || maxPrice) {
            whereClause.price = {};
            if (minPrice)
                whereClause.price.gte = parseFloat(minPrice);
            if (maxPrice)
                whereClause.price.lte = parseFloat(maxPrice);
        }
        if (search) {
            whereClause.OR = [
                { name: { contains: search } },
                { description: { contains: search } },
            ];
        }
        // Sorting options
        let orderByClause = { createdAt: 'desc' }; // default: newest
        if (sortBy === 'priceAsc') {
            orderByClause = { price: 'asc' };
        }
        else if (sortBy === 'priceDesc') {
            orderByClause = { price: 'desc' };
        }
        else if (sortBy === 'popularity') {
            orderByClause = { ratings: 'desc' };
        }
        // Fetch products
        const [products, totalCount] = await prisma_1.default.$transaction([
            prisma_1.default.product.findMany({
                where: whereClause,
                orderBy: orderByClause,
                skip: skipNum,
                take: limitNum,
            }),
            prisma_1.default.product.count({ where: whereClause }),
        ]);
        // Parse MySQL JSON fields for arrays (images, ingredients, benefits)
        const parsedProducts = products.map((product) => ({
            ...product,
            images: typeof product.images === 'string' ? JSON.parse(product.images) : product.images,
            ingredients: typeof product.ingredients === 'string' ? JSON.parse(product.ingredients) : product.ingredients,
            benefits: typeof product.benefits === 'string' ? JSON.parse(product.benefits) : product.benefits,
        }));
        return res.status(200).json({
            success: true,
            data: parsedProducts,
            pagination: {
                totalItems: totalCount,
                totalPages: Math.ceil(totalCount / limitNum),
                currentPage: pageNum,
                pageSize: limitNum,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getProducts = getProducts;
const getProductBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const product = await prisma_1.default.product.findUnique({
            where: { slug },
            include: {
                reviews: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
        });
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        // Parse images, ingredients, benefits
        const parsedProduct = {
            ...product,
            images: typeof product.images === 'string' ? JSON.parse(product.images) : product.images,
            ingredients: typeof product.ingredients === 'string' ? JSON.parse(product.ingredients) : product.ingredients,
            benefits: typeof product.benefits === 'string' ? JSON.parse(product.benefits) : product.benefits,
        };
        // Get related products (same category, excluding current product)
        const relatedRaw = await prisma_1.default.product.findMany({
            where: {
                category: product.category,
                NOT: { id: product.id },
            },
            take: 4,
        });
        const related = relatedRaw.map((p) => ({
            ...p,
            images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images,
            ingredients: typeof p.ingredients === 'string' ? JSON.parse(p.ingredients) : p.ingredients,
            benefits: typeof p.benefits === 'string' ? JSON.parse(p.benefits) : p.benefits,
        }));
        return res.status(200).json({
            success: true,
            product: parsedProduct,
            related,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getProductBySlug = getProductBySlug;
const createReview = async (req, res, next) => {
    try {
        const { productId, rating, comment } = req.body;
        const userId = req.user.id;
        if (!productId || !rating || !comment) {
            return res.status(400).json({ success: false, message: 'Product ID, rating, and comment are required' });
        }
        // Create review
        const review = await prisma_1.default.review.create({
            data: {
                productId,
                userId,
                rating: parseInt(rating, 10),
                comment,
            },
            include: {
                user: {
                    select: { name: true }
                }
            }
        });
        // Recalculate product ratings average
        const allReviews = await prisma_1.default.review.findMany({
            where: { productId },
            select: { rating: true },
        });
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
        await prisma_1.default.product.update({
            where: { id: productId },
            data: {
                ratings: Math.round(avgRating * 10) / 10,
            },
        });
        logger_1.logger.info(`Review created for product ${productId} by user ${userId}`);
        return res.status(201).json({
            success: true,
            message: 'Review submitted successfully',
            review,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createReview = createReview;
const getFeaturedAndBestSellers = async (req, res, next) => {
    try {
        const featuredRaw = await prisma_1.default.product.findMany({
            where: { isFeatured: true },
            take: 8,
        });
        const bestSellersRaw = await prisma_1.default.product.findMany({
            where: { isBestSeller: true },
            take: 8,
        });
        const mapParser = (product) => ({
            ...product,
            images: typeof product.images === 'string' ? JSON.parse(product.images) : product.images,
            ingredients: typeof product.ingredients === 'string' ? JSON.parse(product.ingredients) : product.ingredients,
            benefits: typeof product.benefits === 'string' ? JSON.parse(product.benefits) : product.benefits,
        });
        return res.status(200).json({
            success: true,
            featured: featuredRaw.map(mapParser),
            bestSellers: bestSellersRaw.map(mapParser),
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getFeaturedAndBestSellers = getFeaturedAndBestSellers;
