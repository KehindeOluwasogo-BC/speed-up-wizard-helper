import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';

export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Log the error with request context
    logger.error({
        message: err.message,
        error: err,
        requestInfo: {
            method: req.method,
            url: req.url,
            ip: req.ip,
            body: req.body,
            params: req.params,
            query: req.query,
            userId: req.headers['user-id'], // If you implement authentication later
        }
    });

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            status: err.status,
            message: err.message
        });
    }

    // Handle multer errors specifically
    if (err.name === 'MulterError') {
        return res.status(400).json({
            success: false,
            status: 'error',
            message: `File upload error: ${err.message}`
        });
    }

    // Handle validation errors (e.g., from mongoose)
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            status: 'error',
            message: 'Validation Error',
            errors: Object.values(err).map((e: any) => e.message)
        });
    }

    // Send generic error in production, detailed error in development
    const response = {
        success: false,
        status: 'error',
        message: process.env.NODE_ENV === 'production' 
            ? 'Something went wrong' 
            : err.message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    };

    return res.status(500).json(response);
};