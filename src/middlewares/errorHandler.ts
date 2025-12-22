import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

export class AppError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    let errors = undefined;

    if (err instanceof ZodError) {

        const zodError = err as ZodError;
        statusCode = 400;
        message = 'Validation Error';
        errors = zodError.issues.map(e => ({
            path: e.path.join('.'),
            message: e.message
        }));
    }

    console.error(`[Error] ${statusCode} - ${message}`);
    if (err.stack && !(err instanceof ZodError)) {
        console.error(err.stack);
    }

    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message,
        ...(errors && { errors })
    });
};
