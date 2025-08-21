-- IM聊天系统数据库表结构
-- SQLite数据库初始化脚本

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_seen DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 消息表
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK(type IN ('text', 'file', 'system')),
  content TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  file_path TEXT,
  file_name TEXT,
  file_size INTEGER,
  FOREIGN KEY (sender_id) REFERENCES users (id)
);

-- 在线用户表（会话管理）
CREATE TABLE IF NOT EXISTS online_users (
  socket_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_ping DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);

-- 创建索引以优化查询性能
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_online_users_user_id ON online_users(user_id);
CREATE INDEX IF NOT EXISTS idx_online_users_socket_id ON online_users(socket_id);

-- 插入系统用户（用于系统消息）
INSERT OR IGNORE INTO users (id, username, created_at, last_seen) 
VALUES ('system', 'SYSTEM', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);