import { NextFunction, Response } from 'express';
import { AuthRequest } from '@middlewares/auth';
import { OrderService } from './order.service';
import { Role, Prisma } from '@prisma/client';

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
            const filters: Prisma.OrderWhereInput = {};
            if (req.user!.role === Role.CLIENT) {
                filters.clientId = req.user!.userId;
            } else if (req.user!.role === Role.INSPECTION_MANAGER) {
                filters.imId = req.user!.userId;
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
            const order = await OrderService.updateStatus(req.params.id as string, status);
            res.status(200).json({ status: 'success', data: { order } });
        } catch (error) {
            next(error);
        }
    }

    static async getById(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const order = await OrderService.getOrderById(req.params.id as string);
            res.status(200).json({ status: 'success', data: { order } });
        } catch (error) {
            next(error);
        }
    }
}
