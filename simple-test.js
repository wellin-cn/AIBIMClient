#!/usr/bin/env node

const { io } = require('socket.io-client');

console.log('🔍 测试Socket.IO连接...\n');

async function testConnection() {
  // 尝试不同的传输方式
  const transports = ['websocket', 'polling'];

  for (const transport of transports) {
    console.log(`🧪 测试传输方式: ${transport}`);
    
    const socket = io('http://localhost:3001', {
      auth: { username: 'tester' },
      transports: [transport],
      timeout: 5000,
      forceNew: true,
      upgrade: false
    });

    socket.on('connect', () => {
      console.log(`✅ ${transport} 连接成功! Socket ID:`, socket.id);
      
      // 测试简单的用户加入
      socket.emit('user:join', {
        username: 'tester',
        timestamp: new Date().toISOString()
      });
      
      setTimeout(() => socket.disconnect(), 1000);
    });

    socket.on('connect_error', (error) => {
      console.log(`❌ ${transport} 连接失败:`, error.message);
    });

    // 等待连接完成
    await new Promise(resolve => setTimeout(resolve, 6000));
  }

  console.log('\n🏁 测试完成');
  process.exit(0);
}

testConnection();