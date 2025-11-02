import jwt from 'jsonwebtoken';

export const generateToken = (payload: { userId: string; email: string; role: string }): string => {
  const secret = process.env.JWT_SECRET || 'your-secret-key';
  const expiresIn = process.env.JWT_EXPIRE || '7d';
  
  return jwt.sign(payload, secret, { expiresIn });
};

export const verifyToken = (token: string): any => {
  const secret = process.env.JWT_SECRET || 'your-secret-key';
  return jwt.verify(token, secret);
};
