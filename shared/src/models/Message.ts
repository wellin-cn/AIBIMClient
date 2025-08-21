import { v4 as uuidv4 } from 'uuid';
import { Message, MessageRow, PaginatedResponse } from '../types';
import { databaseManager } from '../database/connection';
import logger from '../utils/logger';

export interface CreateMessageData {
  type: 'text' | 'file' | 'system';
  content: string;
  senderId: string;
  filePath?: string;
  fileName?: string;
  fileSize?: number;
}

export class MessageModel {
  // 从数据库行数据转换为Message对象
  static fromRow(row: MessageRow): Message {
    return {
      id: row.id,
      type: row.type as 'text' | 'file' | 'system',
      content: row.content,
      senderId: row.sender_id,
      timestamp: new Date(row.timestamp),
      filePath: row.file_path,
      fileName: row.file_name,
      fileSize: row.file_size,
    };
  }

  // 创建新消息
  static async create(data: CreateMessageData): Promise<Message> {
    try {
      const id = uuidv4();
      const timestamp = new Date().toISOString();

      await databaseManager.run(
        `INSERT INTO messages (id, type, content, sender_id, timestamp, file_path, file_name, file_size) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          data.type,
          data.content,
          data.senderId,
          timestamp,
          data.filePath || null,
          data.fileName || null,
          data.fileSize || null,
        ]
      );

      const message: Message = {
        id,
        type: data.type,
        content: data.content,
        senderId: data.senderId,
        timestamp: new Date(timestamp),
        filePath: data.filePath,
        fileName: data.fileName,
        fileSize: data.fileSize,
      };

      logger.info(`Message created: ${data.type} from ${data.senderId}`);
      return message;
    } catch (error) {
      logger.error('Error creating message:', error);
      throw error;
    }
  }

  // 根据ID查找消息
  static async findById(id: string): Promise<Message | null> {
    try {
      const row = await databaseManager.get<MessageRow>(
        'SELECT * FROM messages WHERE id = ?',
        [id]
      );

      return row ? this.fromRow(row) : null;
    } catch (error) {
      logger.error('Error finding message by ID:', error);
      throw error;
    }
  }

  // 分页获取历史消息
  static async getMessages(
    limit: number = 50,
    before?: string
  ): Promise<PaginatedResponse<Message>> {
    try {
      let sql = 'SELECT * FROM messages';
      const params: any[] = [];

      if (before) {
        sql += ' WHERE timestamp < ?';
        params.push(before);
      }

      sql += ' ORDER BY timestamp DESC LIMIT ?';
      params.push(limit + 1); // 多获取一条用于判断是否还有更多

      const rows = await databaseManager.all<MessageRow>(sql, params);
      
      const hasMore = rows.length > limit;
      const messages = rows.slice(0, limit).map(this.fromRow);
      
      // 获取总数
      const totalResult = await databaseManager.get<{ count: number }>(
        'SELECT COUNT(*) as count FROM messages'
      );
      const total = totalResult?.count || 0;

      return {
        items: messages,
        total,
        page: 1, // 简化分页，使用时间戳分页
        limit,
        hasMore,
      };
    } catch (error) {
      logger.error('Error getting messages:', error);
      throw error;
    }
  }

  // 获取最近的消息（用于初始加载）
  static async getRecentMessages(limit: number = 50): Promise<Message[]> {
    try {
      const rows = await databaseManager.all<MessageRow>(
        'SELECT * FROM messages ORDER BY timestamp DESC LIMIT ?',
        [limit]
      );

      // 反转顺序，使最新的消息在最后
      return rows.reverse().map(this.fromRow);
    } catch (error) {
      logger.error('Error getting recent messages:', error);
      throw error;
    }
  }

  // 根据发送者获取消息
  static async getMessagesBySender(senderId: string, limit: number = 50): Promise<Message[]> {
    try {
      const rows = await databaseManager.all<MessageRow>(
        'SELECT * FROM messages WHERE sender_id = ? ORDER BY timestamp DESC LIMIT ?',
        [senderId, limit]
      );

      return rows.map(this.fromRow);
    } catch (error) {
      logger.error('Error getting messages by sender:', error);
      throw error;
    }
  }

  // 获取消息总数
  static async getTotalCount(): Promise<number> {
    try {
      const result = await databaseManager.get<{ count: number }>(
        'SELECT COUNT(*) as count FROM messages'
      );
      return result?.count || 0;
    } catch (error) {
      logger.error('Error getting message count:', error);
      throw error;
    }
  }

  // 创建系统消息
  static async createSystemMessage(content: string): Promise<Message> {
    return this.create({
      type: 'system',
      content,
      senderId: 'system',
    });
  }

  // 删除过期消息（清理功能）
  static async deleteOldMessages(daysOld: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await databaseManager.run(
        'DELETE FROM messages WHERE timestamp < ?',
        [cutoffDate.toISOString()]
      );

      logger.info(`Deleted ${result.changes} old messages (older than ${daysOld} days)`);
      return result.changes || 0;
    } catch (error) {
      logger.error('Error deleting old messages:', error);
      throw error;
    }
  }
}