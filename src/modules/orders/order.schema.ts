import { z } from 'zod';
import { OrderStatus } from '@prisma/client';

export const createOrderSchema = z.object({
    title: z.string(),
    clientId: z.uuid(),
    checklistTemplateId: z.uuid().optional(),
    previousOrderId: z.uuid().optional(),
}).refine(data => data.checklistTemplateId || data.previousOrderId, {
    message: "Either checklistTemplateId or previousOrderId must be provided",
    path: ["checklistTemplateId"],
});

export const updateOrderStatusSchema = z.object({
    status: z.enum(OrderStatus),
});
