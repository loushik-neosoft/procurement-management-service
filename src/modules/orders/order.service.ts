import prisma from '@config/database';
import { Order, OrderStatus, Source } from '@prisma/client';
import { ChecklistService } from '../checklists/checklist.service';

export class OrderService {
    static async createOrder(data: any, pmId: string): Promise<Order> {
        let snapshot: any = null;
        let source: Source = Source.DEFAULT;

        if (data.previousOrderId) {
            const prevOrder = await this.getOrderById(data.previousOrderId);
            if (!prevOrder || !prevOrder.checklistSnapshot) {
                throw new Error('Previous order or its checklist snapshot not found');
            }
            snapshot = prevOrder.checklistSnapshot;
            source = Source.PREVIOUS_ORDER;
        } else if (data.checklistTemplateId) {
            const template = await ChecklistService.getTemplateById(data.checklistTemplateId);
            if (!template) {
                throw new Error('Checklist template not found');
            }
            snapshot = template.schema;
            source = template.source;
        }

        return prisma.order.create({
            data: {
                title: data.title,
                clientId: data.clientId,
                pmId: pmId,
                checklistTemplateId: data.checklistTemplateId || null,
                checklistSnapshot: snapshot,
                checklistSource: source,
                status: OrderStatus.PENDING,
            },
        });
    }

    static async getOrders(filters: any): Promise<Partial<Order>[]> {
        const orders = await prisma.order.findMany({
            where: filters,
            include: {
                client: { select: { name: true, email: true } },
                pm: { select: { name: true, email: true } },
                checklistTemplate: { select: { name: true } },
            },
        });

        return orders.map(order => {
            const { checklistSnapshot, ...rest } = order;
            return rest;
        });
    }

    static async updateStatus(id: string, status: OrderStatus): Promise<Order> {
        return prisma.order.update({
            where: { id },
            data: { status },
        });
    }

    static async getOrderById(id: string): Promise<Order | null> {
        return prisma.order.findUnique({
            where: { id },
            include: {
                checklistTemplate: true,
                submissions: true,
            },
        });
    }
}
