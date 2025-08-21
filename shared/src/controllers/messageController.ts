import { Request, Response } from 'express';
import { MessageModel } from '../models/Message';
import { GetMessagesRequest, GetMessagesResponse } from '../types/api';
import { asyncHandler } from '../middleware/errorHandler';
import { sendSuccess, sendError } from '../utils/response';
import { createError } from '../utils/errors';
import logger from '../utils/logger';

// 获取历史消息
export const getMessages = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query as unknown as GetMessagesRequest;
    
    // 设置默认值和验证
    const limit = Math.min(Math.max(parseInt(query.limit?.toString() || '50'), 1), 100);
    const before = query.before ? parseInt(query.before.toString()) : undefined;
    const after = query.after ? parseInt(query.after.toString()) : undefined;

    if (before && isNaN(before)) {
      throw createError.validation('Invalid before timestamp', 'before', query.before);
    }
    
    if (after && isNaN(after)) {
      throw createError.validation('Invalid after timestamp', 'after', query.after);
    }

    logger.info('Getting messages', { limit, before, after });

    // 获取消息列表 - 需要更新MessageModel.getMessages方法
    const result = await MessageModel.getMessages(limit, before ? new Date(before).toISOString() : undefined);

    // 转换为标准响应格式
    const response: GetMessagesResponse = {
      messages: result.items,
      pagination: {
        hasMore: result.hasMore,
        total: result.total,
        limit,
        before,
        after
      }
    };

    logger.info(`Retrieved ${result.items.length} messages`, {
      total: result.total,
      hasMore: result.hasMore,
    });

    sendSuccess(res, response, 200, (req as any).requestId);
    
  } catch (error) {
    logger.error('Error getting messages:', error);
    
    if (error instanceof Error && error.message.includes('validation')) {
      sendError(res, error, undefined, (req as any).requestId);
    } else {
      sendError(res, createError.internal('Failed to retrieve messages'), undefined, (req as any).requestId);
    }
  }
});

// 获取最近消息（用于初始加载）
export const getRecentMessages = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit?.toString() || '50'), 1), 100);

    logger.info('Getting recent messages', { limit });

    const messages = await MessageModel.getRecentMessages(limit);

    logger.info(`Retrieved ${messages.length} recent messages`);

    sendSuccess(res, messages, 200, (req as any).requestId);
    
  } catch (error) {
    logger.error('Error getting recent messages:', error);
    sendError(res, createError.internal('Failed to retrieve recent messages'), undefined, (req as any).requestId);
  }
});

// 获取消息统计信息
export const getMessageStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const totalMessages = await MessageModel.getTotalCount();

    const stats = {
      totalMessages,
      timestamp: Date.now(),
    };

    sendSuccess(res, stats, 200, (req as any).requestId);
    
  } catch (error) {
    logger.error('Error getting message stats:', error);
    sendError(res, createError.internal('Failed to retrieve message statistics'), undefined, (req as any).requestId);
  }
});