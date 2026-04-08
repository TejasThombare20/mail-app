import winston from "winston";

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
  return `${timestamp} [${level}]${stack ? `: ${stack}` : `: ${message}`}${metaStr}`;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "http",
  format: combine(
    errors({ stack: true }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" })
  ),
  transports: [
    new winston.transports.Console({
      format: combine(colorize(), logFormat),
    }),
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      format: combine(logFormat),
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
      format: combine(logFormat),
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
    }),
  ],
});

export default logger;
