import { Request, Response, NextFunction } from 'express';
import { AppError } from '@middlewares/errorHandler';

export class UploadController {
    static async uploadFile(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.file) {
                throw new AppError('No file uploaded', 400);
            }

            const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

            res.status(200).json({
                status: 'success',
                data: {
                    url: fileUrl,
                    filename: req.file.filename,
                },
            });
        } catch (error) {
            next(error);
        }
    }
}
