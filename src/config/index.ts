import dotenv from 'dotenv';
import path from 'path';

// 加载环境变量
dotenv.config();

interface Config {
  // 服务器配置
  NODE_ENV: string;
  PORT: number;
  
  // 数据库配置
  DATABASE_PATH: string;
  
  // 文件上传配置
  UPLOAD_DIR: string;
  MAX_FILE_SIZE: number;
  
  // CORS配置
  CORS_ORIGIN: string;
  
  // 日志配置
  LOG_LEVEL: string;
  LOG_DIR: string;
  
  // Socket.io配置
  SOCKET_PING_TIMEOUT: number;
  SOCKET_PING_INTERVAL: number;
  
  // 业务限制配置
  MAX_ONLINE_USERS: number;
  MAX_MESSAGE_LENGTH: number;
  MAX_USERNAME_LENGTH: number;
}

const config: Config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3001', 10),
  
  DATABASE_PATH: process.env.DATABASE_PATH || './data/app.db',
  
  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
  
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  LOG_DIR: process.env.LOG_DIR || './logs',
  
  SOCKET_PING_TIMEOUT: parseInt(process.env.SOCKET_PING_TIMEOUT || '60000', 10),
  SOCKET_PING_INTERVAL: parseInt(process.env.SOCKET_PING_INTERVAL || '25000', 10),
  
  MAX_ONLINE_USERS: parseInt(process.env.MAX_ONLINE_USERS || '100', 10),
  MAX_MESSAGE_LENGTH: parseInt(process.env.MAX_MESSAGE_LENGTH || '1000', 10),
  MAX_USERNAME_LENGTH: parseInt(process.env.MAX_USERNAME_LENGTH || '20', 10),
};

// 验证必要的配置
const validateConfig = (): void => {
  const requiredFields: (keyof Config)[] = ['PORT', 'DATABASE_PATH'];
  
  for (const field of requiredFields) {
    if (!config[field]) {
      throw new Error(`Missing required config field: ${field}`);
    }
  }
};

validateConfig();

export default config;