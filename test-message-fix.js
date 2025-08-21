#!/usr/bin/env node

const { io } = require('socket.io-client');

console.log('🔧 测试修复后的消息API...\n');

const socket = io('http://localhost:3001', {
  auth: { username: 'message-tester' },
  transports: ['websocket'],
  timeout: 10000,
  forceNew: true
});

socket.onAny((eventName, ...args) => {
  console.log(`📩 收到事件: ${eventName}`, JSON.stringify(args, null, 2));
});

socket.on('connect', () => {
  console.log('✅ 连接成功! Socket ID:', socket.id);
  
  socket.emit('user:join', {
    username: 'message-tester',
    timestamp: new Date().toISOString()
  });
  
  setTimeout(() => {
    testMessage();
  }, 2000);
});

socket.on('user:joined', (data) => {
  console.log('✅ 用户加入成功!');
});

socket.on('message:received', (message) => {
  console.log('✅ 收到消息:', message.content);
});

socket.on('message:sent', (data) => {
  console.log('✅ 消息发送确认:', data.messageId);
});

function testMessage() {
  console.log('\n📤 测试消息发送...');
  
  const messageData = {
    content: '这是修复后的测试消息',
    timestamp: new Date().toISOString()
  };
  
  console.log('发送消息数据:', JSON.stringify(messageData, null, 2));
  
  socket.emit('message:send', messageData, (response) => {
    console.log('✅ 收到服务器响应:', JSON.stringify(response, null, 2));
    
    setTimeout(() => {
      console.log('\n🎯 测试完成，断开连接...');
      socket.disconnect();
      process.exit(0);
    }, 2000);
  });
}

socket.on('connect_error', (error) => {
  console.error('❌ 连接失败:', error.message);
  process.exit(1);
});

// 超时退出
setTimeout(() => {
  console.log('\n⏰ 测试超时，退出...');
  socket.disconnect();
  process.exit(1);
}, 15000);