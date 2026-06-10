import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { logger } from '../utils/logger';

// Helper to convert string slug
const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

// --- PRODUCT INVENTORY CRUD ---

export const adminAddProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, price, salePrice, stock, category, subCategory, images, videoUrl, ingredients, benefits, usageInstructions, ayurvedicProperties } = req.body;

    if (!name || !description || price === undefined || !category) {
      return res.status(400).json({ success: false, message: 'Name, description, price, and category are required' });
    }

    const slug = slugify(name);
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Product name already exists, resulting in a duplicate slug' });
    }

    // Prepare JSON arrays
    const imagesJson = JSON.stringify(images || []);
    const ingredientsJson = JSON.stringify(ingredients || []);
    const benefitsJson = JSON.stringify(benefits || []);

    const product = await prisma.product.create({
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

    logger.info(`Admin created product: ${product.name}`);

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });

  } catch (error) {
    next(error);
  }
};

export const adminEditProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, description, price, salePrice, stock, category, subCategory, images, videoUrl, ingredients, benefits, usageInstructions, ayurvedicProperties, isBestSeller, isFeatured } = req.body;

    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const updateData: any = {};
    if (name) {
      updateData.name = name;
      updateData.slug = slugify(name);
    }
    if (description) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (salePrice !== undefined) updateData.salePrice = salePrice ? parseFloat(salePrice) : null;
    if (stock !== undefined) updateData.stock = parseInt(stock, 10);
    if (category) updateData.category = category;
    if (subCategory !== undefined) updateData.subCategory = subCategory;
    if (images) updateData.images = JSON.stringify(images);
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl;
    if (ingredients) updateData.ingredients = JSON.stringify(ingredients);
    if (benefits) updateData.benefits = JSON.stringify(benefits);
    if (usageInstructions !== undefined) updateData.usageInstructions = usageInstructions;
    if (ayurvedicProperties !== undefined) updateData.ayurvedicProperties = ayurvedicProperties;
    if (isBestSeller !== undefined) updateData.isBestSeller = isBestSeller;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;

    const product = await prisma.product.update({
      where: { id },
      data: updateData
    });

    logger.info(`Admin updated product: ${product.id}`);

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product
    });

  } catch (error) {
    next(error);
  }
};

export const adminDeleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({ where: { id } });

    logger.info(`Admin deleted product ID: ${id}`);

    return res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// --- GLOBAL ORDER MANAGEMENT ---

export const adminGetOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await prisma.order.findMany({
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

    const parsedOrders = orders.map((order: any) => ({
      ...order,
      items: order.items.map((item: any) => ({
        ...item,
        product: {
          ...item.product,
          images: typeof item.product.images === 'string' ? JSON.parse(item.product.images) : item.product.images
        }
      }))
    }));

    return res.status(200).json({ success: true, orders: parsedOrders });
  } catch (error) {
    next(error);
  }
};

export const adminUpdateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'PENDING', 'SHIPPED', 'DELIVERED', 'RETURNED'

    if (!['PENDING', 'SHIPPED', 'DELIVERED', 'RETURNED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status type' });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status }
    });

    logger.info(`Admin updated order ${id} status to ${status}`);

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order
    });

  } catch (error) {
    next(error);
  }
};

// --- CUSTOMER LIST MANAGEMENT ---

export const adminGetCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customers = await prisma.user.findMany({
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
  } catch (error) {
    next(error);
  }
};

// --- DASHBOARD ANALYTICS ENGINE ---

export const adminGetAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [totalUsers, totalProducts, orders] = await prisma.$transaction([
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.product.count(),
      prisma.order.findMany({
        where: { paymentStatus: 'PAID' },
        include: {
          items: {
            include: { product: true }
          }
        }
      })
    ]);

    const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.totalAmount, 0);
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
    const productStats: Record<string, { name: string; quantity: number; revenue: number }> = {};

    orders.forEach((order: any) => {
      order.items.forEach((item: any) => {
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

  } catch (error) {
    next(error);
  }
};

// --- BLOG POST ADMIN CRUD ---

export const adminAddBlogPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, content, category, author, image } = req.body;

    if (!title || !content || !category || !image) {
      return res.status(400).json({ success: false, message: 'Title, content, category, and image are required' });
    }

    const slug = slugify(title);
    const existing = await prisma.blogPost.findUnique({ where: { slug } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Blog title already exists, resulting in a duplicate slug' });
    }

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        content,
        category,
        author: author || 'DVYUG Acharya',
        image
      }
    });

    logger.info(`Admin created blog post: ${post.title}`);

    return res.status(201).json({
      success: true,
      message: 'Blog post created successfully',
      post
    });
  } catch (error) {
    next(error);
  }
};

export const adminEditBlogPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title, content, category, author, image } = req.body;

    const existingPost = await prisma.blogPost.findUnique({ where: { id } });
    if (!existingPost) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }

    const updateData: any = {};
    if (title) {
      updateData.title = title;
      updateData.slug = slugify(title);
    }
    if (content) updateData.content = content;
    if (category) updateData.category = category;
    if (author) updateData.author = author;
    if (image) updateData.image = image;

    const post = await prisma.blogPost.update({
      where: { id },
      data: updateData
    });

    logger.info(`Admin updated blog post ID: ${post.id}`);

    return res.status(200).json({
      success: true,
      message: 'Blog post updated successfully',
      post
    });
  } catch (error) {
    next(error);
  }
};

export const adminDeleteBlogPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await prisma.blogPost.delete({ where: { id } });

    logger.info(`Admin deleted blog post ID: ${id}`);

    return res.status(200).json({ success: true, message: 'Blog post deleted successfully' });
  } catch (error) {
    next(error);
  }
};

