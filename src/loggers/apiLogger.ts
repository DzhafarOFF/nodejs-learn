import { NextFunction, Request, Response } from "express";
import winston, { format, transports } from "winston";

const logger = winston.createLogger({
  level: "info",
  format: format.combine(
    format.splat(),
    format.simple(),
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    format.colorize(),
    format.printf(({ level, message, _, timestamp }) => {
      return `[${timestamp}] ${level}: ${message}`;
    }),
    format.errors({ stack: true })
  ),
  transports: [
    new winston.transports.Console({
      handleExceptions: true,
      handleRejections: true,
    }),
  ],
});

export const apiLoggerMiddleware = (
  req: Request,
  _: Response,
  next: NextFunction
) => {
  const bodyString = JSON.stringify(req.body);
  const bodyLog = bodyString ? "with body: " + bodyString : "";

  logger.info(`${req.method} ${req.url} ${bodyLog}`);

  next();
};

export const apiErrorLoggerMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(`${req.method} ${req.url} Error:${err}`);
  res.status(500).json({ success: false, error: "Internal Server Error" });
  next(err);
};
