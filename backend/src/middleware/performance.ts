import { Request, Response, NextFunction } from 'express';

export const performanceMonitor = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = duration > 1000 ? 'warn' : 'info';
    console[logLevel](`${req.method} ${req.path} - ${duration}ms`);
  });

  next();
};