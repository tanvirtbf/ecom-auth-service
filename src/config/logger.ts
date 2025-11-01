import winston from 'winston';
import { Config } from './index.js';

const logger = winston.createLogger({
  level: 'info',
  defaultMeta: {
    serviceName: 'auth-service',
  },
  transports: [
    new winston.transports.Console({
      level: 'info',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      silent: Config.NODE_ENV === 'production' || Config.NODE_ENV === 'test',
    }),
    new winston.transports.File({
      dirname: 'logs',
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      silent: true,
    }),
    new winston.transports.File({
      level: 'info',
      dirname: 'logs',
      filename: 'logs/combined.log',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      silent: true,
    }),
  ],
});

export default logger;
