import { Request, Response, NextFunction } from 'express';
import { SubmissionService } from './submission.service';

export class SubmissionController {
    static async submitChecklist(req: Request, res: Response, next: NextFunction) {
        try {
            const data = req.body;
            const imId = req.user!.userId;
            const submission = await SubmissionService.submitChecklist(data, imId);
            res.status(201).json({ status: 'success', data: { submission } });
        } catch (error) {
            next(error);
        }
    }

    static async getSubmissionsByOrder(req: Request, res: Response, next: NextFunction) {
        try {
            const submissions = await SubmissionService.getSubmissionsByOrder(req.params.orderId as string);
            res.status(200).json({ status: 'success', data: { submissions } });
        } catch (error) {
            next(error);
        }
    }

    static async getSubmission(req: Request, res: Response, next: NextFunction) {
        try {
            const submission = await SubmissionService.getSubmission(req.params.id as string);
            res.status(200).json({ status: 'success', data: { submission } });
        } catch (error) {
            next(error);
        }
    }
}
