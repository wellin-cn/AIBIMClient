#!/usr/bin/env node

const { io } = require('socket.io-client');
const fs = require('fs');
const path = require('path');

console.log('🧪 开始测试文件传输API...\n');

// 连接到服务器
const socket = io('http://localhost:3001', {
  auth: { username: 'test-file-uploader' },
  transports: ['websocket', 'polling'],
  timeout: 20000,
  forceNew: true,
  upgrade: false
});

// 连接事件
socket.on('connect', () => {
  console.log('✅ 连接成功! Socket ID:', socket.id);
  console.log('📡 发送用户加入事件...');
  
  socket.emit('user:join', {
    username: 'test-file-uploader',
    timestamp: new Date().toISOString()
  });
  
  // 延迟一下再测试文件上传
  setTimeout(() => {
    testFileUpload();
  }, 2000);
});

socket.on('connect_error', (error) => {
  console.error('❌ 连接失败:', error.message);
  process.exit(1);
});

socket.on('disconnect', (reason) => {
  console.log('🔌 连接断开:', reason);
});

// 用户加入成功
socket.on('user:joined', (data) => {
  console.log('🎉 用户加入成功! 在线用户数:', data.onlineUsers?.length || 0);
});

// 文件上传进度
socket.on('file:upload:progress', (data) => {
  console.log(`📊 文件上传进度: ${data.percentage}% (${data.bytesUploaded}/${data.totalBytes} bytes)`);
});

// 文件上传完成
socket.on('file:upload:complete', (data) => {
  console.log('✅ 文件上传完成!');
  console.log('   文件ID:', data.fileId);
  console.log('   文件URL:', data.fileUrl);
  console.log('   消息:', JSON.stringify(data.message, null, 2));
  
  // 测试完成，断开连接
  setTimeout(() => {
    console.log('\n🎯 测试完成，断开连接...');
    socket.disconnect();
    process.exit(0);
  }, 2000);
});

// 文件上传错误
socket.on('file:upload:error', (data) => {
  console.error('❌ 文件上传失败:');
  console.error('   错误代码:', data.code);
  console.error('   错误消息:', data.message);
  console.error('   临时ID:', data.tempId);
  
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

// 接收到消息
socket.on('message', (message) => {
  console.log('📥 收到消息:', JSON.stringify(message, null, 2));
});

// 测试文件上传函数
function testFileUpload() {
  console.log('\n📤 开始测试文件上传...');
  
  // 创建一个测试文件
  const testContent = `这是一个测试文件
创建时间: ${new Date().toLocaleString()}
用户: test-file-uploader
内容: 这是用于测试文件传输API的示例文件。
包含中文字符测试。
`;

  const testFileName = `test-file-${Date.now()}.txt`;
  console.log('📝 创建测试文件:', testFileName);
  
  // 将内容转换为Base64
  const base64Data = Buffer.from(testContent, 'utf8').toString('base64');
  console.log('🔄 文件内容已转换为Base64, 大小:', base64Data.length, 'characters');
  
  const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const uploadData = {
    fileName: testFileName,
    fileSize: Buffer.byteLength(testContent, 'utf8'),
    mimeType: 'text/plain',
    tempId: tempId,
    fileData: base64Data
  };
  
  console.log('📡 发送文件上传请求...');
  console.log('   文件名:', uploadData.fileName);
  console.log('   文件大小:', uploadData.fileSize, 'bytes');
  console.log('   MIME类型:', uploadData.mimeType);
  console.log('   临时ID:', uploadData.tempId);
  
  socket.emit('file:upload:start', uploadData);
}

// 处理程序退出
process.on('SIGINT', () => {
  console.log('\n\n👋 程序被中断，断开连接...');
  socket.disconnect();
  process.exit(0);
});

// 设置超时
setTimeout(() => {
  console.log('\n⏰ 测试超时，自动退出...');
  socket.disconnect();
  process.exit(1);
}, 30000); // 30秒超时