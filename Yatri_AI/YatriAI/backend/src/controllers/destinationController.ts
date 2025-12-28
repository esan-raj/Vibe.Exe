import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllDestinations = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;

    const destinations = await prisma.destination.findMany({
      where: category ? { category: category as any } : undefined,
      orderBy: { rating: 'desc' }
    });

    res.json({
      success: true,
      data: destinations.map(d => ({
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
      }))
    });
  } catch (error) {
    console.error('Get destinations error:', error);
    res.status(500).json({ success: false, message: 'Failed to get destinations' });
  }
};

export const getDestinationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const destination = await prisma.destination.findUnique({
      where: { id }
    });

    if (!destination) {
      return res.status(404).json({ success: false, message: 'Destination not found' });
    }

    res.json({
      success: true,
      data: {
        id: destination.id,
        name: destination.name,
        description: destination.description,
        image: destination.image,
        category: destination.category,
        rating: destination.rating,
        location: {
          lat: destination.latitude,
          lng: destination.longitude
        }
      }
    });
  } catch (error) {
    console.error('Get destination error:', error);
    res.status(500).json({ success: false, message: 'Failed to get destination' });
  }
};

export const createDestination = async (req: Request, res: Response) => {
  try {
    const { name, description, image, category, rating, location } = req.body;

    const destination = await prisma.destination.create({
      data: {
        name,
        description,
        image,
        category,
        rating: rating || 0,
        latitude: location.lat,
        longitude: location.lng
      }
    });

    res.status(201).json({
      success: true,
      data: {
        id: destination.id,
        name: destination.name,
        description: destination.description,
        image: destination.image,
        category: destination.category,
        rating: destination.rating,
        location: {
          lat: destination.latitude,
          lng: destination.longitude
        }
      }
    });
  } catch (error) {
    console.error('Create destination error:', error);
    res.status(500).json({ success: false, message: 'Failed to create destination' });
  }
};

export const updateDestination = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, image, category, rating, location } = req.body;

    const destination = await prisma.destination.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(image && { image }),
        ...(category && { category }),
        ...(rating !== undefined && { rating }),
        ...(location && { latitude: location.lat, longitude: location.lng })
      }
    });

    res.json({
      success: true,
      data: {
        id: destination.id,
        name: destination.name,
        description: destination.description,
        image: destination.image,
        category: destination.category,
        rating: destination.rating,
        location: {
          lat: destination.latitude,
          lng: destination.longitude
        }
      }
    });
  } catch (error) {
    console.error('Update destination error:', error);
    res.status(500).json({ success: false, message: 'Failed to update destination' });
  }
};

export const deleteDestination = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.destination.delete({ where: { id } });

    res.json({ success: true, message: 'Destination deleted' });
  } catch (error) {
    console.error('Delete destination error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete destination' });
  }
};































