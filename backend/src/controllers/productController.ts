import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { logger } from '../utils/logger';

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, minPrice, maxPrice, search, sortBy, page = '1', limit = '12' } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 12;
    const skipNum = (pageNum - 1) * limitNum;

    // Build Prisma query filter
    const whereClause: any = {};

    if (category) {
      whereClause.category = category as string;
    }

    if (minPrice || maxPrice) {
      whereClause.price = {};
      if (minPrice) whereClause.price.gte = parseFloat(minPrice as string);
      if (maxPrice) whereClause.price.lte = parseFloat(maxPrice as string);
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search as string } },
        { description: { contains: search as string } },
      ];
    }

    // Sorting options
    let orderByClause: any = { createdAt: 'desc' }; // default: newest

    if (sortBy === 'priceAsc') {
      orderByClause = { price: 'asc' };
    } else if (sortBy === 'priceDesc') {
      orderByClause = { price: 'desc' };
    } else if (sortBy === 'popularity') {
      orderByClause = { ratings: 'desc' };
    }

    // Fetch products
    const [products, totalCount] = await prisma.$transaction([
      prisma.product.findMany({
        where: whereClause,
        orderBy: orderByClause,
        skip: skipNum,
        take: limitNum,
      }),
      prisma.product.count({ where: whereClause }),
    ]);

    // Parse MySQL JSON fields for arrays (images, ingredients, benefits)
    const parsedProducts = products.map((product: any) => ({
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

  } catch (error) {
    next(error);
  }
};

export const getProductBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;

    const product = await prisma.product.findUnique({
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
    const relatedRaw = await prisma.product.findMany({
      where: {
        category: product.category,
        NOT: { id: product.id },
      },
      take: 4,
    });

    const related = relatedRaw.map((p: any) => ({
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

  } catch (error) {
    next(error);
  }
};

export const createReview = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.user.id;

    if (!productId || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Product ID, rating, and comment are required' });
    }

    // Create review
    const review = await prisma.review.create({
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
    const allReviews = await prisma.review.findMany({
      where: { productId },
      select: { rating: true },
    });

    const avgRating = allReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / allReviews.length;

    await prisma.product.update({
      where: { id: productId },
      data: {
        ratings: Math.round(avgRating * 10) / 10,
      },
    });

    logger.info(`Review created for product ${productId} by user ${userId}`);

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review,
    });

  } catch (error) {
    next(error);
  }
};

export const getFeaturedAndBestSellers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const featuredRaw = await prisma.product.findMany({
      where: { isFeatured: true },
      take: 8,
    });

    const bestSellersRaw = await prisma.product.findMany({
      where: { isBestSeller: true },
      take: 8,
    });

    const mapParser = (product: any) => ({
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

  } catch (error) {
    next(error);
  }
};
