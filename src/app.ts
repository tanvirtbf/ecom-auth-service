import express, { type NextFunction, type Request, type Response } from 'express';
import logger from './config/logger.js';
import type { HttpError } from 'http-errors';
import createHttpError from 'http-errors';

const app = express();

// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/require-await
app.get('/', async (req: Request, res: Response) => {
  const err = createHttpError(400, 'Bad Request');
  throw err;
});

// Global error handler

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error: HttpError, req: Request, res: Response, next: NextFunction) => {
  logger.error(error.message);
  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    error: [
      {
        type: error.name,
        message: error.message,
        path: '',
        location: '',
      },
    ],
  });
});

export default app;
