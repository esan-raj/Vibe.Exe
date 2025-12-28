import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET as string, { expiresIn: JWT_EXPIRES_IN } as any);
};

export const verifyToken = (token: string): TokenPayload => {
  // Handle mock tokens for development/testing
  if (token.startsWith('mock-token-')) {
    const parts = token.split('-');
    if (parts.length >= 3) {
      const userId = parts[2];
      return {
        userId: userId,
        email: `${userId}@example.com`,
        role: 'user'
      };
    }
  }
  
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};































