"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addBlogComment = exports.getBlogBySlug = exports.getBlogs = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const logger_1 = require("../utils/logger");
// Get all blog posts
const getBlogs = async (req, res, next) => {
    try {
        const { category, search } = req.query;
        const whereClause = {};
        if (category) {
            whereClause.category = category;
        }
        if (search) {
            whereClause.OR = [
                { title: { contains: search } },
                { content: { contains: search } }
            ];
        }
        const posts = await prisma_1.default.blogPost.findMany({
            where: whereClause,
            include: {
                comments: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return res.status(200).json({
            success: true,
            posts
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getBlogs = getBlogs;
// Get single blog post by slug
const getBlogBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const post = await prisma_1.default.blogPost.findUnique({
            where: { slug },
            include: {
                comments: {
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        });
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found'
            });
        }
        return res.status(200).json({
            success: true,
            post
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getBlogBySlug = getBlogBySlug;
// Add comment to blog post
const addBlogComment = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const { authorName, content } = req.body;
        if (!authorName || !content) {
            return res.status(400).json({
                success: false,
                message: 'Name and comment content are required'
            });
        }
        const post = await prisma_1.default.blogPost.findUnique({
            where: { slug }
        });
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found'
            });
        }
        const comment = await prisma_1.default.blogComment.create({
            data: {
                postId: post.id,
                authorName,
                content
            }
        });
        logger_1.logger.info(`Comment added to blog post: ${post.title} by ${authorName}`);
        return res.status(201).json({
            success: true,
            message: 'Comment added successfully',
            comment
        });
    }
    catch (error) {
        next(error);
    }
};
exports.addBlogComment = addBlogComment;
