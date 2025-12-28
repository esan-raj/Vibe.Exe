import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Admin: Get all sellers
export const getAllSellers = async (req: Request, res: Response) => {
  try {
    const sellers = await prisma.seller.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            isVerified: true,
            status: true,
            createdAt: true
          }
        },
        products: {
          select: {
            id: true,
            sales: true,
            price: true
          }
        }
      },
      orderBy: { user: { createdAt: 'desc' } }
    });

    res.json({
      success: true,
      data: sellers.map(s => ({
        id: s.id,
        userId: s.userId,
        name: s.user.name,
        email: s.user.email,
        avatar: s.user.avatar,
        shopName: s.shopName,
        rating: s.rating,
        totalRatings: s.totalRatings,
        isVerified: s.user.isVerified,
        status: s.user.status,
        joinDate: s.user.createdAt.toISOString().split('T')[0],
        totalProducts: s.products.length,
        totalRevenue: s.products.reduce((sum, p) => sum + (p.price * p.sales), 0)
      }))
    });
  } catch (error) {
    console.error('Get all sellers error:', error);
    res.status(500).json({ success: false, message: 'Failed to get sellers' });
  }
};

