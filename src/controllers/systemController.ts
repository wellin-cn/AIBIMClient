import { Request, Response } from 'express';
import { SystemStatsResponse } from '../types/api';
import { UserModel } from '../models/User';
import { OnlineUserModel } from '../models/OnlineUser';
import { MessageModel } from '../models/Message';
import { asyncHandler } from '../middleware/errorHandler';
import { sendSuccess, sendError } from '../utils/response';
import { createError } from '../utils/errors';
import config from '../config';
import logger from '../utils/logger';
import os from 'os';

// 获取系统统计信息
export const getSystemStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info('Getting system statistics');

    const startTime = Date.now();
    
    // 并行获取各种统计数据
    const [
      totalUsers,
      onlineUsers,
      totalMessages,
      onlineUsersList
    ] = await Promise.all([
      UserModel.getTotalCount(),
      OnlineUserModel.getCount(),
      MessageModel.getTotalCount(),
      OnlineUserModel.getAll()
    ]);

    // 服务器信息
    const serverStartTime = Date.now() - process.uptime() * 1000;
    const server = {
      uptime: Math.floor(process.uptime()),
      version: process.env.npm_package_version || '1.0.0',
      environment: config.NODE_ENV,
      startTime: serverStartTime
    };

    // 连接统计
    const connections = {
      total: onlineUsers,
      active: onlineUsers, // 简化处理，实际中可以区分活跃和非活跃
      peak: Math.max(onlineUsers, 50), // 应该从历史数据获取
      byHour: [] as Array<{ hour: number; count: number }> // 可以实现按小时统计
    };

    // 消息统计
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const messages = {
      total: totalMessages,
      today: 0, // 需要添加按日期查询的方法
      perHour: 0, // 需要计算
      byType: {
        text: totalMessages, // 简化处理
        file: 0,
        system: 0
      }
    };

    // 用户统计
    const users = {
      total: totalUsers,
      online: onlineUsers,
      registered: totalUsers,
      active24h: onlineUsers // 简化处理
    };

    // 性能指标
    const memUsage = process.memoryUsage();
    const performance = {
      averageResponseTime: 50, // 应该从实际监控数据获取
      errorRate: 0.01, // 应该从错误日志计算
      memoryUsage: (memUsage.heapUsed / memUsage.heapTotal) * 100,
      cpuUsage: os.loadavg()[0] * 100 / os.cpus().length
    };

    const stats: SystemStatsResponse = {
      server,
      connections,
      messages,
      users,
      performance
    };

    const responseTime = Date.now() - startTime;
    
    logger.info(`Retrieved system statistics in ${responseTime}ms`, {
      totalUsers,
      onlineUsers,
      totalMessages,
      responseTime
    });

    sendSuccess(res, stats, 200, (req as any).requestId);
    
  } catch (error) {
    logger.error('Error getting system statistics:', error);
    sendError(res, createError.internal('Failed to retrieve system statistics'), undefined, (req as any).requestId);
  }
});

// 获取服务器信息
export const getServerInfo = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info('Getting server information');

    const serverInfo = {
      name: 'IM Chat Server',
      version: process.env.npm_package_version || '1.0.0',
      environment: config.NODE_ENV,
      nodeVersion: process.version,
      platform: process.platform,
      architecture: process.arch,
      uptime: Math.floor(process.uptime()),
      startTime: Date.now() - process.uptime() * 1000,
      pid: process.pid,
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem()
      },
      cpu: {
        model: os.cpus()[0].model,
        cores: os.cpus().length,
        loadAverage: os.loadavg()
      }
    };

    logger.info('Retrieved server information');

    sendSuccess(res, serverInfo, 200, (req as any).requestId);
    
  } catch (error) {
    logger.error('Error getting server information:', error);
    sendError(res, createError.internal('Failed to retrieve server information'), undefined, (req as any).requestId);
  }
});