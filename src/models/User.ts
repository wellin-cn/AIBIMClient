import { v4 as uuidv4 } from 'uuid';
import { User, UserRow } from '../types';
import { databaseManager } from '../database/connection';
import logger from '../utils/logger';

export class UserModel {
  // 从数据库行数据转换为User对象
  static fromRow(row: UserRow): User {
    return {
      id: row.id,
      username: row.username,
      createdAt: new Date(row.created_at),
      lastSeen: new Date(row.last_seen),
    };
  }

  // 创建新用户
  static async create(username: string): Promise<User> {
    try {
      const id = uuidv4();
      const now = new Date().toISOString();

      await databaseManager.run(
        'INSERT INTO users (id, username, created_at, last_seen) VALUES (?, ?, ?, ?)',
        [id, username, now, now]
      );

      const user: User = {
        id,
        username,
        createdAt: new Date(now),
        lastSeen: new Date(now),
      };

      logger.info(`User created: ${username} (${id})`);
      return user;
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  // 根据ID查找用户
  static async findById(id: string): Promise<User | null> {
    try {
      const row = await databaseManager.get<UserRow>(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );

      return row ? this.fromRow(row) : null;
    } catch (error) {
      logger.error('Error finding user by ID:', error);
      throw error;
    }
  }

  // 根据用户名查找用户
  static async findByUsername(username: string): Promise<User | null> {
    try {
      const row = await databaseManager.get<UserRow>(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );

      return row ? this.fromRow(row) : null;
    } catch (error) {
      logger.error('Error finding user by username:', error);
      throw error;
    }
  }

  // 更新用户最后在线时间
  static async updateLastSeen(id: string): Promise<void> {
    try {
      await databaseManager.run(
        'UPDATE users SET last_seen = ? WHERE id = ?',
        [new Date().toISOString(), id]
      );
    } catch (error) {
      logger.error('Error updating user last seen:', error);
      throw error;
    }
  }

  // 检查用户名是否已存在
  static async isUsernameExists(username: string): Promise<boolean> {
    try {
      const user = await this.findByUsername(username);
      return user !== null;
    } catch (error) {
      logger.error('Error checking username existence:', error);
      throw error;
    }
  }

  // 获取所有用户（用于统计）
  static async findAll(): Promise<User[]> {
    try {
      const rows = await databaseManager.all<UserRow>('SELECT * FROM users ORDER BY created_at DESC');
      return rows.map(this.fromRow);
    } catch (error) {
      logger.error('Error finding all users:', error);
      throw error;
    }
  }

  // 获取用户总数
  static async getTotalCount(): Promise<number> {
    try {
      const result = await databaseManager.get<{ count: number }>(
        'SELECT COUNT(*) as count FROM users WHERE username != "SYSTEM"'
      );
      return result?.count || 0;
    } catch (error) {
      logger.error('Error getting user count:', error);
      throw error;
    }
  }
}