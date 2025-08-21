import winston from 'winston';
import path from 'path';
import config from '../config';

const { combine, timestamp, label, printf, colorize, errors } = winston.format;

// 自定义日志格式
const logFormat = printf(({ level, message, label, timestamp, stack }) => {
  return `${timestamp} [${label}] ${level}: ${stack || message}`;
});

// 创建日志实例
const logger = winston.createLogger({
  level: config.LOG_LEVEL,
  format: combine(
    errors({ stack: true }),
    label({ label: 'IM-Server' }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  defaultMeta: { service: 'im-server' },
  transports: [
    // 错误日志文件
    new winston.transports.File({
      filename: path.join(config.LOG_DIR, 'error.log'),
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
    // 综合日志文件
    new winston.transports.File({
      filename: path.join(config.LOG_DIR, 'combined.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(config.LOG_DIR, 'exceptions.log'),
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(config.LOG_DIR, 'rejections.log'),
    }),
  ],
});

// 开发环境添加控制台输出
if (config.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: combine(
      colorize(),
      label({ label: 'IM-Server' }),
      timestamp({ format: 'HH:mm:ss' }),
      logFormat
    ),
  }));
}

export default logger;