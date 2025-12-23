import { Request, Response, NextFunction } from "express";
import { AppError } from "./errorHandler";

export const notFound = (req: Request, res: Response, next: NextFunction) => {
    const error = new AppError(`Not Found - ${req.originalUrl}`, 404);
    next(error);
};