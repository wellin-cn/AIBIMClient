#!/usr/bin/env node

const { io } = require('socket.io-client');

console.log('🔍 调试分块格式...\n');

const socket = io('http://localhost:3001', {
  auth: { username: 'format-tester' },
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
    username: 'format-tester',
    timestamp: new Date().toISOString()
  });
  
  setTimeout(() => {
    testSimpleUpload();
  }, 2000);
});

socket.on('file:upload:started', (data) => {
  console.log('🚀 文件上传已开始，尝试不同的分块格式...');
  
  const testChunks = [
    {
      name: '格式1: 字符串分块',
      data: {
        tempId: data.tempId,
        chunkIndex: 0,
        chunk: 'dGVzdCBkYXRh', // "test data" in base64
        isLastChunk: true
      }
    },
    {
      name: '格式2: Buffer分块',
      data: {
        tempId: data.tempId,
        chunkIndex: 0,
        chunkData: 'dGVzdCBkYXRh',
        isLastChunk: true
      }
    },
    {
      name: '格式3: 完整格式',
      data: {
        tempId: data.tempId,
        fileId: data.fileId,
        chunkIndex: 0,
        chunkSize: data.chunkSize,
        chunk: 'dGVzdCBkYXRh',
        totalChunks: 1,
        isLastChunk: true
      }
    }
  ];
  
  // 依次尝试不同格式
  let currentIndex = 0;
  
  function tryNextFormat() {
    if (currentIndex < testChunks.length) {
      const test = testChunks[currentIndex];
      console.log(`\n📤 尝试 ${test.name}:`);
      console.log('数据:', JSON.stringify(test.data, null, 2));
      
      socket.emit('file:upload:chunk', test.data);
      currentIndex++;
      
      setTimeout(tryNextFormat, 2000);
    } else {
      console.log('\n🏁 所有格式测试完成');
      setTimeout(() => {
        socket.disconnect();
        process.exit(0);
      }, 1000);
    }
  }
  
  tryNextFormat();
});

function testSimpleUpload() {
  console.log('\n📤 开始测试简单文件上传...');
  
  const testContent = 'test data';
  const fileName = 'format-test.txt';
  const fileData = Buffer.from(testContent, 'utf8').toString('base64');
  const tempId = `temp_${Date.now()}_format`;
  
  const uploadData = {
    fileName: fileName,
    fileSize: testContent.length,
    mimeType: 'text/plain',
    tempId: tempId,
    fileData: fileData
  };
  
  console.log('📡 发送文件上传开始请求...');
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
}, 20000);