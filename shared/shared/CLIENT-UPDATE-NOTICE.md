# 🚨 客户端开发者必读：紧急API更新通知

## ⚡ 立即行动

**当前状态**: 🔴 需要客户端更新  
**影响范围**: 所有 Socket.io 客户端  
**完成期限**: 建议 2025-01-XX 之前  

---

## 🎯 快速更新（2分钟）

### 1. 添加新事件监听（必须）
```javascript
socket.on('user:new-member-joined', (data) => {
  console.log(`${data.newMember.username} 加入聊天室`);
  updateOnlineUsers(data.onlineUsers);
});
```

### 2. 修改现有事件（必须）
```javascript
socket.on('user:joined', (data) => {
  // 只处理自己的登录，不处理其他用户加入
  if (data.user.username === myUsername) {
    console.log('我登录成功');
    initializeUI(data);
  }
});
```

### 3. 验证修复
- 测试多用户同时登录
- 确认用户信息不会混淆

---

## 📋 详细信息

| 文档 | 用途 | 时间 |
|------|------|------|
| [📝 API变更详情](./API-CHANGES.md) | 了解具体变更 | 5-10分钟 |
| [🔧 完整迁移指南](./MIGRATION-GUIDE.md) | 详细迁移步骤 | 15-30分钟 |
| [📄 技术规范](./docs/socket-events.md) | 事件定义文档 | 参考用 |

---

## ❓ 需要帮助？

- **遇到问题**: 查看 [问题排查指南](./MIGRATION-GUIDE.md#-常见问题排查)
- **技术支持**: 联系开发团队
- **测试工具**: 使用提供的测试代码模板

---

**⏰ 不要拖延，现在就开始更新！用户体验取决于您的及时行动。**