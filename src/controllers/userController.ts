import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { OnlineUserModel } from '../models/OnlineUser';
import { GetUsersRequest, GetUsersResponse, UserStats } from '../types/api';
import { asyncHandler } from '../middleware/errorHandler';
import { sendSuccess, sendError } from '../utils/response';
import { createError } from '../utils/errors';
import logger from '../utils/logger';

// 获取用户列表
export const getUsers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query as unknown as GetUsersRequest;
    
    // 验证参数
    const limit = Math.min(Math.max(parseInt(query.limit?.toString() || '50'), 1), 100);
    const includeOffline = query.includeOffline === true || query.includeOffline?.toString() === 'true';
    const search = query.search?.toString().trim();

    logger.info('Getting users', { limit, includeOffline, search });

    // 获取在线用户
    const onlineUsers = await OnlineUserModel.getAll();
    
    // 获取所有用户（如果需要）
    let allUsers: any[] = [];
    if (includeOffline) {
      allUsers = await UserModel.findAll();
      
      // 如果有搜索条件，过滤用户
      if (search) {
        allUsers = allUsers.filter(user => 
          user.username.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      // 应用分页
      allUsers = allUsers.slice(0, limit);
    }

    // 获取用户统计
    const totalUsers = await UserModel.getTotalCount();
    const onlineCount = onlineUsers.length;
    
    // 计算峰值在线用户数（简化处理）
    const peakUsers = Math.max(onlineCount, 50); // 这里应该从统计数据中获取

    const stats = {
      total: totalUsers,
      online: onlineCount,
      peak: peakUsers
    };

    const response: GetUsersResponse = {
      users: includeOffline ? allUsers : [],
      onlineUsers,
      stats
    };

    logger.info(`Retrieved users`, {
      onlineUsers: onlineUsers.length,
      totalUsers: includeOffline ? allUsers.length : 0,
      stats
    });

    sendSuccess(res, response, 200, (req as any).requestId);
    
  } catch (error) {
    logger.error('Error getting users:', error);
    sendError(res, createError.internal('Failed to retrieve users'), undefined, (req as any).requestId);
  }
});

// 获取在线用户列表
export const getOnlineUsers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info('Getting online users');

    const onlineUsers = await OnlineUserModel.getAll();

    logger.info(`Retrieved ${onlineUsers.length} online users`);

    sendSuccess(res, onlineUsers, 200, (req as any).requestId);
    
  } catch (error) {
    logger.error('Error getting online users:', error);
    sendError(res, createError.internal('Failed to retrieve online users'), undefined, (req as any).requestId);
  }
});

// 获取用户统计信息
export const getUserStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info('Getting user statistics');

    const totalUsers = await UserModel.getTotalCount();
    const onlineUsers = await OnlineUserModel.getCount();
    
    // 这里可以扩展更多统计信息
    const stats: UserStats = {
      totalUsers,
      onlineUsers,
      peakOnlineUsers: Math.max(onlineUsers, 50), // 应该从历史数据获取
      averageSessionDuration: 1800 // 30分钟，应该从实际数据计算
    };

    logger.info('Retrieved user statistics', stats);

    sendSuccess(res, stats, 200, (req as any).requestId);
    
  } catch (error) {
    logger.error('Error getting user statistics:', error);
    sendError(res, createError.internal('Failed to retrieve user statistics'), undefined, (req as any).requestId);
  }
});

// 根据ID获取用户信息
export const getUserById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id) {
      throw createError.validation('User ID is required', 'id');
    }

    logger.info('Getting user by ID', { id });

    const user = await UserModel.findById(id);
    
    if (!user) {
      throw createError.notFound('User');
    }

    logger.info('Retrieved user', { userId: user.id, username: user.username });

    sendSuccess(res, user, 200, (req as any).requestId);
    
  } catch (error) {
    logger.error('Error getting user by ID:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      sendError(res, error, undefined, (req as any).requestId);
    } else {
      sendError(res, createError.internal('Failed to retrieve user'), undefined, (req as any).requestId);
    }
  }
});

// 根据用户名获取用户信息
export const getUserByUsername = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.params;
    
    if (!username) {
      throw createError.validation('Username is required', 'username');
    }

    logger.info('Getting user by username', { username });

    const user = await UserModel.findByUsername(username);
    
    if (!user) {
      throw createError.notFound('User');
    }

    logger.info('Retrieved user', { userId: user.id, username: user.username });

    sendSuccess(res, user, 200, (req as any).requestId);
    
  } catch (error) {
    logger.error('Error getting user by username:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      sendError(res, error, undefined, (req as any).requestId);
    } else {
      sendError(res, createError.internal('Failed to retrieve user'), undefined, (req as any).requestId);
    }
  }
});