import { OnlineUser, OnlineUserRow } from '../types';
import { databaseManager } from '../database/connection';
import logger from '../utils/logger';

export class OnlineUserModel {
  // 从数据库行数据转换为OnlineUser对象
  static fromRow(row: OnlineUserRow): OnlineUser {
    return {
      socketId: row.socket_id,
      userId: row.user_id,
      username: row.username,
      joinedAt: new Date(row.joined_at),
      lastPing: row.last_ping ? new Date(row.last_ping) : undefined,
    };
  }

  // 添加在线用户
  static async add(socketId: string, userId: string, username: string): Promise<OnlineUser> {
    try {
      const now = new Date().toISOString();

      await databaseManager.run(
        'INSERT OR REPLACE INTO online_users (socket_id, user_id, username, joined_at, last_ping) VALUES (?, ?, ?, ?, ?)',
        [socketId, userId, username, now, now]
      );

      const onlineUser: OnlineUser = {
        socketId,
        userId,
        username,
        joinedAt: new Date(now),
        lastPing: new Date(now),
      };

      logger.info(`User ${username} is now online (${socketId})`);
      return onlineUser;
    } catch (error) {
      logger.error('Error adding online user:', error);
      throw error;
    }
  }

  // 移除在线用户
  static async remove(socketId: string): Promise<void> {
    try {
      const user = await this.findBySocketId(socketId);
      
      await databaseManager.run(
        'DELETE FROM online_users WHERE socket_id = ?',
        [socketId]
      );

      if (user) {
        logger.info(`User ${user.username} is now offline (${socketId})`);
      }
    } catch (error) {
      logger.error('Error removing online user:', error);
      throw error;
    }
  }

  // 根据Socket ID查找在线用户
  static async findBySocketId(socketId: string): Promise<OnlineUser | null> {
    try {
      const row = await databaseManager.get<OnlineUserRow>(
        'SELECT * FROM online_users WHERE socket_id = ?',
        [socketId]
      );

      return row ? this.fromRow(row) : null;
    } catch (error) {
      logger.error('Error finding online user by socket ID:', error);
      throw error;
    }
  }

  // 根据用户ID查找在线用户
  static async findByUserId(userId: string): Promise<OnlineUser | null> {
    try {
      const row = await databaseManager.get<OnlineUserRow>(
        'SELECT * FROM online_users WHERE user_id = ?',
        [userId]
      );

      return row ? this.fromRow(row) : null;
    } catch (error) {
      logger.error('Error finding online user by user ID:', error);
      throw error;
    }
  }

  // 根据用户名查找在线用户
  static async findByUsername(username: string): Promise<OnlineUser | null> {
    try {
      const row = await databaseManager.get<OnlineUserRow>(
        'SELECT * FROM online_users WHERE username = ?',
        [username]
      );

      return row ? this.fromRow(row) : null;
    } catch (error) {
      logger.error('Error finding online user by username:', error);
      throw error;
    }
  }

  // 获取所有在线用户
  static async getAll(): Promise<OnlineUser[]> {
    try {
      const rows = await databaseManager.all<OnlineUserRow>(
        'SELECT * FROM online_users ORDER BY joined_at ASC'
      );

      return rows.map(this.fromRow);
    } catch (error) {
      logger.error('Error getting all online users:', error);
      throw error;
    }
  }

  // 更新用户心跳时间
  static async updatePing(socketId: string): Promise<void> {
    try {
      await databaseManager.run(
        'UPDATE online_users SET last_ping = ? WHERE socket_id = ?',
        [new Date().toISOString(), socketId]
      );
    } catch (error) {
      logger.error('Error updating user ping:', error);
      throw error;
    }
  }

  // 获取在线用户数量
  static async getCount(): Promise<number> {
    try {
      const result = await databaseManager.get<{ count: number }>(
        'SELECT COUNT(*) as count FROM online_users'
      );
      return result?.count || 0;
    } catch (error) {
      logger.error('Error getting online users count:', error);
      throw error;
    }
  }

  // 检查用户名是否在线
  static async isUsernameOnline(username: string): Promise<boolean> {
    try {
      const user = await this.findByUsername(username);
      return user !== null;
    } catch (error) {
      logger.error('Error checking if username is online:', error);
      throw error;
    }
  }

  // 清理过期的在线用户（心跳超时）
  static async cleanupStaleUsers(timeoutMinutes: number = 5): Promise<number> {
    try {
      const cutoffTime = new Date();
      cutoffTime.setMinutes(cutoffTime.getMinutes() - timeoutMinutes);

      const result = await databaseManager.run(
        'DELETE FROM online_users WHERE last_ping < ?',
        [cutoffTime.toISOString()]
      );

      const deletedCount = result.changes || 0;
      if (deletedCount > 0) {
        logger.info(`Cleaned up ${deletedCount} stale online users`);
      }

      return deletedCount;
    } catch (error) {
      logger.error('Error cleaning up stale users:', error);
      throw error;
    }
  }
}