import prisma from '@config/database';
import { ChecklistTemplate, Source, Prisma } from '@prisma/client';
import { CreateChecklistTemplateType, UpdateChecklistTemplateType } from './checklist.schema';

export class ChecklistService {
    static async createTemplate(data: CreateChecklistTemplateType, createdById: string): Promise<ChecklistTemplate> {

        if (data?.clientId) {
            // Deactivate existing active template with same name and clientId
            await prisma.checklistTemplate.updateMany({
                where: {
                    name: data.name,
                    clientId: data.clientId,
                    isActive: true,
                },
                data: { isActive: false },
            });
        } else {
            // Deactivate existing active template with same name
            await prisma.checklistTemplate.updateMany({
                where: {
                    name: data.name,
                    clientId: null,
                    isActive: true,
                },
                data: { isActive: false },
            });
        }



        return prisma.checklistTemplate.create({
            data: {
                name: data.name,
                schema: data.questions,
                clientId: data.clientId || null,
                createdById: createdById,
                source: data.source || Source.DEFAULT,
                version: 1,
                isActive: true,
            },
        });
    }

    static async getAllTemplates(clientId?: string): Promise<ChecklistTemplate[]> {
        return prisma.checklistTemplate.findMany({
            where: {
                isActive: true,
                ...(clientId
                    ? { OR: [{ clientId: clientId }, { clientId: null }] }
                    : { clientId: null }
                )
            }
        });
    }

    static async getTemplateById(id: string): Promise<ChecklistTemplate | null> {
        return prisma.checklistTemplate.findUnique({ where: { id } });
    }

    static async updateTemplate(id: string, data: UpdateChecklistTemplateType): Promise<ChecklistTemplate> {
        const current = await this.getTemplateById(id);
        if (!current) throw new Error('Template not found');

        // Deactivate old version
        await prisma.checklistTemplate.update({
            where: { id },
            data: { isActive: false },
        });

        // Create new version
        return prisma.checklistTemplate.create({
            data: {
                name: data.name || current.name,
                schema: (data.questions || current.schema) as Prisma.InputJsonValue,
                clientId: data.clientId || current.clientId,
                createdById: current.createdById,
                source: data.source || current.source,
                version: current.version + 1,
                parentTemplateId: current.parentTemplateId || current.id,
                isActive: true,
            },
        });
    }



    static async deleteTemplate(id: string): Promise<void> {
        await prisma.checklistTemplate.update({
            where: { id },
            data: { isActive: false },
        });
    }
}
