import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import config from '../config';
import logger from '../utils/logger';

export class DatabaseManager {
  private db: sqlite3.Database | null = null;
  private isConnected = false;

  constructor() {
    // 不在构造函数中调用异步方法
  }

  public async initialize(): Promise<void> {
    try {
      // 确保数据目录存在
      const dataDir = path.dirname(config.DATABASE_PATH);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
        logger.info(`Created data directory: ${dataDir}`);
      }

      // 连接数据库
      await this.connectDatabase();

      // 启用外键约束
      await this.run('PRAGMA foreign_keys = ON');
      
      // 设置WAL模式以提高并发性能
      await this.run('PRAGMA journal_mode = WAL');
      
      // 初始化表结构
      await this.initializeTables();
      
      logger.info('Database initialization completed successfully');
    } catch (error) {
      logger.error('Database initialization failed:', error);
      throw error;
    }
  }

  private connectDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(config.DATABASE_PATH, (err) => {
        if (err) {
          logger.error('Error connecting to database:', err);
          reject(err);
        } else {
          logger.info(`Connected to SQLite database: ${config.DATABASE_PATH}`);
          this.isConnected = true;
          resolve();
        }
      });
    });
  }

  private async initializeTables(): Promise<void> {
    try {
      const schemaPath = path.join(__dirname, 'schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      
      // 分割SQL语句并逐个执行
      const statements = schema.split(';').filter(stmt => stmt.trim());
      
      for (const statement of statements) {
        if (statement.trim()) {
          await this.run(statement.trim());
        }
      }
      
      logger.info('Database tables initialized successfully');
    } catch (error) {
      logger.error('Error initializing database tables:', error);
      throw error;
    }
  }

  public run(sql: string, params: any[] = []): Promise<sqlite3.RunResult> {
    return new Promise((resolve, reject) => {
      if (!this.db || !this.isConnected) {
        reject(new Error('Database not connected'));
        return;
      }

      this.db.run(sql, params, function(err) {
        if (err) {
          logger.error('Database run error:', { sql, params, error: err });
          reject(err);
        } else {
          resolve(this);
        }
      });
    });
  }

  public get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      if (!this.db || !this.isConnected) {
        reject(new Error('Database not connected'));
        return;
      }

      this.db.get(sql, params, (err, row) => {
        if (err) {
          logger.error('Database get error:', { sql, params, error: err });
          reject(err);
        } else {
          resolve(row as T);
        }
      });
    });
  }

  public all<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      if (!this.db || !this.isConnected) {
        reject(new Error('Database not connected'));
        return;
      }

      this.db.all(sql, params, (err, rows) => {
        if (err) {
          logger.error('Database all error:', { sql, params, error: err });
          reject(err);
        } else {
          resolve(rows as T[]);
        }
      });
    });
  }

  public async transaction<T>(callback: () => Promise<T>): Promise<T> {
    await this.run('BEGIN TRANSACTION');
    try {
      const result = await callback();
      await this.run('COMMIT');
      return result;
    } catch (error) {
      await this.run('ROLLBACK');
      throw error;
    }
  }

  public close(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve();
        return;
      }

      this.db.close((err) => {
        if (err) {
          logger.error('Error closing database:', err);
          reject(err);
        } else {
          logger.info('Database connection closed');
          this.isConnected = false;
          resolve();
        }
      });
    });
  }

  public isReady(): boolean {
    return this.isConnected && this.db !== null;
  }
}

// 单例模式
export const databaseManager = new DatabaseManager();