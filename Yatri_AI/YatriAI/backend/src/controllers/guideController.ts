import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllGuides = async (req: Request, res: Response) => {
  try {
    const guides = await prisma.guide.findMany({
      include: {
        user: {
          select: {
            name: true,
            avatar: true,
            isVerified: true
          }
        }
      },
      orderBy: { rating: 'desc' }
    });

    res.json({
      success: true,
      data: guides.map(g => ({
        id: g.id,
        userId: g.userId,
        name: g.user.name,
        avatar: g.user.avatar,
        rating: g.rating,
        experience: g.experience,
        languages: g.languages,
        specialties: g.specialties,
        pricePerDay: g.pricePerDay,
        isVerified: g.user.isVerified,
        location: g.location,
        totalRatings: g.totalRatings
      }))
    });
  } catch (error) {
    console.error('Get guides error:', error);
    res.status(500).json({ success: false, message: 'Failed to get guides' });
  }
};

export const getGuideById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const guide = await prisma.guide.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            avatar: true,
            isVerified: true
          }
        },
        tours: true
      }
    });

    if (!guide) {
      return res.status(404).json({ success: false, message: 'Guide not found' });
    }

    res.json({
      success: true,
      data: {
        id: guide.id,
        name: guide.user.name,
        avatar: guide.user.avatar,
        rating: guide.rating,
        experience: guide.experience,
        languages: guide.languages,
        specialties: guide.specialties,
        pricePerDay: guide.pricePerDay,
        isVerified: guide.user.isVerified,
        location: guide.location,
        tours: guide.tours
      }
    });
  } catch (error) {
    console.error('Get guide error:', error);
    res.status(500).json({ success: false, message: 'Failed to get guide' });
  }
};

export const getMyGuideProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const guide = await prisma.guide.findUnique({
      where: { userId: req.user.userId },
      include: {
        user: {
          select: {
            name: true,
            avatar: true,
            isVerified: true,
            email: true
          }
        },
        tours: true,
        bookings: {
          include: { tour: true },
          orderBy: { date: 'desc' }
        }
      }
    });

    if (!guide) {
      return res.status(404).json({ success: false, message: 'Guide profile not found' });
    }

    res.json({
      success: true,
      data: {
        id: guide.id,
        name: guide.user.name,
        email: guide.user.email,
        avatar: guide.user.avatar,
        rating: guide.rating,
        experience: guide.experience,
        languages: guide.languages,
        specialties: guide.specialties,
        pricePerDay: guide.pricePerDay,
        isVerified: guide.user.isVerified,
        location: guide.location,
        tours: guide.tours.map(t => ({
          id: t.id,
          title: t.title,
          description: t.description,
          image: t.image,
          status: t.status,
          duration: t.duration,
          price: t.price,
          bookings: t.bookings,
          approved: t.approved
        })),
        bookings: guide.bookings.map(b => ({
          id: b.id,
          tourName: b.tour.title,
          touristName: b.touristName,
          touristEmail: b.touristEmail,
          date: b.date.toISOString().split('T')[0],
          status: b.status,
          amount: b.amount,
          participants: b.participants
        }))
      }
    });
  } catch (error) {
    console.error('Get my guide profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to get guide profile' });
  }
};

export const updateGuideProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const { experience, languages, specialties, pricePerDay, location } = req.body;

    const guide = await prisma.guide.update({
      where: { userId: req.user.userId },
      data: {
        ...(experience !== undefined && { experience }),
        ...(languages && { languages }),
        ...(specialties && { specialties }),
        ...(pricePerDay !== undefined && { pricePerDay }),
        ...(location && { location })
      }
    });

    res.json({ success: true, data: guide });
  } catch (error) {
    console.error('Update guide profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to update guide profile' });
  }
};

// Tours management
export const createTour = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const guide = await prisma.guide.findUnique({ where: { userId: req.user.userId } });
    if (!guide) {
      return res.status(404).json({ success: false, message: 'Guide profile not found' });
    }

    const { title, description, image, duration, price, status } = req.body;

    // Validate required fields
    if (!title || !description || !image || !duration || price === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: title, description, image, duration, and price are required' 
      });
    }

    if (isNaN(price) || Number(price) <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Price must be a positive number' 
      });
    }

    const tour = await prisma.tour.create({
      data: {
        guideId: guide.id,
        title: title.trim(),
        description: description.trim(),
        image: image.trim(),
        duration: duration.trim(),
        price: Number(price),
        status: status || 'Draft',
        approved: false // Tours need admin approval
      }
    });

    res.status(201).json({ success: true, data: tour });
  } catch (error: any) {
    console.error('Create tour error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    
    if (error.code === 'P2002') { // Unique constraint violation
      return res.status(409).json({ success: false, message: 'A tour with this title already exists for this guide.' });
    }
    
    if (error.code === 'P2003') { // Foreign key constraint violation
      return res.status(400).json({ success: false, message: 'Invalid guide reference' });
    }
    
    // Handle schema mismatch errors (missing column or unknown field)
    if (error.message && (
      error.message.includes('Column \'approved\' does not exist') ||
      error.message.includes('Unknown argument') ||
      error.message.includes('Unknown field') ||
      error.message.includes('Unknown column')
    )) {
      return res.status(500).json({ 
        success: false, 
        message: 'Database schema mismatch. Please run the migration: ALTER TABLE "tours" ADD COLUMN IF NOT EXISTS "approved" BOOLEAN NOT NULL DEFAULT false;' 
      });
    }
    
    // Handle Prisma client out-of-sync errors
    if (error.message && error.message.includes('Invalid `prisma.tour.create()`')) {
      return res.status(500).json({ 
        success: false, 
        message: 'Prisma client is out of sync. Please stop the backend server, run "npx prisma generate" in the backend directory, and restart the server.' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to create tour. Please check all fields are filled correctly.' 
    });
  }
};

export const updateTour = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, image, duration, price, status } = req.body;

    const tour = await prisma.tour.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(image && { image }),
        ...(duration && { duration }),
        ...(price !== undefined && { price }),
        ...(status && { status })
      }
    });

    res.json({ success: true, data: tour });
  } catch (error) {
    console.error('Update tour error:', error);
    res.status(500).json({ success: false, message: 'Failed to update tour' });
  }
};

export const deleteTour = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const { id } = req.params;
    
    // Verify the tour belongs to the guide
    const guide = await prisma.guide.findUnique({ where: { userId: req.user.userId } });
    if (!guide) {
      return res.status(404).json({ success: false, message: 'Guide profile not found' });
    }

    const tour = await prisma.tour.findUnique({ where: { id } });
    if (!tour) {
      return res.status(404).json({ success: false, message: 'Tour not found' });
    }

    if (tour.guideId !== guide.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this tour' });
    }

    await prisma.tour.delete({ where: { id } });
    res.json({ success: true, message: 'Tour deleted' });
  } catch (error) {
    console.error('Delete tour error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete tour' });
  }
};

// Get my tours (for guide)
export const getMyTours = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const guide = await prisma.guide.findUnique({ 
      where: { userId: req.user.userId },
      include: { tours: { orderBy: { createdAt: 'desc' } } }
    });

    if (!guide) {
      return res.status(404).json({ success: false, message: 'Guide profile not found' });
    }

    res.json({
      success: true,
      data: guide.tours.map(t => ({
        id: t.id,
        title: t.title,
        description: t.description,
        image: t.image,
        duration: t.duration,
        price: t.price,
        status: t.status,
        bookings: t.bookings,
        approved: t.approved,
        createdAt: t.createdAt
      }))
    });
  } catch (error: any) {
    console.error('Get my tours error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to get tours' 
    });
  }
};

// Get pending tours (for admin)
export const getPendingTours = async (req: Request, res: Response) => {
  try {
    const tours = await prisma.tour.findMany({
      where: { approved: false },
      include: {
        guide: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                avatar: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: tours.map(t => ({
        id: t.id,
        title: t.title,
        description: t.description,
        image: t.image,
        duration: t.duration,
        price: t.price,
        status: t.status,
        bookings: t.bookings,
        approved: t.approved,
        createdAt: t.createdAt,
        guide: {
          name: t.guide.user.name,
          email: t.guide.user.email,
          avatar: t.guide.user.avatar
        }
      }))
    });
  } catch (error) {
    console.error('Get pending tours error:', error);
    res.status(500).json({ success: false, message: 'Failed to get pending tours' });
  }
};

// Approve/reject tour (for admin)
export const approveTour = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { approved } = req.body;

    const tour = await prisma.tour.update({
      where: { id },
      data: { approved: approved === true }
    });

    res.json({ success: true, data: tour });
  } catch (error) {
    console.error('Approve tour error:', error);
    res.status(500).json({ success: false, message: 'Failed to approve tour' });
  }
};

// Get approved tours (for public/Patachitra Archive)
export const getApprovedTours = async (req: Request, res: Response) => {
  try {
    const tours = await prisma.tour.findMany({
      where: { 
        approved: true,
        status: 'Active'
      },
      include: {
        guide: {
          include: {
            user: {
              select: {
                name: true,
                avatar: true,
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
      data: tours.map(t => ({
        id: t.id,
        title: t.title,
        description: t.description,
        image: t.image,
        duration: t.duration,
        price: t.price,
        status: t.status,
        bookings: t.bookings,
        guide: {
          name: t.guide.user.name,
          avatar: t.guide.user.avatar,
          isVerified: t.guide.user.isVerified
        }
      }))
    });
  } catch (error) {
    console.error('Get approved tours error:', error);
    res.status(500).json({ success: false, message: 'Failed to get approved tours' });
  }
};

// Guide bookings
export const updateGuideBookingStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await prisma.guideBooking.update({
      where: { id },
      data: { status }
    });

    res.json({ success: true, data: booking });
  } catch (error) {
    console.error('Update guide booking error:', error);
    res.status(500).json({ success: false, message: 'Failed to update booking' });
  }
};






























