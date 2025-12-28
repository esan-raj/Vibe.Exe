import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getMyItineraries = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const itineraries = await prisma.itinerary.findMany({
      where: { userId: req.user.userId },
      include: {
        destinations: {
          include: { destination: true },
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: itineraries.map(i => ({
        id: i.id,
        title: i.title,
        duration: i.duration,
        destinations: i.destinations.map(d => ({
          id: d.destination.id,
          name: d.destination.name,
          description: d.destination.description,
          image: d.destination.image,
          category: d.destination.category,
          rating: d.destination.rating,
          location: {
            lat: d.destination.latitude,
            lng: d.destination.longitude
          }
        })),
        activities: i.activities,
        estimatedCost: i.estimatedCost,
        createdAt: i.createdAt.toISOString().split('T')[0]
      }))
    });
  } catch (error) {
    console.error('Get itineraries error:', error);
    res.status(500).json({ success: false, message: 'Failed to get itineraries' });
  }
};

export const getItineraryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const itinerary = await prisma.itinerary.findUnique({
      where: { id },
      include: {
        destinations: {
          include: { destination: true },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!itinerary) {
      return res.status(404).json({ success: false, message: 'Itinerary not found' });
    }

    res.json({
      success: true,
      data: {
        id: itinerary.id,
        title: itinerary.title,
        duration: itinerary.duration,
        destinations: itinerary.destinations.map(d => ({
          id: d.destination.id,
          name: d.destination.name,
          description: d.destination.description,
          image: d.destination.image,
          category: d.destination.category,
          rating: d.destination.rating,
          location: {
            lat: d.destination.latitude,
            lng: d.destination.longitude
          }
        })),
        activities: itinerary.activities,
        estimatedCost: itinerary.estimatedCost,
        createdAt: itinerary.createdAt.toISOString().split('T')[0]
      }
    });
  } catch (error) {
    console.error('Get itinerary error:', error);
    res.status(500).json({ success: false, message: 'Failed to get itinerary' });
  }
};

export const createItinerary = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const { title, duration, destinationIds, activities, estimatedCost } = req.body;

    const itinerary = await prisma.itinerary.create({
      data: {
        userId: req.user.userId,
        title,
        duration,
        activities,
        estimatedCost,
        destinations: {
          create: destinationIds.map((destId: string, index: number) => ({
            destinationId: destId,
            order: index
          }))
        }
      },
      include: {
        destinations: {
          include: { destination: true },
          orderBy: { order: 'asc' }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: {
        id: itinerary.id,
        title: itinerary.title,
        duration: itinerary.duration,
        destinations: itinerary.destinations.map(d => ({
          id: d.destination.id,
          name: d.destination.name,
          description: d.destination.description,
          image: d.destination.image,
          category: d.destination.category,
          rating: d.destination.rating,
          location: {
            lat: d.destination.latitude,
            lng: d.destination.longitude
          }
        })),
        activities: itinerary.activities,
        estimatedCost: itinerary.estimatedCost,
        createdAt: itinerary.createdAt.toISOString().split('T')[0]
      }
    });
  } catch (error) {
    console.error('Create itinerary error:', error);
    res.status(500).json({ success: false, message: 'Failed to create itinerary' });
  }
};

export const updateItinerary = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, duration, destinationIds, activities, estimatedCost } = req.body;

    // First update the itinerary
    const itinerary = await prisma.itinerary.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(duration !== undefined && { duration }),
        ...(activities && { activities }),
        ...(estimatedCost !== undefined && { estimatedCost })
      }
    });

    // If destinations are provided, update them
    if (destinationIds) {
      // Delete existing destinations
      await prisma.itineraryDestination.deleteMany({
        where: { itineraryId: id }
      });

      // Create new destinations
      await prisma.itineraryDestination.createMany({
        data: destinationIds.map((destId: string, index: number) => ({
          itineraryId: id,
          destinationId: destId,
          order: index
        }))
      });
    }

    // Fetch updated itinerary with destinations
    const updatedItinerary = await prisma.itinerary.findUnique({
      where: { id },
      include: {
        destinations: {
          include: { destination: true },
          orderBy: { order: 'asc' }
        }
      }
    });

    res.json({
      success: true,
      data: {
        id: updatedItinerary!.id,
        title: updatedItinerary!.title,
        duration: updatedItinerary!.duration,
        destinations: updatedItinerary!.destinations.map(d => ({
          id: d.destination.id,
          name: d.destination.name,
          description: d.destination.description,
          image: d.destination.image,
          category: d.destination.category,
          rating: d.destination.rating,
          location: {
            lat: d.destination.latitude,
            lng: d.destination.longitude
          }
        })),
        activities: updatedItinerary!.activities,
        estimatedCost: updatedItinerary!.estimatedCost,
        createdAt: updatedItinerary!.createdAt.toISOString().split('T')[0]
      }
    });
  } catch (error) {
    console.error('Update itinerary error:', error);
    res.status(500).json({ success: false, message: 'Failed to update itinerary' });
  }
};

export const deleteItinerary = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.itinerary.delete({ where: { id } });
    res.json({ success: true, message: 'Itinerary deleted' });
  } catch (error) {
    console.error('Delete itinerary error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete itinerary' });
  }
};

// AI-generated itinerary (mock implementation)
export const generateAIItinerary = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const { preferences, duration, budget } = req.body;

    // Get destinations matching preferences
    const destinations = await prisma.destination.findMany({
      where: preferences?.interests?.length > 0
        ? { category: { in: preferences.interests } }
        : undefined,
      take: Math.min(duration || 3, 5)
    });

    // Generate activities based on destination categories
    const activities = destinations.flatMap(d => {
      switch (d.category) {
        case 'nature':
          return ['Wildlife Safari', 'Nature Walk', 'Photography'];
        case 'cultural':
          return ['Museum Visit', 'Local Craft Workshop', 'Cultural Show'];
        case 'spiritual':
          return ['Temple Visit', 'Meditation Session', 'Spiritual Walk'];
        case 'adventure':
          return ['Trekking', 'Adventure Sports', 'Camping'];
        default:
          return ['Sightseeing'];
      }
    });

    // Estimate cost
    const estimatedCost = destinations.length * (budget === 'luxury' ? 5000 : budget === 'budget' ? 1500 : 3000);

    res.json({
      success: true,
      data: {
        title: `AI-Generated ${duration || 3}-Day Jharkhand Adventure`,
        duration: duration || 3,
        destinations: destinations.map(d => ({
          id: d.id,
          name: d.name,
          description: d.description,
          image: d.image,
          category: d.category,
          rating: d.rating,
          location: {
            lat: d.latitude,
            lng: d.longitude
          }
        })),
        activities: [...new Set(activities)],
        estimatedCost
      }
    });
  } catch (error) {
    console.error('Generate AI itinerary error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate itinerary' });
  }
};































