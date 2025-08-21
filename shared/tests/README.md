# 测试目录说明

本目录包含所有与服务端功能测试相关的文件。

## 测试文件说明

### 核心功能测试

#### `complete-feature.test.js`
**完整功能测试**
- 测试多用户登录功能
- 测试消息发送和接收功能  
- 验证用户信息独立性
- 综合功能验证

#### `multi-user-connection.test.js`
**多用户连接测试（Mocha框架）**
- 使用Mocha/Chai测试框架
- 测试多用户同时连接场景
- 测试用户名冲突处理
- 测试消息发送接收流程

### 用户同步问题专项测试

#### `user-sync-issue.test.js`
**用户信息同步问题测试**
- 专门针对用户信息同步bug的测试
- 详细验证用户信息是否会被其他用户覆盖
- 包含完整的测试流程和验证逻辑

#### `debug-user-sync.test.js`
**用户同步调试测试**
- 详细调试用户信息同步问题
- 输出详细的用户状态信息
- 帮助定位具体的同步问题

#### `final-verification.test.js`
**最终验证测试**
- 验证用户同步问题修复效果
- 确认修复后各用户信息保持独立
- 使用新的事件机制验证

### 快速测试

#### `quick-test.js`
**快速测试**
- 简单的用户连接测试
- 验证基本的用户名冲突检测
- 快速验证服务器基本功能

#### `simple-test.js`
**简单测试**
- 测试多用户连接基本场景
- 观察用户连接和断开事件
- 简化的功能验证

## 测试工具

#### `test-runner.js`
**测试运行器**
- 用于运行Mocha测试框架的测试
- 处理测试依赖和环境配置

## 文档

#### `fix-multiple-connection-issue.md`
**多连接问题修复文档**
- 记录了用户信息同步问题的分析和修复过程
- 包含问题描述、根因分析和解决方案

## 运行测试

### 运行单个测试
```bash
# 运行完整功能测试
node tests/complete-feature.test.js

# 运行最终验证测试
node tests/final-verification.test.js

# 运行用户同步问题测试
node tests/user-sync-issue.test.js
```

### 运行Mocha测试
```bash
# 使用测试运行器
node tests/test-runner.js

# 或直接运行
npx mocha tests/multi-user-connection.test.js
```

## 测试前准备

1. 确保服务器正在运行：
   ```bash
   npx ts-node src/server.ts
   ```

2. 确保端口3001可用

3. 安装必要的依赖：
   ```bash
   npm install socket.io-client
   ```

## 注意事项

- 所有测试都需要服务器运行在localhost:3001
- 测试会自动连接和断开Socket.io连接
- 某些测试可能需要清理数据库状态
- 建议在独立的测试环境中运行

## 测试修复验证流程

要验证用户信息同步问题是否修复，推荐按以下顺序运行：

1. `final-verification.test.js` - 验证核心修复
2. `complete-feature.test.js` - 验证完整功能
3. `user-sync-issue.test.js` - 验证原问题不再复现

如果所有测试都通过，说明用户信息同步问题已经成功修复。