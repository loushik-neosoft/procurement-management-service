import { Request, Response, NextFunction } from 'express';
import { ChecklistService } from './checklist.service';
import { CreateChecklistTemplateType } from './checklist.schema';

export class ChecklistController {
    static async createTemplate(req: Request, res: Response, next: NextFunction) {
        try {
            const data = req.body as CreateChecklistTemplateType;
            const createdById = req.user?.userId;
            const template = await ChecklistService.createTemplate(data, createdById as string);
            res.status(201).json({ status: 'success', data: { template } });
        } catch (error) {
            next(error);
        }
    }

    static async getAllTemplates(req: Request, res: Response, next: NextFunction) {
        try {
            const { clientId } = req.query;
            const templates = await ChecklistService.getAllTemplates(clientId as string);
            res.status(200).json({ status: 'success', data: { templates } });
        } catch (error) {
            next(error);
        }
    }



    static async getTemplate(req: Request, res: Response, next: NextFunction) {
        try {
            const template = await ChecklistService.getTemplateById(req.params.id as string);
            res.status(200).json({ status: 'success', data: { template } });
        } catch (error) {
            next(error);
        }
    }

    static async updateTemplate(req: Request, res: Response, next: NextFunction) {
        try {
            const data = req.body;
            data.createdById = req.user?.userId;
            const template = await ChecklistService.updateTemplate(req.params.id as string, data);
            res.status(200).json({ status: 'success', data: { template } });
        } catch (error) {
            next(error);
        }
    }
}
