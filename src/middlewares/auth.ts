import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@utils/jwt';
import { AppError } from './errorHandler';
import { Role } from '@prisma/client';

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        role: Role;
    };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return next(new AppError('No token provided', 401));
    }

    const token = authHeader.split(' ')[1];
    try {
        const payload = verifyToken(token);
        req.user = {
            userId: payload.userId,
            role: payload.role as Role,
        };
        next();
    } catch (error) {
        next(new AppError('Invalid or expired token', 401));
    }
};

export const authorize = (...roles: Role[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new AppError('Access denied', 403));
        }
        next();
    };
};
