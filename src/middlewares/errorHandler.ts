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
    err: Error | AppError | unknown,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let statusCode = 500;
    let message = 'Internal Server Error';

    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
    } else if (err instanceof Error) {
        message = err.message;
    } else if (typeof err === 'object' && err !== null && 'statusCode' in err) {
        statusCode = (err as { statusCode: number }).statusCode;
        message = (err as { message?: string }).message || message;
    }
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
    if (err instanceof Error && !(err instanceof ZodError)) {
        console.error(err.stack);
    }

    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message,
        ...(errors && { errors })
    });
};
