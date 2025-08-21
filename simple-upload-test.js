#!/usr/bin/env node

const { io } = require('socket.io-client');

console.log('🧪 测试简单文件上传流程...\n');

const socket = io('http://localhost:3001', {
  auth: { username: 'simple-tester' },
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
    username: 'simple-tester',
    timestamp: new Date().toISOString()
  });
  
  setTimeout(() => {
    testCompleteFileUpload();
  }, 2000);
});

socket.on('file:upload:started', (data) => {
  console.log('🚀 文件上传已开始！');
  console.log('看起来服务器可能已经在处理文件了...');
  console.log('等待 file:upload:complete 或其他事件...');
});

socket.on('file:upload:complete', (data) => {
  console.log('✅ 文件上传完成！');
  console.log('完整响应数据:', JSON.stringify(data, null, 2));
  
  setTimeout(() => {
    console.log('\n🎯 测试完成，断开连接...');
    socket.disconnect();
    process.exit(0);
  }, 2000);
});

socket.on('file:upload:error', (data) => {
  console.error('❌ 文件上传失败:', data);
});

function testCompleteFileUpload() {
  console.log('\n📤 测试完整文件上传...');
  
  const testContent = `完整文件上传测试
创建时间: ${new Date().toLocaleString()}
用户: simple-tester

这是一个测试文件的内容。
包含多行文本。
用于验证文件上传功能。

文件结束。`;

  const fileName = `complete-test-${Date.now()}.txt`;
  const fileData = Buffer.from(testContent, 'utf8').toString('base64');
  const tempId = `temp_${Date.now()}_complete`;
  
  console.log('📝 创建测试文件:', fileName);
  console.log('📏 文件大小:', Buffer.byteLength(testContent, 'utf8'), 'bytes');
  console.log('📊 Base64大小:', fileData.length, 'characters');
  
  const uploadData = {
    fileName: fileName,
    fileSize: Buffer.byteLength(testContent, 'utf8'),
    mimeType: 'text/plain',
    tempId: tempId,
    fileData: fileData
  };
  
  console.log('📡 发送完整文件上传请求...');
  console.log('上传数据概要:');
  console.log('- 文件名:', uploadData.fileName);
  console.log('- 文件大小:', uploadData.fileSize);
  console.log('- MIME类型:', uploadData.mimeType);
  console.log('- 临时ID:', uploadData.tempId);
  console.log('- Base64数据前50字符:', uploadData.fileData.substring(0, 50) + '...');
  
  socket.emit('file:upload:start', uploadData);
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