import prisma from '@config/database';
import { ChecklistSubmission, OrderStatus } from '@prisma/client';
import { SubmitChecklistDto } from './submission.schema';
import { Question } from '../checklists/checklist.schema';

export class SubmissionService {
    static async submitChecklist(data: SubmitChecklistDto, imId: string): Promise<ChecklistSubmission> {
        const order = await prisma.order.findUnique({
            where: { id: data.orderId },
            include: {
                submissions: { where: { isFinal: true } },
            }
        });

        if (!order) throw new Error('Order not found');
        if (order.status === OrderStatus.CANCELLED || order.status === OrderStatus.COMPLETED) {
            throw new Error('Order is in a final state and cannot be modified');
        }

        // Check if IM is assigned to the PM of the order
        // Let's check if the IM is in the assignedIMs of the PM
        const isAssigned = order.imId === imId;
        if (!isAssigned) {
            throw new Error('You are not authorized to submit for this order');
        }

        if (order.submissions.length > 0) {
            throw new Error('Order already has a final submission');
        }

        // Validate answers against snapshot
        const snapshot = order.checklistSnapshot as unknown as Question[];
        if (!snapshot) throw new Error('Order does not have a checklist snapshot');

        this.validateAnswers(snapshot, data.answers);

        const submission = await prisma.checklistSubmission.create({
            data: {
                orderId: data.orderId,
                templateId: order.checklistTemplateId, // Keep track of template if exists
                imId: imId,
                answers: data.answers,
                isFinal: data.isFinal || false,
            }
        });

        // Update order status
        if (data.isFinal) {
            await prisma.order.update({
                where: { id: data.orderId },
                data: { status: OrderStatus.INSPECTION_COMPLETED }
            });
        } else if (order.status === OrderStatus.PENDING || order.status === OrderStatus.CHECKLIST_CREATED) {
            await prisma.order.update({
                where: { id: data.orderId },
                data: { status: OrderStatus.IN_PROGRESS }
            });
        }

        return submission;
    }

    private static validateAnswers(snapshot: Question[], answers: Record<string, any>) {
        for (const question of snapshot) {
            const answer = answers[question.key];

            if (question.required && (answer === undefined || answer === null || answer === '')) {
                throw new Error(`Question "${question.label}" is required`);
            }

            if (answer !== undefined && answer !== null) {
                switch (question.type) {
                    case 'BOOLEAN':
                        if (typeof answer !== 'boolean') throw new Error(`Invalid type for ${question.key}: expected boolean`);
                        break;
                    case 'DROPDOWN':
                        if (!question.options?.includes(answer)) throw new Error(`Invalid option for ${question.key}`);
                        break;
                    case 'MULTI_SELECT':
                        if (!Array.isArray(answer)) throw new Error(`Invalid type for ${question.key}: expected array`);
                        answer.forEach((val: string) => {
                            if (!question.options?.includes(val)) throw new Error(`Invalid option ${val} for ${question.key}`);
                        });
                        break;
                    case 'TEXT':
                        if (typeof answer !== 'string') throw new Error(`Invalid type for ${question.key}: expected string`);
                        break;
                    case 'IMAGE_UPLOAD':
                        if (!Array.isArray(answer)) throw new Error(`Invalid type for ${question.key}: expected array of URLs`);
                        // Validation for image URLs/types could be added here
                        break;
                }
            }
        }
    }

    static async getSubmission(id: string): Promise<ChecklistSubmission | null> {
        return prisma.checklistSubmission.findUnique({ where: { id } });
    }

    static async getSubmissionsByOrder(orderId: string): Promise<ChecklistSubmission[]> {
        return prisma.checklistSubmission.findMany({ where: { orderId } });
    }
}
