#!/usr/bin/env node

const { io } = require('socket.io-client');

console.log('🧪 测试分块文件上传...\n');

const socket = io('http://localhost:3001', {
  auth: { username: 'chunk-tester' },
  transports: ['websocket'],
  timeout: 10000,
  forceNew: true
});

let currentUpload = null;

// 监听所有事件
socket.onAny((eventName, ...args) => {
  console.log(`📩 收到事件: ${eventName}`, JSON.stringify(args, null, 2));
});

socket.on('connect', () => {
  console.log('✅ 连接成功! Socket ID:', socket.id);
  
  socket.emit('user:join', {
    username: 'chunk-tester',
    timestamp: new Date().toISOString()
  });
  
  setTimeout(() => {
    testChunkedUpload();
  }, 2000);
});

// 文件上传开始响应
socket.on('file:upload:started', (data) => {
  console.log('🚀 文件上传已开始，开始发送分块...');
  currentUpload = { ...currentUpload, ...data };
  sendFileChunks();
});

// 文件分块接收确认
socket.on('file:chunk:received', (data) => {
  console.log(`📦 分块 ${data.chunkIndex + 1} 已接收`);
  
  if (data.chunkIndex + 1 < currentUpload.totalChunks) {
    // 继续发送下一个分块
    sendNextChunk(data.chunkIndex + 1);
  }
});

// 文件上传完成
socket.on('file:upload:complete', (data) => {
  console.log('✅ 文件上传完成！');
  console.log('文件信息:', JSON.stringify(data, null, 2));
  
  setTimeout(() => {
    console.log('\n🎯 测试完成，断开连接...');
    socket.disconnect();
    process.exit(0);
  }, 2000);
});

// 文件上传错误
socket.on('file:upload:error', (data) => {
  console.error('❌ 文件上传失败:', data);
  process.exit(1);
});

function testChunkedUpload() {
  console.log('\n📤 开始测试分块文件上传...');
  
  // 创建一个较大的测试文件
  const testContent = `这是一个测试文件 - 分块上传测试
创建时间: ${new Date().toLocaleString()}
用户: chunk-tester

${'这是填充内容，用于测试分块上传功能。'.repeat(100)}

文件结束。`;

  const fileName = `chunked-test-${Date.now()}.txt`;
  const fileData = Buffer.from(testContent, 'utf8').toString('base64');
  const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
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
  
  console.log('📡 发送文件上传开始请求...');
  socket.emit('file:upload:start', uploadData);
  
  // 保存上传数据以便后续分块发送
  currentUpload = {
    ...uploadData,
    fileDataBuffer: fileData
  };
}

function sendFileChunks() {
  if (!currentUpload) return;
  
  const chunkSize = currentUpload.chunkSize || 65536; // 64KB default
  const fileData = currentUpload.fileDataBuffer;
  const totalChunks = Math.ceil(fileData.length / chunkSize);
  
  currentUpload.totalChunks = totalChunks;
  
  console.log(`📦 准备发送 ${totalChunks} 个分块，每个分块大小: ${chunkSize} 字符`);
  
  // 发送第一个分块
  sendNextChunk(0);
}

function sendNextChunk(chunkIndex) {
  if (!currentUpload) return;
  
  const chunkSize = currentUpload.chunkSize || 65536;
  const fileData = currentUpload.fileDataBuffer;
  const start = chunkIndex * chunkSize;
  const end = Math.min(start + chunkSize, fileData.length);
  const chunk = fileData.slice(start, end);
  
  console.log(`📤 发送分块 ${chunkIndex + 1}/${currentUpload.totalChunks} (${chunk.length} 字符)`);
  
  socket.emit('file:upload:chunk', {
    tempId: currentUpload.tempId,
    chunkIndex: chunkIndex,
    chunk: chunk,
    isLastChunk: chunkIndex + 1 === currentUpload.totalChunks
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
}, 30000);