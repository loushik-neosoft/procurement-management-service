import { NextFunction, Response } from 'express';
import { AuthRequest } from '@middlewares/auth';
import { OrderService } from './order.service';
import { Role } from '@prisma/client';

export class OrderController {
    static async create(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const data = req.body;
            const order = await OrderService.createOrder(data, req.user!.userId);
            res.status(201).json({ status: 'success', data: { order } });
        } catch (error) {
            next(error);
        }
    }

    static async list(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const filters: any = {};
            if (req.user!.role === Role.CLIENT) {
                filters.clientId = req.user!.userId;
            } else if (req.user!.role === Role.INSPECTION_MANAGER) {
                const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
                if (user?.assignedPMId) {
                    filters.pmId = user.assignedPMId;
                }
            } else if (req.user!.role === Role.PROCUREMENT_MANAGER) {
                filters.pmId = req.user!.userId;
            }

            const orders = await OrderService.getOrders(filters);
            res.status(200).json({ status: 'success', data: { orders } });
        } catch (error) {
            next(error);
        }
    }

    static async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { status } = req.body;
            const order = await OrderService.updateStatus(req.params.id, status);
            res.status(200).json({ status: 'success', data: { order } });
        } catch (error) {
            next(error);
        }
    }

    static async getById(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const order = await OrderService.getOrderById(req.params.id);
            res.status(200).json({ status: 'success', data: { order } });
        } catch (error) {
            next(error);
        }
    }
}

import prisma from '@config/database';
