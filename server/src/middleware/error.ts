import { NextFunction, Request, Response } from "express";

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // differenceiate known app errors from unexpected crashes

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ErrorMiddleware {
  static notFound(req: Request, res: Response, next: NextFunction): void {
    next(new AppError(`Not Found - ${req.originalUrl}`, 404));
  }

  static errorHandler(
    err: AppError | Error,
    req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    const statusCode = err instanceof AppError ? err.statusCode : 500;
    const message = err.message || "Internal Server Error";

    res.status(statusCode).json({
      success: false,
      message,
      stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    });
  }
}
