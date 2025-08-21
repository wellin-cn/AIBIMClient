#!/usr/bin/env node

const { io } = require('socket.io-client');

console.log('🔍 调试文件传输API...\n');

const socket = io('http://localhost:3001', {
  auth: { username: 'debug-tester' },
  transports: ['websocket'],
  timeout: 10000,
  forceNew: true
});

// 监听所有可能的事件
socket.onAny((eventName, ...args) => {
  console.log(`📩 收到事件: ${eventName}`, args);
});

socket.on('connect', () => {
  console.log('✅ 连接成功! Socket ID:', socket.id);
  
  // 发送用户加入
  socket.emit('user:join', {
    username: 'debug-tester',
    timestamp: new Date().toISOString()
  });
  
  // 先测试普通消息
  setTimeout(() => {
    console.log('\n📤 测试普通消息发送...');
    socket.emit('message:send', {
      content: '这是一条测试消息',
      timestamp: new Date().toISOString()
    });
  }, 2000);
  
  // 再测试文件上传
  setTimeout(() => {
    console.log('\n📤 测试文件上传事件...');
    
    const testData = {
      fileName: 'debug-test.txt',
      fileSize: 50,
      mimeType: 'text/plain',
      tempId: 'debug-temp-id',
      fileData: Buffer.from('这是调试测试文件内容').toString('base64')
    };
    
    console.log('发送文件上传数据:', JSON.stringify(testData, null, 2));
    socket.emit('file:upload:start', testData);
    
    // 也尝试其他可能的事件名
    setTimeout(() => {
      console.log('\n🔄 尝试其他可能的事件名...');
      socket.emit('fileUpload', testData);
      socket.emit('upload:start', testData);
      socket.emit('file-upload', testData);
    }, 1000);
    
  }, 4000);
});

socket.on('connect_error', (error) => {
  console.error('❌ 连接失败:', error.message);
  process.exit(1);
});

socket.on('disconnect', (reason) => {
  console.log('🔌 连接断开:', reason);
});

// 监听所有可能的文件相关事件
const fileEvents = [
  'file:upload:progress',
  'file:upload:complete', 
  'file:upload:error',
  'fileUploadProgress',
  'fileUploadComplete',
  'fileUploadError',
  'upload:progress',
  'upload:complete',
  'upload:error'
];

fileEvents.forEach(event => {
  socket.on(event, (data) => {
    console.log(`✅ 收到文件事件 ${event}:`, data);
  });
});

// 超时退出
setTimeout(() => {
  console.log('\n⏰ 调试超时，退出...');
  socket.disconnect();
  process.exit(0);
}, 15000);