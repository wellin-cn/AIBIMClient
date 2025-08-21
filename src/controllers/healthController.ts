import { Request, Response } from 'express';
import { HealthCheckResponse } from '../types/api';
import { databaseManager } from '../database/connection';
import { OnlineUserModel } from '../models/OnlineUser';
import { MessageModel } from '../models/Message';
import { UserModel } from '../models/User';
import { asyncHandler } from '../middleware/errorHandler';
import { sendSuccess, sendError } from '../utils/response';
import { createError } from '../utils/errors';
import config from '../config';
import logger from '../utils/logger';
import os from 'os';

// 获取系统健康状态
export const getHealth = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  
  try {
    // 检查各项服务状态
    const services = {
      database: 'ok' as 'ok' | 'error',
      websocket: 'ok' as 'ok' | 'error',
      fileSystem: 'ok' as 'ok' | 'error'
    };

    // 检查数据库连接
    try {
      await databaseManager.get('SELECT 1');
    } catch (error) {
      services.database = 'error';
      logger.error('Database health check failed:', error);
    }

    // 检查文件系统
    try {
      const fs = require('fs');
      await fs.promises.access(config.UPLOAD_DIR);
    } catch (error) {
      services.fileSystem = 'error';
      logger.error('File system health check failed:', error);
    }

    // 获取系统指标
    const memUsage = process.memoryUsage();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;

    const metrics = {
      memoryUsage: (usedMemory / totalMemory) * 100,
      cpuUsage: os.loadavg()[0] * 100 / os.cpus().length,
      diskUsage: 0 // 简化处理，实际项目中可以获取真实磁盘使用率
    };

    // 获取连接数
    const connections = await OnlineUserModel.getCount();

    // 确定整体状态
    const hasErrors = Object.values(services).includes('error');
    const status = hasErrors ? 'degraded' as const : 'ok' as const;

    const healthData: HealthCheckResponse = {
      status,
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      connections,
      version: process.env.npm_package_version || '1.0.0',
      environment: config.NODE_ENV,
      services,
      metrics
    };

    const responseTime = Date.now() - startTime;
    
    // 设置响应时间头
    res.setHeader('X-Response-Time', `${responseTime}ms`);
    
    logger.info(`Health check completed in ${responseTime}ms`, {
      status: healthData.status,
      connections: healthData.connections,
      responseTime,
    });

    sendSuccess(res, healthData, 200, (req as any).requestId);
    
  } catch (error) {
    logger.error('Health check error:', error);
    sendError(res, createError.internal('Health check failed'), undefined, (req as any).requestId);
  }
});