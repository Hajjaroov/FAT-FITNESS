import "server-only";
import path from "path";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const logDir = path.join(process.cwd(), "logs");

const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? " " + JSON.stringify(meta) : "";
    return `${timestamp} ${level.toUpperCase().padEnd(5)} ${message}${metaStr}${stack ? "\n" + stack : ""}`;
  }),
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.printf(({ level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? " " + JSON.stringify(meta) : "";
    return `[next] ${level} ${message}${metaStr}`;
  }),
);

export const serverLogger = winston.createLogger({
  level: "info",
  transports: [
    new winston.transports.Console({ format: consoleFormat }),
    new DailyRotateFile({
      dirname: logDir,
      filename: "app-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "30d",
      zippedArchive: true,
      format: fileFormat,
    }),
    new DailyRotateFile({
      dirname: logDir,
      filename: "error-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      level: "error",
      maxSize: "10m",
      maxFiles: "60d",
      zippedArchive: true,
      format: fileFormat,
    }),
  ],
});

export const clientLogger = winston.createLogger({
  level: "info",
  transports: [
    new DailyRotateFile({
      dirname: logDir,
      filename: "client-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "30d",
      zippedArchive: true,
      format: fileFormat,
    }),
  ],
});
