import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { logger } from '../utils/logger';

// Get all blog posts
export const getBlogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, search } = req.query;

    const whereClause: any = {};

    if (category) {
      whereClause.category = category as string;
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search as string } },
        { content: { contains: search as string } }
      ];
    }

    const posts = await prisma.blogPost.findMany({
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
  } catch (error) {
    next(error);
  }
};

// Get single blog post by slug
export const getBlogBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;

    const post = await prisma.blogPost.findUnique({
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
  } catch (error) {
    next(error);
  }
};

// Add comment to blog post
export const addBlogComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const { authorName, content } = req.body;

    if (!authorName || !content) {
      return res.status(400).json({
        success: false,
        message: 'Name and comment content are required'
      });
    }

    const post = await prisma.blogPost.findUnique({
      where: { slug }
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    const comment = await prisma.blogComment.create({
      data: {
        postId: post.id,
        authorName,
        content
      }
    });

    logger.info(`Comment added to blog post: ${post.title} by ${authorName}`);

    return res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment
    });
  } catch (error) {
    next(error);
  }
};
