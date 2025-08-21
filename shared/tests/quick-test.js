/**
 * 快速测试脚本：验证多用户连接问题
 * 用于复现和验证用户反映的问题
 */

const io = require('socket.io-client');

console.log('🔍 快速测试：多用户连接问题验证');
console.log('========================================');

const SERVER_URL = 'http://localhost:3001';
const clients = [];

// 清理函数
function cleanup() {
  console.log('\n🧹 清理连接...');
  clients.forEach(client => {
    if (client && client.connected) {
      client.disconnect();
    }
  });
  process.exit(0);
}

// 设置清理
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

async function runTest() {
  console.log(`📡 连接到服务器: ${SERVER_URL}`);
  
  try {
    // 测试场景1：单用户连接
    console.log('\n📍 测试1: 单用户连接');
    const client1 = io(SERVER_URL, { transports: ['websocket'] });
    clients.push(client1);
    
    client1.on('connect', () => {
      console.log('✅ 客户端1连接成功');
      client1.emit('user:join', { username: 'testuser' });
    });
    
    client1.on('user:joined', (data) => {
      console.log(`✅ 用户加入成功: ${data.user.username}`);
      console.log(`   在线用户数: ${data.onlineUsers.length}`);
      
      // 等待2秒后测试第二个连接
      setTimeout(testSecondConnection, 2000);
    });
    
    client1.on('error', (error) => {
      console.log(`❌ 客户端1错误: ${error.message} (${error.code})`);
    });
    
    // 测试场景2：同用户名的第二个连接
    function testSecondConnection() {
      console.log('\n📍 测试2: 同用户名的第二个连接');
      const client2 = io(SERVER_URL, { transports: ['websocket'] });
      clients.push(client2);
      
      client2.on('connect', () => {
        console.log('✅ 客户端2连接成功');
        client2.emit('user:join', { username: 'testuser' }); // 相同用户名
      });
      
      client2.on('user:joined', (data) => {
        console.log(`⚠️  意外：客户端2也成功加入了！`);
        console.log(`   用户: ${data.user.username}`);
        console.log(`   在线用户数: ${data.onlineUsers.length}`);
        
        // 检查客户端1的状态
        setTimeout(checkClient1Status, 1000);
      });
      
      client2.on('error', (error) => {
        console.log(`✅ 预期的错误: ${error.message} (${error.code})`);
        
        // 测试场景3：强制替换连接
        setTimeout(testForceReplace, 1000);
      });
      
      client2.on('force_disconnect', (data) => {
        console.log(`📡 客户端2收到强制断开: ${data.reason}`);
      });
    }
    
    // 检查客户端1状态
    function checkClient1Status() {
      console.log('\n📍 测试3: 检查客户端1状态');
      
      if (client1.connected) {
        console.log('✅ 客户端1仍然连接');
        
        // 发送消息测试
        client1.emit('message:send', {
          type: 'text',
          content: '测试消息从客户端1',
          timestamp: Date.now()
        });
      } else {
        console.log('❌ 客户端1已断开连接（这可能是问题所在）');
      }
      
      // 测试强制替换
      setTimeout(testForceReplace, 2000);
    }
    
    // 测试强制替换
    function testForceReplace() {
      console.log('\n📍 测试4: 强制替换连接');
      const client3 = io(SERVER_URL, { transports: ['websocket'] });
      clients.push(client3);
      
      client3.on('connect', () => {
        console.log('✅ 客户端3连接成功');
        client3.emit('user:join', { 
          username: 'testuser',
          forceReplace: true // 如果支持的话
        });
      });
      
      client3.on('user:joined', (data) => {
        console.log(`✅ 客户端3强制替换成功`);
        console.log(`   用户: ${data.user.username}`);
        console.log(`   在线用户数: ${data.onlineUsers.length}`);
        
        // 完成测试
        setTimeout(() => {
          console.log('\n🎯 测试完成！');
          console.log('\n📊 测试结果总结:');
          console.log('1. 检查是否允许了重复用户名连接');
          console.log('2. 检查旧连接是否被正确处理');
          console.log('3. 检查用户状态同步是否正确');
          
          cleanup();
        }, 2000);
      });
      
      client3.on('error', (error) => {
        console.log(`❌ 客户端3错误: ${error.message} (${error.code})`);
        setTimeout(cleanup, 1000);
      });
    }
    
    // 监听消息广播
    clients.forEach((client, index) => {
      client.on('message:received', (data) => {
        console.log(`📨 客户端${index + 1}收到消息: ${data.content} (来自: ${data.sender.username})`);
      });
      
      client.on('user:left', (data) => {
        console.log(`👋 客户端${index + 1}收到用户离开: ${data.user.username}`);
      });
      
      client.on('user:joined', (data) => {
        if (data.user.username !== 'testuser' || index === 0) return; // 避免重复日志
        console.log(`👋 客户端${index + 1}收到用户加入: ${data.user.username}`);
      });
    });
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
    cleanup();
  }
}

// 等待服务器启动
console.log('⏳ 等待服务器启动...');
setTimeout(runTest, 1000);