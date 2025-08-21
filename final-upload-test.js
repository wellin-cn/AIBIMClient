#!/usr/bin/env node

const { io } = require('socket.io-client');

console.log('🎯 最终文件传输功能测试\n');

const socket = io('http://localhost:3001', {
  auth: { username: 'final-tester' },
  transports: ['websocket'],
  timeout: 10000,
  forceNew: true
});

let testResults = {
  connection: false,
  userJoin: false,
  fileUploadStart: false,
  fileUploadStarted: false,
  serverResponse: null,
  errors: []
};

socket.on('connect', () => {
  console.log('✅ Socket 连接成功! ID:', socket.id);
  testResults.connection = true;
  
  socket.emit('user:join', {
    username: 'final-tester',
    timestamp: new Date().toISOString()
  });
});

socket.on('user:joined', (data) => {
  console.log('✅ 用户加入成功! 在线用户:', data.onlineUsers?.length || 0);
  testResults.userJoin = true;
  
  setTimeout(() => {
    runFileUploadTest();
  }, 1000);
});

socket.on('file:upload:started', (data) => {
  console.log('✅ 服务器响应文件上传开始!');
  console.log('响应数据:', JSON.stringify(data, null, 2));
  testResults.fileUploadStarted = true;
  testResults.serverResponse = data;
  
  // 等待一下看是否有更多事件
  setTimeout(() => {
    generateTestReport();
    socket.disconnect();
    process.exit(0);
  }, 3000);
});

socket.on('file:upload:complete', (data) => {
  console.log('✅ 文件上传完成!');
  console.log('完成数据:', JSON.stringify(data, null, 2));
  testResults.uploadComplete = true;
  testResults.completeData = data;
});

socket.on('file:upload:error', (data) => {
  console.log('❌ 文件上传错误:', data);
  testResults.errors.push({ type: 'upload', data });
});

socket.on('connect_error', (error) => {
  console.error('❌ 连接失败:', error.message);
  testResults.errors.push({ type: 'connection', error: error.message });
  process.exit(1);
});

function runFileUploadTest() {
  console.log('\n📤 开始文件上传测试...');
  
  // 创建不同类型的测试文件
  const testFiles = [
    {
      name: 'text-file.txt',
      content: '这是一个文本文件测试\n包含中文字符\n测试时间: ' + new Date().toLocaleString(),
      mimeType: 'text/plain'
    }
  ];
  
  const testFile = testFiles[0];
  const fileData = Buffer.from(testFile.content, 'utf8').toString('base64');
  const tempId = `temp_${Date.now()}_final`;
  
  const uploadData = {
    fileName: testFile.name,
    fileSize: Buffer.byteLength(testFile.content, 'utf8'),
    mimeType: testFile.mimeType,
    tempId: tempId,
    fileData: fileData
  };
  
  console.log('📝 测试文件信息:');
  console.log('  - 文件名:', uploadData.fileName);
  console.log('  - 文件大小:', uploadData.fileSize, 'bytes');
  console.log('  - MIME类型:', uploadData.mimeType);
  console.log('  - 临时ID:', uploadData.tempId);
  console.log('  - Base64长度:', uploadData.fileData.length, 'characters');
  
  console.log('\n📡 发送文件上传请求...');
  socket.emit('file:upload:start', uploadData);
  testResults.fileUploadStart = true;
}

function generateTestReport() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 文件传输功能测试报告');
  console.log('='.repeat(60));
  
  console.log('\n🔍 测试结果:');
  console.log('  ✅ Socket连接:', testResults.connection ? '成功' : '失败');
  console.log('  ✅ 用户加入:', testResults.userJoin ? '成功' : '失败');
  console.log('  ✅ 文件上传请求发送:', testResults.fileUploadStart ? '成功' : '失败');
  console.log('  ✅ 服务器响应:', testResults.fileUploadStarted ? '成功' : '失败');
  console.log('  ✅ 上传完成事件:', testResults.uploadComplete ? '成功' : '未收到');
  
  if (testResults.serverResponse) {
    console.log('\n📋 服务器响应详情:');
    console.log('  - 临时ID:', testResults.serverResponse.tempId);
    console.log('  - 文件ID:', testResults.serverResponse.fileId);
    console.log('  - 分块大小:', testResults.serverResponse.chunkSize);
  }
  
  if (testResults.errors.length > 0) {
    console.log('\n❌ 发现的错误:');
    testResults.errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error.type}:`, error.data || error.error);
    });
  } else {
    console.log('\n✅ 未发现错误');
  }
  
  console.log('\n🎯 功能状态评估:');
  
  if (testResults.connection && testResults.userJoin && testResults.fileUploadStart && testResults.fileUploadStarted) {
    console.log('✅ 客户端文件传输功能: 基本可用');
    console.log('✅ 服务器文件接收: 正常工作');
    console.log('⚠️  服务器文件处理: 需要进一步验证');
    
    console.log('\n💡 建议:');
    console.log('  1. 服务器已成功接收文件上传请求');
    console.log('  2. 返回了文件ID和分块信息');
    console.log('  3. 可能需要进一步处理分块上传或等待处理完成');
    console.log('  4. 建议在浏览器中测试完整的用户界面');
  } else {
    console.log('❌ 文件传输功能: 存在问题');
    console.log('需要检查连接、认证或API兼容性');
  }
  
  console.log('\n📌 下一步测试建议:');
  console.log('  1. 打开浏览器访问: http://localhost:8080/manual-test.html');
  console.log('  2. 连接到服务器并测试文件上传界面');
  console.log('  3. 观察客户端状态和服务器响应');
  console.log('  4. 验证文件是否正确保存到服务器');
  
  console.log('\n' + '='.repeat(60));
  console.log('测试完成 - ' + new Date().toLocaleString());
  console.log('='.repeat(60));
}

// 超时退出
setTimeout(() => {
  console.log('\n⏰ 测试超时');
  generateTestReport();
  socket.disconnect();
  process.exit(1);
}, 15000);