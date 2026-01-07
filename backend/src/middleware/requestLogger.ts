import { Request, Response, NextFunction } from "express";
import logger from "../config/logger";
import pool from "../config/database";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on("finish", async () => {
    const duration = Date.now() - start;
    const route = req.originalUrl;
    const method = req.method;
    const statusCode = res.statusCode;
    const errorMessage = (res.locals && res.locals.errorMessage) ? String(res.locals.errorMessage) : null;

    try {
      await pool.query(
        'INSERT INTO request_logs (route, method, status_code, duration_ms, error_message) VALUES ($1, $2, $3, $4, $5)',
        [route, method, statusCode, duration, errorMessage]
      );
    } catch (err: any) {
      logger.error({ err }, "Failed to insert request log");
    }

    logger.info({ route, method, statusCode, duration, errorMessage }, "Request handled");
  });

  next();
}

export function errorCaptureMiddleware(err: any, req: Request, res: Response, next: NextFunction) {
  res.locals.errorMessage = err?.message ?? null;
  next(err);
}
