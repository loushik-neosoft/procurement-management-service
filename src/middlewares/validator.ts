import { Request, Response, NextFunction } from "express";
import { z } from "zod";

export default function validatePayload<T extends z.ZodTypeAny>(schema: T) {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.parse(req.body);
        req.body = result;
        next();
    };
}
