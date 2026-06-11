import winston from 'winston';
import { config } from '../config/config';

const { combine, timestamp, json, colorize, printf, errors } = winston.format;

const consoleFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
  let log = `${timestamp} [${level}]: ${message}`;
  if (metadata && Object.keys(metadata).length > 0) {
    log += ` | ${JSON.stringify(metadata)}`;
  }
  if (stack) {
    log += `\nStack: ${stack}`;
  }
  return log;
});

const getFormats = () => {
  const formats = [errors({ stack: true }), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })];

  if (config.NODE_ENV === 'development') {
    formats.push(colorize(), consoleFormat);
  } else {
    formats.push(json());
  }

  return combine(...formats);
};

export const logger = winston.createLogger({
  level: config.LOG_LEVEL,
  format: getFormats(),
  transports: [
    new winston.transports.Console(),
    ...(config.NODE_ENV === 'production'
      ? [
          new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
          new winston.transports.File({ filename: 'logs/combined.log' }),
        ]
      : []),
  ],
});
