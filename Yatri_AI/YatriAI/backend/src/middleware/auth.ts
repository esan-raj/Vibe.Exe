import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt.js';
import { AppError } from './errorHandler.js';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    console.log('🔐 Auth Debug - Headers:', req.headers.authorization);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Auth Debug - No valid auth header');
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    console.log('🔐 Auth Debug - Token extracted:', token ? 'Token present' : 'No token');
    
    // Handle mock tokens in development
    if (token && token.startsWith('mock-token-')) {
      console.log('🔐 Auth Debug - Mock token detected');
      // Extract user ID from mock token format: mock-token-{userId}-{timestamp}
      const parts = token.split('-');
      if (parts.length >= 3) {
        const userId = parts[2];
        // Create a mock user payload for development
        req.user = {
          userId: userId,
          email: 'mock@example.com',
          role: 'tourist' // Default role for mock users
        };
        console.log('✅ Auth Debug - Mock token accepted');
        next();
        return;
      }
    }
    
    // Handle real JWT tokens
    const decoded = verifyToken(token);
    console.log('✅ Auth Debug - JWT token verified successfully');
    
    req.user = decoded;
    next();
  } catch (error) {
    console.log('❌ Auth Debug - Error:', error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    next();
  };
};































