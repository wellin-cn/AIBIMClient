import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import config from '../config';
import logger from '../utils/logger';

// 请求频率限制
export const createRateLimit = (windowMs: number, max: number, message: string) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: message,
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.url,
      });
      
      res.status(429).json({
        success: false,
        error: message,
      });
    },
  });
};

// API频率限制
export const apiRateLimit = createRateLimit(
  15 * 60 * 1000, // 15分钟
  100, // 最多100次请求
  'Too many API requests, please try again later'
);

// 消息发送频率限制（用于Socket.io）
const messageTimestamps = new Map<string, number[]>();

export const checkMessageRateLimit = (identifier: string, maxMessages = 10, windowMs = 60000): boolean => {
  const now = Date.now();
  const timestamps = messageTimestamps.get(identifier) || [];
  
  // 清理过期的时间戳
  const validTimestamps = timestamps.filter(timestamp => now - timestamp < windowMs);
  
  if (validTimestamps.length >= maxMessages) {
    return false; // 超过限制
  }
  
  validTimestamps.push(now);
  messageTimestamps.set(identifier, validTimestamps);
  
  return true; // 未超过限制
};

// 清理过期的消息时间戳（定期调用）
export const cleanupMessageRateLimit = (): void => {
  const now = Date.now();
  const windowMs = 60000;
  
  for (const [identifier, timestamps] of messageTimestamps.entries()) {
    const validTimestamps = timestamps.filter(timestamp => now - timestamp < windowMs);
    
    if (validTimestamps.length === 0) {
      messageTimestamps.delete(identifier);
    } else {
      messageTimestamps.set(identifier, validTimestamps);
    }
  }
};

// 安全头设置
export const securityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  // 防止点击劫持
  res.setHeader('X-Frame-Options', 'DENY');
  
  // 防止MIME类型嗅探
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // XSS保护
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // 引用者策略
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
};

// 请求日志中间件
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    };
    
    if (res.statusCode >= 400) {
      logger.warn('Request completed with error', logData);
    } else {
      logger.info('Request completed', logData);
    }
  });
  
  next();
};

// IP白名单检查（可选，用于生产环境）
export const checkIPWhitelist = (whitelist: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (whitelist.length === 0 || config.NODE_ENV !== 'production') {
      return next();
    }
    
    const clientIP = req.ip || '';
    
    if (!whitelist.includes(clientIP)) {
      logger.warn(`Access denied for IP: ${clientIP}`);
      res.status(403).json({
        success: false,
        error: 'Access denied',
      });
      return;
    }
    
    next();
  };
};