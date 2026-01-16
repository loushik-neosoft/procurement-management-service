import { Request, Response, NextFunction } from 'express';
import { AppError } from '@middlewares/errorHandler';
import fs from 'fs';
import path from 'path';

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

    static async getFile(req: Request, res: Response, next: NextFunction) {
        try {
            const { filename } = req.params;
            const filePath = path.join(process.cwd(), 'uploads', filename as string);

            if (!fs.existsSync(filePath)) {
                throw new AppError('File not found', 404);
            }

            res.sendFile(filePath);
        } catch (error) {
            next(error);
        }
    }

    static async deleteFile(req: Request, res: Response, next: NextFunction) {
        try {
            const { filename } = req.params;
            const filePath = path.join(process.cwd(), 'uploads', filename as string);

            if (!fs.existsSync(filePath)) {
                throw new AppError('File not found', 404);
            }

            fs.unlinkSync(filePath);

            res.status(200).json({
                status: 'success',
                message: 'File deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    }
}
