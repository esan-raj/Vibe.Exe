import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getMyBookings = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.userId },
      orderBy: { date: 'desc' }
    });

    res.json({
      success: true,
      data: bookings.map(b => ({
        id: b.id,
        type: b.type,
        title: b.title,
        date: b.date.toISOString().split('T')[0],
        status: b.status,
        amount: b.amount,
        blockchainHash: b.blockchainHash
      }))
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ success: false, message: 'Failed to get bookings' });
  }
};

export const getBookingById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({
      success: true,
      data: {
        id: booking.id,
        type: booking.type,
        title: booking.title,
        date: booking.date.toISOString().split('T')[0],
        status: booking.status,
        amount: booking.amount,
        blockchainHash: booking.blockchainHash,
        user: booking.user
      }
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ success: false, message: 'Failed to get booking' });
  }
};

export const createBooking = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const { type, title, date, amount } = req.body;

    // Generate a mock blockchain hash for verified bookings
    const blockchainHash = `0x${Math.random().toString(16).slice(2, 18)}`;

    const booking = await prisma.booking.create({
      data: {
        userId: req.user.userId,
        type,
        title,
        date: new Date(date),
        amount,
        status: 'pending',
        blockchainHash
      }
    });

    res.status(201).json({
      success: true,
      data: {
        id: booking.id,
        type: booking.type,
        title: booking.title,
        date: booking.date.toISOString().split('T')[0],
        status: booking.status,
        amount: booking.amount,
        blockchainHash: booking.blockchainHash
      }
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ success: false, message: 'Failed to create booking' });
  }
};

export const updateBookingStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await prisma.booking.update({
      where: { id },
      data: { status }
    });

    res.json({
      success: true,
      data: {
        id: booking.id,
        type: booking.type,
        title: booking.title,
        date: booking.date.toISOString().split('T')[0],
        status: booking.status,
        amount: booking.amount,
        blockchainHash: booking.blockchainHash
      }
    });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ success: false, message: 'Failed to update booking' });
  }
};

export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.update({
      where: { id },
      data: { status: 'cancelled' }
    });

    res.json({
      success: true,
      data: {
        id: booking.id,
        status: booking.status
      }
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel booking' });
  }
};

// Admin: Get all bookings
export const getAllBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: bookings.map(b => ({
        id: b.id,
        type: b.type,
        title: b.title,
        date: b.date.toISOString().split('T')[0],
        status: b.status,
        amount: b.amount,
        blockchainHash: b.blockchainHash,
        user: b.user
      }))
    });
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({ success: false, message: 'Failed to get bookings' });
  }
};































