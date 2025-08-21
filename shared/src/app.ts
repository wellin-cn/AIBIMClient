import express from 'express';
import cors from 'cors';
import path from 'path';
import config from './config';
import logger from './utils/logger';
import apiRoutes from './routes/api';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { securityHeaders, requestLogger } from './middleware/security';
import { addRequestId } from './utils/response';

const app = express();

// 信任代理（用于获取真实IP）
app.set('trust proxy', 1);

// 基础中间件
app.use(addRequestId);
app.use(securityHeaders);
app.use(requestLogger);

// CORS配置
app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// 请求解析中间件
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务
app.use('/files', express.static(path.resolve(config.UPLOAD_DIR)));

// API路由
app.use('/api', apiRoutes);

// 根路径响应
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'IM Chat Server is running',
    version: process.env.npm_package_version || '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// 404处理
app.use(notFoundHandler);

// 错误处理
app.use(errorHandler);

// 处理未捕获的异常
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default app;