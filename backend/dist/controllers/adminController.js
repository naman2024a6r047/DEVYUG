"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminDeleteBlogPost = exports.adminEditBlogPost = exports.adminAddBlogPost = exports.adminGetAnalytics = exports.adminGetCustomers = exports.adminUpdateOrderStatus = exports.adminGetOrders = exports.adminDeleteProduct = exports.adminEditProduct = exports.adminAddProduct = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const logger_1 = require("../utils/logger");
// Helper to convert string slug
const slugify = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
};
// --- PRODUCT INVENTORY CRUD ---
const adminAddProduct = async (req, res, next) => {
    try {
        const { name, description, price, salePrice, stock, category, subCategory, images, videoUrl, ingredients, benefits, usageInstructions, ayurvedicProperties } = req.body;
        if (!name || !description || price === undefined || !category) {
            return res.status(400).json({ success: false, message: 'Name, description, price, and category are required' });
        }
        const slug = slugify(name);
        const existing = await prisma_1.default.product.findUnique({ where: { slug } });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Product name already exists, resulting in a duplicate slug' });
        }
        // Prepare JSON arrays
        const imagesJson = JSON.stringify(images || []);
        const ingredientsJson = JSON.stringify(ingredients || []);
        const benefitsJson = JSON.stringify(benefits || []);
        const product = await prisma_1.default.product.create({
            data: {
                name,
                slug,
                description,
                price: parseFloat(price),
                salePrice: salePrice ? parseFloat(salePrice) : null,
                stock: parseInt(stock || 10, 10),
                category,
                subCategory,
                images: imagesJson,
                videoUrl,
                ingredients: ingredientsJson,
                benefits: benefitsJson,
                usageInstructions,
                ayurvedicProperties
            }
        });
        logger_1.logger.info(`Admin created product: ${product.name}`);
        return res.status(201).json({
            success: true,
            message: 'Product created successfully',
            product
        });
    }
    catch (error) {
        next(error);
    }
};
exports.adminAddProduct = adminAddProduct;
const adminEditProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description, price, salePrice, stock, category, subCategory, images, videoUrl, ingredients, benefits, usageInstructions, ayurvedicProperties, isBestSeller, isFeatured } = req.body;
        const existingProduct = await prisma_1.default.product.findUnique({ where: { id } });
        if (!existingProduct) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        const updateData = {};
        if (name) {
            updateData.name = name;
            updateData.slug = slugify(name);
        }
        if (description)
            updateData.description = description;
        if (price !== undefined)
            updateData.price = parseFloat(price);
        if (salePrice !== undefined)
            updateData.salePrice = salePrice ? parseFloat(salePrice) : null;
        if (stock !== undefined)
            updateData.stock = parseInt(stock, 10);
        if (category)
            updateData.category = category;
        if (subCategory !== undefined)
            updateData.subCategory = subCategory;
        if (images)
            updateData.images = JSON.stringify(images);
        if (videoUrl !== undefined)
            updateData.videoUrl = videoUrl;
        if (ingredients)
            updateData.ingredients = JSON.stringify(ingredients);
        if (benefits)
            updateData.benefits = JSON.stringify(benefits);
        if (usageInstructions !== undefined)
            updateData.usageInstructions = usageInstructions;
        if (ayurvedicProperties !== undefined)
            updateData.ayurvedicProperties = ayurvedicProperties;
        if (isBestSeller !== undefined)
            updateData.isBestSeller = isBestSeller;
        if (isFeatured !== undefined)
            updateData.isFeatured = isFeatured;
        const product = await prisma_1.default.product.update({
            where: { id },
            data: updateData
        });
        logger_1.logger.info(`Admin updated product: ${product.id}`);
        return res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            product
        });
    }
    catch (error) {
        next(error);
    }
};
exports.adminEditProduct = adminEditProduct;
const adminDeleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        await prisma_1.default.product.delete({ where: { id } });
        logger_1.logger.info(`Admin deleted product ID: ${id}`);
        return res.status(200).json({ success: true, message: 'Product deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.adminDeleteProduct = adminDeleteProduct;
// --- GLOBAL ORDER MANAGEMENT ---
const adminGetOrders = async (req, res, next) => {
    try {
        const orders = await prisma_1.default.order.findMany({
            include: {
                user: {
                    select: { id: true, name: true, email: true }
                },
                items: {
                    include: { product: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        const parsedOrders = orders.map((order) => ({
            ...order,
            items: order.items.map((item) => ({
                ...item,
                product: {
                    ...item.product,
                    images: typeof item.product.images === 'string' ? JSON.parse(item.product.images) : item.product.images
                }
            }))
        }));
        return res.status(200).json({ success: true, orders: parsedOrders });
    }
    catch (error) {
        next(error);
    }
};
exports.adminGetOrders = adminGetOrders;
const adminUpdateOrderStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'PENDING', 'SHIPPED', 'DELIVERED', 'RETURNED'
        if (!['PENDING', 'SHIPPED', 'DELIVERED', 'RETURNED'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status type' });
        }
        const order = await prisma_1.default.order.update({
            where: { id },
            data: { status }
        });
        logger_1.logger.info(`Admin updated order ${id} status to ${status}`);
        return res.status(200).json({
            success: true,
            message: `Order status updated to ${status}`,
            order
        });
    }
    catch (error) {
        next(error);
    }
};
exports.adminUpdateOrderStatus = adminUpdateOrderStatus;
// --- CUSTOMER LIST MANAGEMENT ---
const adminGetCustomers = async (req, res, next) => {
    try {
        const customers = await prisma_1.default.user.findMany({
            where: { role: 'USER' },
            include: {
                profile: true,
                orders: {
                    select: { id: true, totalAmount: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return res.status(200).json({ success: true, customers });
    }
    catch (error) {
        next(error);
    }
};
exports.adminGetCustomers = adminGetCustomers;
// --- DASHBOARD ANALYTICS ENGINE ---
const adminGetAnalytics = async (req, res, next) => {
    try {
        const [totalUsers, totalProducts, orders] = await prisma_1.default.$transaction([
            prisma_1.default.user.count({ where: { role: 'USER' } }),
            prisma_1.default.product.count(),
            prisma_1.default.order.findMany({
                where: { paymentStatus: 'PAID' },
                include: {
                    items: {
                        include: { product: true }
                    }
                }
            })
        ]);
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        const totalOrders = orders.length;
        // Compile revenue over past few days (mocked timeline or real values grouped)
        const salesTimeline = [
            { date: 'Jun 02', sales: totalRevenue * 0.12 },
            { date: 'Jun 03', sales: totalRevenue * 0.15 },
            { date: 'Jun 04', sales: totalRevenue * 0.18 },
            { date: 'Jun 05', sales: totalRevenue * 0.14 },
            { date: 'Jun 06', sales: totalRevenue * 0.22 },
            { date: 'Jun 07', sales: totalRevenue * 0.19 },
            { date: 'Jun 08', sales: totalRevenue }
        ];
        // Compile product sales distribution
        const productStats = {};
        orders.forEach((order) => {
            order.items.forEach((item) => {
                if (!productStats[item.productId]) {
                    productStats[item.productId] = {
                        name: item.product.name,
                        quantity: 0,
                        revenue: 0
                    };
                }
                productStats[item.productId].quantity += item.quantity;
                productStats[item.productId].revenue += item.price * item.quantity;
            });
        });
        const productSales = Object.values(productStats).sort((a, b) => b.revenue - a.revenue);
        return res.status(200).json({
            success: true,
            summary: {
                totalRevenue,
                totalOrders,
                totalUsers,
                totalProducts
            },
            salesTimeline,
            productSales
        });
    }
    catch (error) {
        next(error);
    }
};
exports.adminGetAnalytics = adminGetAnalytics;
// --- BLOG POST ADMIN CRUD ---
const adminAddBlogPost = async (req, res, next) => {
    try {
        const { title, content, category, author, image } = req.body;
        if (!title || !content || !category || !image) {
            return res.status(400).json({ success: false, message: 'Title, content, category, and image are required' });
        }
        const slug = slugify(title);
        const existing = await prisma_1.default.blogPost.findUnique({ where: { slug } });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Blog title already exists, resulting in a duplicate slug' });
        }
        const post = await prisma_1.default.blogPost.create({
            data: {
                title,
                slug,
                content,
                category,
                author: author || 'DVYUG Acharya',
                image
            }
        });
        logger_1.logger.info(`Admin created blog post: ${post.title}`);
        return res.status(201).json({
            success: true,
            message: 'Blog post created successfully',
            post
        });
    }
    catch (error) {
        next(error);
    }
};
exports.adminAddBlogPost = adminAddBlogPost;
const adminEditBlogPost = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, content, category, author, image } = req.body;
        const existingPost = await prisma_1.default.blogPost.findUnique({ where: { id } });
        if (!existingPost) {
            return res.status(404).json({ success: false, message: 'Blog post not found' });
        }
        const updateData = {};
        if (title) {
            updateData.title = title;
            updateData.slug = slugify(title);
        }
        if (content)
            updateData.content = content;
        if (category)
            updateData.category = category;
        if (author)
            updateData.author = author;
        if (image)
            updateData.image = image;
        const post = await prisma_1.default.blogPost.update({
            where: { id },
            data: updateData
        });
        logger_1.logger.info(`Admin updated blog post ID: ${post.id}`);
        return res.status(200).json({
            success: true,
            message: 'Blog post updated successfully',
            post
        });
    }
    catch (error) {
        next(error);
    }
};
exports.adminEditBlogPost = adminEditBlogPost;
const adminDeleteBlogPost = async (req, res, next) => {
    try {
        const { id } = req.params;
        await prisma_1.default.blogPost.delete({ where: { id } });
        logger_1.logger.info(`Admin deleted blog post ID: ${id}`);
        return res.status(200).json({ success: true, message: 'Blog post deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.adminDeleteBlogPost = adminDeleteBlogPost;
