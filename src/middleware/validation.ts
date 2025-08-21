import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';
import config from '../config';

// 验证模式定义
export const schemas = {
  // 用户名验证
  username: Joi.string()
    .min(1)
    .max(config.MAX_USERNAME_LENGTH)
    .pattern(/^[a-zA-Z0-9\u4e00-\u9fa5_-]+$/)
    .required()
    .messages({
      'string.min': '用户名不能为空',
      'string.max': `用户名长度不能超过${config.MAX_USERNAME_LENGTH}个字符`,
      'string.pattern.base': '用户名只能包含字母、数字、中文、下划线和横线',
    }),

  // 消息内容验证
  messageContent: Joi.string()
    .min(1)
    .max(config.MAX_MESSAGE_LENGTH)
    .required()
    .messages({
      'string.min': '消息内容不能为空',
      'string.max': `消息内容不能超过${config.MAX_MESSAGE_LENGTH}个字符`,
    }),

  // 消息类型验证
  messageType: Joi.string()
    .valid('text', 'file', 'system')
    .required(),

  // 分页参数验证
  pagination: Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(50),
    before: Joi.string().isoDate().optional(),
    after: Joi.string().isoDate().optional(),
  }),

  // Socket用户加入验证
  userJoin: Joi.object({
    username: Joi.string()
      .min(1)
      .max(config.MAX_USERNAME_LENGTH)
      .pattern(/^[a-zA-Z0-9\u4e00-\u9fa5_-]+$/)
      .required(),
  }),

  // Socket消息发送验证
  messageSend: Joi.object({
    type: Joi.string().valid('text', 'file').required(),
    content: Joi.string()
      .min(1)
      .max(config.MAX_MESSAGE_LENGTH)
      .required(),
    timestamp: Joi.number().optional(),
    tempId: Joi.string().optional(),
  }),
};

// 验证中间件生成器
export const validate = (schema: Joi.ObjectSchema, source: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      throw new AppError(errorMessage, 400);
    }

    // 将验证后的数据替换原始数据
    req[source] = value;
    next();
  };
};

// Socket事件数据验证
export const validateSocketData = <T>(schema: Joi.ObjectSchema, data: any): T => {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    throw new Error(errorMessage);
  }

  return value as T;
};