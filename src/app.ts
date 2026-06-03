import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { config } from './infrastructure/config/config';
import { logger } from './infrastructure/logging/logger';
import { errorHandler } from './presentation/http/middleware/errorHandler';
import { NotFoundError } from './infrastructure/errors/AppError';

const app: Application = express();

// 1. Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: config.CORS_ORIGIN,
    credentials: true,
  })
);

// 2. Request Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. HTTP Request Logging (Morgan streaming to Winston)
const morganMiddleware = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  {
    stream: {
      write: (message) => logger.http(message.trim()),
    },
  }
);
app.use(morganMiddleware);

// 4. Global Rate Limiter
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX,
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// 5. Health Check Router
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    env: config.NODE_ENV,
  });
});

// 6. Catch-all route for unregistered endpoints (404)
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new NotFoundError(`Route ${req.originalUrl} not found`));
});

// 7. Global Error Middleware
app.use(errorHandler);

export default app;
