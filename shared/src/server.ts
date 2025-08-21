import http from 'http';
import app from './app';
import { SocketService } from './services/socketService';
import { databaseManager } from './database/connection';
import { cleanupMessageRateLimit } from './middleware/security';
import { OnlineUserModel } from './models/OnlineUser';
import config from './config';
import logger from './utils/logger';

// 创建HTTP服务器
const server = http.createServer(app);

// 初始化Socket.io服务
const socketService = new SocketService(server);

// 优雅关闭处理
const gracefulShutdown = async (signal: string): Promise<void> => {
  logger.info(`Received ${signal}, starting graceful shutdown...`);

  try {
    // 停止接收新连接
    server.close(async () => {
      logger.info('HTTP server closed');

      try {
        // 清理在线用户
        await databaseManager.run('DELETE FROM online_users');
        logger.info('Cleaned up online users');

        // 关闭数据库连接
        await databaseManager.close();
        logger.info('Database connection closed');

        logger.info('Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        logger.error('Error during graceful shutdown:', error);
        process.exit(1);
      }
    });

    // 发送关闭通知给所有客户端
    await socketService.broadcastSystemMessage('服务器将在几秒后重启，请稍后重新连接');

    // 给客户端一些时间处理消息
    setTimeout(() => {
      if (server.listening) {
        logger.warn('Forcefully shutting down server');
        process.exit(1);
      }
    }, 10000); // 10秒超时

  } catch (error) {
    logger.error('Error in graceful shutdown:', error);
    process.exit(1);
  }
};

// 注册信号处理器
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// 启动定期清理任务
const startCleanupTasks = (): void => {
  // 每分钟清理消息频率限制数据
  setInterval(cleanupMessageRateLimit, 60 * 1000);

  // 每5分钟清理过期的在线用户
  setInterval(async () => {
    try {
      const cleaned = await OnlineUserModel.cleanupStaleUsers(5);
      if (cleaned > 0) {
        logger.info(`Cleaned up ${cleaned} stale online users`);
        // 更新在线用户列表
        const onlineUsers = await OnlineUserModel.getAll();
        socketService.getIO().to('chat').emit('users:update', { onlineUsers });
      }
    } catch (error) {
      logger.error('Error cleaning up stale users:', error);
    }
  }, 5 * 60 * 1000);

  logger.info('Cleanup tasks started');
};

// 服务器启动
const startServer = async (): Promise<void> => {
  try {
    // 初始化数据库
    logger.info('Initializing database...');
    await databaseManager.initialize();
    
    if (!databaseManager.isReady()) {
      throw new Error('Database initialization failed');
    }

    // 清理启动时的在线用户（防止异常关闭残留数据）
    await databaseManager.run('DELETE FROM online_users');
    logger.info('Cleaned up existing online users on startup');

    // 启动定期清理任务
    startCleanupTasks();

    // 启动服务器
    server.listen(config.PORT, () => {
      logger.info(`🚀 Server is running on port ${config.PORT}`);
      logger.info(`📱 Environment: ${config.NODE_ENV}`);
      logger.info(`💾 Database: ${config.DATABASE_PATH}`);
      logger.info(`📁 Upload directory: ${config.UPLOAD_DIR}`);
      logger.info(`🌐 CORS origin: ${config.CORS_ORIGIN}`);
      
      console.log(`
╔═══════════════════════════════════════╗
║         IM Chat Server Started        ║
║                                       ║
║  🌐 HTTP: http://localhost:${config.PORT.toString().padEnd(12)}║
║  📡 Socket.io: Ready for connections  ║
║  💾 Database: Connected               ║
║                                       ║
║  Press Ctrl+C to stop the server     ║
╚═══════════════════════════════════════╝
      `);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// 启动应用
startServer();