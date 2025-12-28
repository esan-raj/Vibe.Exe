import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Admin: Get analytics statistics
export const getAnalytics = async (req: Request, res: Response) => {
  try {
    // Get current date and dates for comparison
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Total Users
    const totalUsers = await prisma.user.count({
      where: { role: { not: 'admin' } }
    });
    const usersLast30Days = await prisma.user.count({
      where: {
        role: { not: 'admin' },
        createdAt: { gte: thirtyDaysAgo }
      }
    });
    const usersLast7Days = await prisma.user.count({
      where: {
        role: { not: 'admin' },
        createdAt: { gte: sevenDaysAgo }
      }
    });
    const previous30DaysUsers = await prisma.user.count({
      where: {
        role: { not: 'admin' },
        createdAt: {
          gte: new Date(thirtyDaysAgo.getTime() - 30 * 24 * 60 * 60 * 1000),
          lt: thirtyDaysAgo
        }
      }
    });
    const userGrowthPercent = previous30DaysUsers > 0
      ? Math.round(((usersLast30Days - previous30DaysUsers) / previous30DaysUsers) * 100)
      : usersLast30Days > 0 ? 100 : 0;

    // New Registrations (last 7 days)
    const newRegistrations = usersLast7Days;
    const previous7DaysUsers = await prisma.user.count({
      where: {
        role: { not: 'admin' },
        createdAt: {
          gte: new Date(sevenDaysAgo.getTime() - 7 * 24 * 60 * 60 * 1000),
          lt: sevenDaysAgo
        }
      }
    });
    const registrationGrowthPercent = previous7DaysUsers > 0
      ? Math.round(((newRegistrations - previous7DaysUsers) / previous7DaysUsers) * 100)
      : newRegistrations > 0 ? 100 : 0;

    // Total Bookings
    const totalBookings = await prisma.booking.count();
    const bookingsLast30Days = await prisma.booking.count({
      where: { createdAt: { gte: thirtyDaysAgo } }
    });
    const previous30DaysBookings = await prisma.booking.count({
      where: {
        createdAt: {
          gte: new Date(thirtyDaysAgo.getTime() - 30 * 24 * 60 * 60 * 1000),
          lt: thirtyDaysAgo
        }
      }
    });
    const bookingGrowthPercent = previous30DaysBookings > 0
      ? Math.round(((bookingsLast30Days - previous30DaysBookings) / previous30DaysBookings) * 100)
      : bookingsLast30Days > 0 ? 100 : 0;

    // Revenue (sum of all confirmed bookings)
    const confirmedBookings = await prisma.booking.findMany({
      where: { status: 'confirmed' },
      select: { amount: true }
    });
    const totalRevenue = confirmedBookings.reduce((sum, booking) => sum + booking.amount, 0);
    
    const confirmedBookingsLast30Days = await prisma.booking.findMany({
      where: {
        status: 'confirmed',
        createdAt: { gte: thirtyDaysAgo }
      },
      select: { amount: true }
    });
    const revenueLast30Days = confirmedBookingsLast30Days.reduce((sum, booking) => sum + booking.amount, 0);
    
    const confirmedBookingsPrevious30Days = await prisma.booking.findMany({
      where: {
        status: 'confirmed',
        createdAt: {
          gte: new Date(thirtyDaysAgo.getTime() - 30 * 24 * 60 * 60 * 1000),
          lt: thirtyDaysAgo
        }
      },
      select: { amount: true }
    });
    const revenuePrevious30Days = confirmedBookingsPrevious30Days.reduce((sum, booking) => sum + booking.amount, 0);
    const revenueGrowthPercent = revenuePrevious30Days > 0
      ? Math.round(((revenueLast30Days - revenuePrevious30Days) / revenuePrevious30Days) * 100)
      : revenueLast30Days > 0 ? 100 : 0;

    // Format revenue
    const formatRevenue = (amount: number) => {
      if (amount >= 100000) {
        return `₹${(amount / 100000).toFixed(1)}L`;
      } else if (amount >= 1000) {
        return `₹${(amount / 1000).toFixed(1)}K`;
      }
      return `₹${Math.round(amount)}`;
    };

    res.json({
      success: true,
      data: {
        totalUsers: {
          value: totalUsers.toLocaleString(),
          change: `${userGrowthPercent >= 0 ? '+' : ''}${userGrowthPercent}%`
        },
        newRegistrations: {
          value: newRegistrations.toString(),
          change: `${registrationGrowthPercent >= 0 ? '+' : ''}${registrationGrowthPercent}%`
        },
        totalBookings: {
          value: totalBookings.toLocaleString(),
          change: `${bookingGrowthPercent >= 0 ? '+' : ''}${bookingGrowthPercent}%`
        },
        revenue: {
          value: formatRevenue(totalRevenue),
          change: `${revenueGrowthPercent >= 0 ? '+' : ''}${revenueGrowthPercent}%`
        }
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to get analytics' });
  }
};


