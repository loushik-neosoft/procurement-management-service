import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    const { method, url } = req;

    // Override res.send to capture response body if needed
    const oldSend = res.send;
    res.send = function (data) {
        res.locals.responseBody = data;
        return oldSend.call(res, data);
    };

    res.on('finish', () => {
        const duration = Date.now() - start;
        const { statusCode } = res;
        console.log(`[${new Date().toISOString()}] ${method} ${url} ${statusCode} - ${duration}ms`);
    });

    next();
};
