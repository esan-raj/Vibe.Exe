import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const { category, approved } = req.query;

    const products = await prisma.product.findMany({
      where: {
        status: 'Active',
        approved: approved === 'all' ? undefined : true, // Only show approved products unless admin requests all
        ...(category && { category: category as string })
      },
      include: {
        seller: {
          include: {
            user: {
              select: {
                name: true,
                isVerified: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: products.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        image: p.image,
        imageUrl: p.image,
        category: p.category,
        stock: p.stock,
        approved: p.approved,
        seller: {
          name: p.seller.shopName,
          rating: p.seller.rating,
          isVerified: p.seller.user.isVerified
        },
        inStock: p.stock > 0
      }))
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ success: false, message: 'Failed to get products' });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        seller: {
          include: {
            user: {
              select: {
                name: true,
                isVerified: true
              }
            }
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({
      success: true,
      data: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        category: product.category,
        seller: {
          name: product.seller.shopName,
          rating: product.seller.rating,
          isVerified: product.seller.user.isVerified
        },
        inStock: product.stock > 0
      }
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ success: false, message: 'Failed to get product' });
  }
};

// Seller endpoints
export const getMyProducts = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const seller = await prisma.seller.findUnique({
      where: { userId: req.user.userId },
      include: { products: { orderBy: { createdAt: 'desc' } } }
    });

    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller profile not found' });
    }

    res.json({
      success: true,
      data: seller.products.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        stock: p.stock,
        imageUrl: p.image,
        category: p.category,
        status: p.status.replace('_', ' '),
        sales: p.sales,
        approved: p.approved
      }))
    });
  } catch (error) {
    console.error('Get my products error:', error);
    res.status(500).json({ success: false, message: 'Failed to get products' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const seller = await prisma.seller.findUnique({ where: { userId: req.user.userId } });
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller profile not found. Please complete your seller profile first.' });
    }

    const { name, description, price, image, category, stock } = req.body;

    // Validate required fields
    if (!name || !description || !price || !category) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: name, description, price, and category are required' 
      });
    }

    if (!image || image.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: 'Product image is required' 
      });
    }

    if (isNaN(price) || Number(price) <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Price must be a positive number' 
      });
    }

    const stockValue = stock ? Number(stock) : 0;
    const statusValue = stockValue > 0 ? 'Active' : 'Out_of_Stock';

    const product = await prisma.product.create({
      data: {
        sellerId: seller.id,
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        image: image.trim(),
        category: category.trim(),
        stock: stockValue,
        status: statusValue as 'Active' | 'Out_of_Stock' | 'Draft',
        approved: false // Products need admin approval
      }
    });

    res.status(201).json({
      success: true,
      data: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        imageUrl: product.image,
        category: product.category,
        status: product.status.replace('_', ' '),
        sales: product.sales,
        approved: product.approved
      }
    });
  } catch (error: any) {
    console.error('Create product error:', error);
    
    // Handle Prisma validation errors
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        success: false, 
        message: 'A product with this name already exists' 
      });
    }
    
    if (error.code === 'P2003') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid seller reference' 
      });
    }

    // Handle schema mismatch errors (missing column)
    if (error.message && error.message.includes('Unknown argument') || 
        error.message && error.message.includes('Unknown field')) {
      return res.status(500).json({ 
        success: false, 
        message: 'Database schema mismatch. Please run the migration: ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "approved" BOOLEAN NOT NULL DEFAULT false;' 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to create product. Please try again.' 
    });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, image, category, stock, status } = req.body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(price !== undefined && { price }),
        ...(image && { image }),
        ...(category && { category }),
        ...(stock !== undefined && { stock }),
        ...(status && { status: status.replace(' ', '_') })
      }
    });

    res.json({
      success: true,
      data: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        imageUrl: product.image,
        category: product.category,
        status: product.status.replace('_', ' '),
        sales: product.sales
      }
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ success: false, message: 'Failed to update product' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const { id } = req.params;
    
    // Check if user owns the product or is admin
    const product = await prisma.product.findUnique({
      where: { id },
      include: { seller: { include: { user: true } } }
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Allow deletion if user is admin or owns the product
    if (req.user.role !== 'admin' && product.seller.userId !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this product' });
    }

    await prisma.product.delete({ where: { id } });
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
};

export const approveProduct = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const { id } = req.params;
    const { approved } = req.body;

    const product = await prisma.product.update({
      where: { id },
      data: { approved: approved === true || approved === 'true' }
    });

    res.json({
      success: true,
      data: {
        id: product.id,
        name: product.name,
        approved: product.approved
      }
    });
  } catch (error) {
    console.error('Approve product error:', error);
    res.status(500).json({ success: false, message: 'Failed to update product approval' });
  }
};

export const getPendingProducts = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const products = await prisma.product.findMany({
      where: { approved: false },
      include: {
        seller: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: products.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        imageUrl: p.image,
        category: p.category,
        stock: p.stock,
        status: p.status.replace('_', ' '),
        sales: p.sales,
        approved: p.approved,
        createdAt: p.createdAt,
        seller: {
          id: p.seller.id,
          name: p.seller.user.name,
          email: p.seller.user.email
        }
      }))
    });
  } catch (error) {
    console.error('Get pending products error:', error);
    res.status(500).json({ success: false, message: 'Failed to get pending products' });
  }
};

// Seller dashboard stats
export const getSellerStats = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const seller = await prisma.seller.findUnique({
      where: { userId: req.user.userId },
      include: { products: true }
    });

    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller profile not found' });
    }

    const totalProducts = seller.products.length;
    const totalSales = seller.products.reduce((acc, p) => acc + p.sales, 0);
    const totalRevenue = seller.products.reduce((acc, p) => acc + (p.price * p.sales), 0);
    const lowStockProducts = seller.products.filter(p => p.stock > 0 && p.stock <= 5).length;

    res.json({
      success: true,
      data: {
        totalProducts,
        totalSales,
        totalRevenue,
        lowStockProducts,
        rating: seller.rating
      }
    });
  } catch (error) {
    console.error('Get seller stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to get stats' });
  }
};






























