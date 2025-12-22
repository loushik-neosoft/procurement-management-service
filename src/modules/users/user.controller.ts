import { NextFunction, Response } from 'express';
import { AuthRequest } from '@middlewares/auth';
import { UserService } from './user.service';
import { AppError } from '@middlewares/errorHandler';
import { Role } from '@prisma/client';
import { CreateUserSchema } from './user.schema';

export class UserController {
    static async register(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const data = req.body as CreateUserSchema;
            const creator = req.user!;
            let assignedPMId;

            // RBAC Check for registration
            if (creator.role === Role.PROCUREMENT_MANAGER) {
                if (data.role === Role.ADMIN || data.role === Role.PROCUREMENT_MANAGER) {
                    throw new AppError('PM can only create Clients and Inspection Managers', 403);
                }
            }

            if (data.role === Role.INSPECTION_MANAGER) {
                assignedPMId = creator.userId;
            }

            const user = await UserService.createUser(data, creator.userId, assignedPMId);

            res.status(201).json({
                status: 'success',
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        phone: user.phone,
                        role: user.role,
                        name: user.name,
                    },
                },
            });
        } catch (error) {
            next(error);
        }
    }

    static async assignPM(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { userId, assignedPMId } = req.body;
            const creator = req.user!;

            // if assignpmId is there then update the user assign pm id else add admin id
            const pmId = assignedPMId || creator.userId;

            const user = await UserService.assignPM(userId, pmId);

            res.status(200).json({
                status: 'success',
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        phone: user.phone,
                        role: user.role,
                        name: user.name,
                    },
                },
            });
        } catch (error) {
            next(error);
        }
    }

    static async getUsers(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const roleType = req.query.roleType as Role;
            const users = await UserService.getUsers(req.user!, roleType);

            res.status(200).json({
                status: 'success',
                data: {
                    users: users.map(user => ({
                        id: user.id,
                        email: user.email,
                        phone: user.phone,
                        role: user.role,
                        name: user.name,
                    })),
                },
            });
        } catch (error) {
            next(error);
        }
    }
}
