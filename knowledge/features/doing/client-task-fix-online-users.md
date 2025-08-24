# 客户端任务：修复在线用户列表显示问题

## 📋 任务概述

**任务编号**: TASK-2025-001-CLIENT  
**任务名称**: 修复在线用户列表显示问题  
**优先级**: 高  
**预估工作量**: 1-2天  
**负责人**: 客户端研发  

## 🎯 问题描述

客户端登录后看不到其他在线用户，用户列表只显示当前用户一个。

## 🔍 根本原因分析

### 1. Socket事件监听不完整
- 可能缺少 `user:new-member-joined` 事件监听
- 可能缺少 `user:left` 事件监听
- 用户状态更新逻辑不完整

### 2. 状态管理问题
- `useChatStore` 中的用户状态管理可能有问题
- 在线用户集合 (`onlineUsers`) 更新逻辑不正确
- 用户列表过滤逻辑可能有问题

### 3. 组件渲染问题
- `UserList` 组件可能没有正确显示在线用户
- 用户状态指示器可能不工作
- 实时更新机制可能有问题

## 📝 具体修复任务

### 任务1：完善Socket事件监听
**文件**: `src/services/socketService.ts`  
**函数**: `setupSocketEventListeners`

**需要修改的内容**：
1. 确保监听 `user:new-member-joined` 事件
2. 确保监听 `user:left` 事件
3. 确保监听 `users:update` 事件
4. 完善事件处理逻辑

**预期结果**：
```typescript
// 在 setupSocketEventListeners 中添加：
socket.on('user:new-member-joined', (data) => {
  console.log('新用户加入:', data.newMember);
  // 更新在线用户列表
  updateOnlineUsers(data.onlineUsers);
  // 显示系统消息
  addSystemMessage(`${data.newMember.username} 加入了聊天室`);
});

socket.on('user:left', (data) => {
  console.log('用户离开:', data.user);
  // 更新在线用户列表
  updateOnlineUsers(data.onlineUsers);
  // 显示系统消息
  addSystemMessage(`${data.user.username} 离开了聊天室`);
});

socket.on('users:update', (data) => {
  console.log('用户列表更新:', data.onlineUsers);
  // 更新在线用户列表
  updateOnlineUsers(data.onlineUsers);
});
```

### 任务2：修复状态管理逻辑
**文件**: `src/store/chatStore.ts`  
**函数**: 用户状态管理相关函数

**需要修改的内容**：
1. 修复 `setUsers` 函数，确保正确设置用户列表
2. 修复 `addUser` 函数，确保正确添加新用户
3. 修复 `removeUser` 函数，确保正确移除用户
4. 修复 `updateUserStatus` 函数，确保正确更新用户状态

**预期结果**：
```typescript
// 修复后的 setUsers 函数应该：
setUsers: (users: User[]) => {
  set((state) => {
    // 确保用户列表正确设置
    const newUsers = users.map(user => ({
      ...user,
      isOnline: true // 从服务器获取的用户都是在线用户
    }));
    
    // 更新在线用户集合
    const newOnlineUsers = new Set(newUsers.map(u => u.id));
    
    return { 
      users: newUsers, 
      onlineUsers: newOnlineUsers 
    };
  });
},

// 修复后的 addUser 函数应该：
addUser: (user: User) => {
  set((state) => {
    const existingIndex = state.users.findIndex(u => u.id === user.id);
    let newUsers: User[];
    
    if (existingIndex >= 0) {
      // 更新现有用户
      newUsers = [...state.users];
      newUsers[existingIndex] = { ...user, isOnline: true };
    } else {
      // 添加新用户
      newUsers = [...state.users, { ...user, isOnline: true }];
    }
    
    // 更新在线用户集合
    const newOnlineUsers = new Set(state.onlineUsers);
    newOnlineUsers.add(user.id);
    
    return { users: newUsers, onlineUsers: newOnlineUsers };
  });
}
```

### 任务3：修复用户列表组件
**文件**: `src/components/chat/UserList.tsx`  
**组件**: `UserList`

**需要修改的内容**：
1. 确保正确显示在线用户
2. 修复用户状态指示器
3. 优化用户列表过滤逻辑
4. 添加调试信息

**预期结果**：
```typescript
// 修复后的用户过滤逻辑：
const filteredUsers = (users || []).filter(user => {
  // 排除当前用户
  if (user.id === currentUser?.id) return false;
  
  // 搜索过滤
  if (searchTerm && !user.name.toLowerCase().includes(searchTerm.toLowerCase())) {
    return false;
  }
  
  // 在线状态过滤 - 修复这里的逻辑
  if (!showOfflineUsers) {
    // 只显示在线用户
    return onlineUsers.has(user.id);
  }
  
  return true;
});

// 添加调试信息：
console.log('UserList Debug:', {
  totalUsers: users?.length || 0,
  onlineUsers: Array.from(onlineUsers),
  filteredUsers: filteredUsers.length,
  currentUser: currentUser?.id
});
```

### 任务4：完善用户状态同步
**文件**: `src/hooks/useChat.ts`  
**函数**: 用户状态相关函数

**需要修改的内容**：
1. 修复 `handleUserJoined` 函数
2. 修复 `handleUserLeft` 函数
3. 添加用户状态同步逻辑
4. 完善错误处理

**预期结果**：
```typescript
// 修复后的 handleUserJoined 函数：
const handleUserJoined = useCallback((data: any) => {
  console.log('处理用户加入:', data);
  
  // 设置当前用户
  if (data.user) {
    setCurrentUser(data.user);
  }
  
  // 设置在线用户列表
  if (data.onlineUsers) {
    setUsers(data.onlineUsers);
  }
  
  // 显示系统消息
  addSystemMessage('成功加入聊天室');
}, [setCurrentUser, setUsers, addSystemMessage]);

// 修复后的 handleUserLeft 函数：
const handleUserLeft = useCallback((data: any) => {
  console.log('处理用户离开:', data);
  
  if (data.user) {
    removeUser(data.user.id);
    addSystemMessage(`${data.user.username} 离开了聊天室`);
  }
  
  if (data.onlineUsers) {
    setUsers(data.onlineUsers);
  }
}, [removeUser, setUsers, addSystemMessage]);
```

## 🧪 测试验证

### 测试场景1：多用户连接
1. 启动客户端应用
2. 用户A登录
3. 用户B登录（另一个浏览器或标签页）
4. 验证用户A能看到用户B，用户B能看到用户A

### 测试场景2：用户离开
1. 两个用户同时在线
2. 用户A关闭浏览器或断开连接
3. 验证用户B收到用户A离开的通知

### 测试场景3：实时更新
1. 多个用户同时在线
2. 验证用户列表实时更新
3. 验证在线状态指示器正确显示

### 测试场景4：状态持久化
1. 用户登录后刷新页面
2. 验证用户状态正确恢复
3. 验证在线用户列表正确显示

## 📊 验收标准

### 功能验收
- [ ] 新用户加入时，其他在线用户能收到通知
- [ ] 用户离开时，其他用户能收到通知
- [ ] 在线用户列表显示所有当前在线用户
- [ ] 用户状态指示器正确显示在线/离线状态

### 性能验收
- [ ] 用户列表更新响应时间 < 200ms
- [ ] 内存使用合理，无内存泄漏
- [ ] 组件渲染性能良好

### 稳定性验收
- [ ] 网络断开重连后用户状态正确
- [ ] 页面刷新后状态正确恢复
- [ ] 异常情况下界面稳定

## 🔗 相关文件

- `src/services/socketService.ts` - Socket事件监听
- `src/store/chatStore.ts` - 状态管理
- `src/components/chat/UserList.tsx` - 用户列表组件
- `src/hooks/useChat.ts` - 聊天相关逻辑
- `src/types/index.ts` - 类型定义

## 📝 注意事项

1. **事件监听**：确保所有必要的Socket事件都被正确监听
2. **状态同步**：确保客户端状态与服务器状态保持同步
3. **性能优化**：避免不必要的重新渲染
4. **错误处理**：添加适当的错误处理和用户提示

## 🎯 预期效果

修复完成后，客户端应该能够：
- 看到所有当前在线的用户
- 实时收到新用户加入的通知
- 实时收到用户离开的通知
- 显示正确的在线用户数量和状态
- 用户列表实时更新，无需刷新页面

## 🔧 调试建议

1. **添加调试日志**：在关键位置添加 `console.log` 来跟踪数据流
2. **使用浏览器开发工具**：检查网络请求和WebSocket连接
3. **状态检查**：使用Redux DevTools或类似工具检查状态变化
4. **组件检查**：使用React DevTools检查组件渲染

---

**创建时间**: 2025-01-XX  
**创建人**: 技术总监  
**状态**: 待分配
