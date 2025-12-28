import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllTestimonials = async (req: Request, res: Response) => {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: testimonials.map(t => ({
        id: t.id,
        name: t.name,
        avatar: t.avatar,
        rating: t.rating,
        comment: t.comment,
        sentiment: t.sentiment,
        location: t.location
      }))
    });
  } catch (error) {
    console.error('Get testimonials error:', error);
    res.status(500).json({ success: false, message: 'Failed to get testimonials' });
  }
};

export const getAITips = async (req: Request, res: Response) => {
  try {
    const tips = await prisma.aITip.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: tips.map(t => t.content)
    });
  } catch (error) {
    console.error('Get AI tips error:', error);
    res.status(500).json({ success: false, message: 'Failed to get AI tips' });
  }
};

// Admin endpoints
export const createTestimonial = async (req: Request, res: Response) => {
  try {
    const { name, avatar, rating, comment, sentiment, location } = req.body;

    const testimonial = await prisma.testimonial.create({
      data: {
        name,
        avatar,
        rating,
        comment,
        sentiment,
        location
      }
    });

    res.status(201).json({ success: true, data: testimonial });
  } catch (error) {
    console.error('Create testimonial error:', error);
    res.status(500).json({ success: false, message: 'Failed to create testimonial' });
  }
};

export const createAITip = async (req: Request, res: Response) => {
  try {
    const { content } = req.body;

    const tip = await prisma.aITip.create({
      data: { content }
    });

    res.status(201).json({ success: true, data: tip });
  } catch (error) {
    console.error('Create AI tip error:', error);
    res.status(500).json({ success: false, message: 'Failed to create AI tip' });
  }
};

// Feedback
export const submitFeedback = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const { rating, comment, category, sentiment } = req.body;

    console.log('📝 Submit Feedback - User ID:', req.user.userId);
    console.log('📝 Submit Feedback - Body:', { rating, comment, category, sentiment });

    // Validate required fields
    if (!rating || !comment) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rating and comment are required' 
      });
    }

    // Verify user exists in database
    const userExists = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true }
    });

    if (!userExists) {
      console.error('❌ User not found in database:', req.user.userId);
      return res.status(404).json({ 
        success: false, 
        message: 'User not found. Please log in again with a valid account.' 
      });
    }

    const feedback = await prisma.feedback.create({
      data: {
        userId: req.user.userId,
        rating: parseInt(rating),
        comment: comment.trim(),
        category: category || 'platform',
        sentiment: sentiment || 'neutral'
      },
      include: {
        user: {
          select: { name: true, avatar: true }
        }
      }
    });

    console.log('✅ Feedback created successfully:', feedback.id);
    res.status(201).json({ success: true, data: feedback });
  } catch (error: any) {
    console.error('❌ Submit feedback error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
    
    // Provide more specific error messages
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        success: false, 
        message: 'Duplicate feedback entry' 
      });
    }
    
    if (error.code === 'P2003') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid user reference' 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to submit feedback',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getAllFeedback = async (req: Request, res: Response) => {
  try {
    const { verified } = req.query;
    
    const where: any = {};
    if (verified !== undefined) {
      where.verified = verified === 'true';
    }

    const feedback = await prisma.feedback.findMany({
      where,
      include: {
        user: {
          select: { name: true, avatar: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: feedback.map(f => ({
        id: f.id,
        rating: f.rating,
        comment: f.comment,
        category: f.category,
        sentiment: f.sentiment,
        verified: f.verified,
        user: f.user,
        createdAt: f.createdAt.toISOString().split('T')[0]
      }))
    });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ success: false, message: 'Failed to get feedback' });
  }
};

export const deleteFeedback = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const { id } = req.params;

    const feedback = await prisma.feedback.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true }
        }
      }
    });

    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    // Check if user owns the feedback or is admin
    const isOwner = feedback.userId === req.user.userId;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only delete your own feedback' 
      });
    }

    // If feedback is verified, also delete the associated testimonial
    if (feedback.verified) {
      await prisma.testimonial.deleteMany({
        where: {
          name: feedback.user.name,
          comment: feedback.comment
        }
      });
    }

    // Delete the feedback
    await prisma.feedback.delete({
      where: { id }
    });

    console.log(`✅ Feedback deleted: ${id} by ${isAdmin ? 'admin' : 'owner'}`);
    res.json({ success: true, message: 'Feedback deleted successfully' });
  } catch (error: any) {
    console.error('Delete feedback error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to delete feedback' 
    });
  }
};

export const verifyFeedback = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'approve' or 'reject'

    const feedback = await prisma.feedback.findUnique({
      where: { id },
      include: {
        user: {
          select: { name: true, avatar: true, email: true }
        }
      }
    });

    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    if (action === 'approve') {
      // Mark feedback as verified
      await prisma.feedback.update({
        where: { id },
        data: { verified: true }
      });

      // Create testimonial from verified feedback
      const testimonial = await prisma.testimonial.create({
        data: {
          name: feedback.user.name,
          avatar: feedback.user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
          rating: feedback.rating,
          comment: feedback.comment,
          sentiment: feedback.sentiment || 'positive',
          location: 'Kolkata, India'
        }
      });

      res.json({ success: true, data: { feedback, testimonial } });
    } else if (action === 'reject') {
      // Delete feedback
      await prisma.feedback.delete({
        where: { id }
      });

      res.json({ success: true, message: 'Feedback rejected and deleted' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid action. Use "approve" or "reject"' });
    }
  } catch (error) {
    console.error('Verify feedback error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify feedback' });
  }
};





























