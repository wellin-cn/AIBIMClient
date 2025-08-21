/**
 * 简化测试：专门测试多用户连接问题
 */

const io = require('socket.io-client');

const SERVER_URL = 'http://localhost:3001';
console.log('🔍 简化测试：多用户连接问题');
console.log('===========================');

async function testMultipleUsers() {
  return new Promise((resolve, reject) => {
    const results = [];
    const clients = [];
    let completedTests = 0;
    const totalTests = 4;

    function cleanup() {
      clients.forEach(client => {
        if (client && client.connected) {
          client.disconnect();
        }
      });
    }

    function checkComplete() {
      completedTests++;
      if (completedTests >= totalTests) {
        cleanup();
        resolve(results);
      }
    }

    setTimeout(() => {
      cleanup();
      reject(new Error('测试超时'));
    }, 10000);

    // 测试1：第一个用户连接
    console.log('\n📍 测试1: 第一个用户连接');
    const client1 = io(SERVER_URL, { transports: ['websocket'] });
    clients.push(client1);

    client1.on('connect', () => {
      console.log('✅ client1 连接成功');
      client1.emit('user:join', { username: 'alice' });
    });

    client1.on('user:joined', (data) => {
      console.log(`✅ alice 加入成功，在线用户数: ${data.onlineUsers.length}`);
      results.push({ test: 'alice_join', success: true, onlineCount: data.onlineUsers.length });
      checkComplete();

      // 测试2：第二个不同用户连接
      setTimeout(() => {
        console.log('\n📍 测试2: 第二个不同用户连接');
        const client2 = io(SERVER_URL, { transports: ['websocket'] });
        clients.push(client2);

        client2.on('connect', () => {
          console.log('✅ client2 连接成功');
          client2.emit('user:join', { username: 'bob' });
        });

        client2.on('user:joined', (data) => {
          console.log(`✅ bob 加入成功，在线用户数: ${data.onlineUsers.length}`);
          results.push({ test: 'bob_join', success: true, onlineCount: data.onlineUsers.length });
          checkComplete();

          // 测试3：第三个不同用户连接
          setTimeout(() => {
            console.log('\n📍 测试3: 第三个不同用户连接');
            const client3 = io(SERVER_URL, { transports: ['websocket'] });
            clients.push(client3);

            client3.on('connect', () => {
              console.log('✅ client3 连接成功');
              client3.emit('user:join', { username: 'charlie' });
            });

            client3.on('user:joined', (data) => {
              console.log(`✅ charlie 加入成功，在线用户数: ${data.onlineUsers.length}`);
              results.push({ test: 'charlie_join', success: true, onlineCount: data.onlineUsers.length });
              checkComplete();
            });

            client3.on('error', (error) => {
              console.log(`❌ charlie 加入失败: ${error.message}`);
              results.push({ test: 'charlie_join', success: false, error: error.message });
              checkComplete();
            });
          }, 1000);
        });

        client2.on('error', (error) => {
          console.log(`❌ bob 加入失败: ${error.message}`);
          results.push({ test: 'bob_join', success: false, error: error.message });
          checkComplete();
        });
      }, 1000);
    });

    client1.on('error', (error) => {
      console.log(`❌ alice 加入失败: ${error.message}`);
      results.push({ test: 'alice_join', success: false, error: error.message });
      checkComplete();
    });

    // 测试4：重复用户名连接
    setTimeout(() => {
      console.log('\n📍 测试4: 重复用户名连接');
      const client4 = io(SERVER_URL, { transports: ['websocket'] });
      clients.push(client4);

      client4.on('connect', () => {
        console.log('✅ client4 连接成功');
        client4.emit('user:join', { username: 'alice' }); // 重复用户名
      });

      client4.on('user:joined', (data) => {
        console.log(`⚠️  意外：重复用户名 alice 也加入成功了！在线用户数: ${data.onlineUsers.length}`);
        results.push({ test: 'duplicate_alice', success: true, onlineCount: data.onlineUsers.length });
        checkComplete();
      });

      client4.on('error', (error) => {
        console.log(`✅ 预期的错误：重复用户名被拒绝: ${error.message}`);
        results.push({ test: 'duplicate_alice', success: false, error: error.message, expected: true });
        checkComplete();
      });
    }, 3000);
  });
}

async function testMessageBroadcast() {
  return new Promise((resolve, reject) => {
    console.log('\n📍 测试5: 消息广播');
    const clients = [];
    let messagesReceived = 0;

    function cleanup() {
      clients.forEach(client => {
        if (client && client.connected) {
          client.disconnect();
        }
      });
    }

    setTimeout(() => {
      cleanup();
      reject(new Error('消息测试超时'));
    }, 8000);

    // 创建发送者
    const sender = io(SERVER_URL, { transports: ['websocket'] });
    clients.push(sender);

    sender.on('connect', () => {
      sender.emit('user:join', { username: 'sender' });
    });

    sender.on('user:joined', () => {
      console.log('✅ sender 连接成功');

      // 创建接收者
      const receiver = io(SERVER_URL, { transports: ['websocket'] });
      clients.push(receiver);

      receiver.on('connect', () => {
        receiver.emit('user:join', { username: 'receiver' });
      });

      receiver.on('user:joined', () => {
        console.log('✅ receiver 连接成功');

        // 设置消息接收
        receiver.on('message:received', (data) => {
          console.log(`📨 receiver 收到消息: "${data.content}" 来自: ${data.sender.username}`);
          messagesReceived++;
          if (messagesReceived >= 1) {
            cleanup();
            resolve({ messagesReceived, success: true });
          }
        });

        // 发送测试消息
        setTimeout(() => {
          console.log('📤 sender 发送消息...');
          sender.emit('message:send', {
            type: 'text',
            content: '这是一条测试消息',
            timestamp: Date.now()
          });
        }, 1000);
      });

      receiver.on('error', (error) => {
        console.log(`❌ receiver 错误: ${error.message}`);
        cleanup();
        reject(error);
      });
    });

    sender.on('error', (error) => {
      console.log(`❌ sender 错误: ${error.message}`);
      cleanup();
      reject(error);
    });
  });
}

async function runTests() {
  try {
    console.log('开始多用户连接测试...\n');
    
    const multiUserResults = await testMultipleUsers();
    console.log('\n📊 多用户连接测试结果:');
    multiUserResults.forEach((result, index) => {
      const status = result.success ? '✅' : (result.expected ? '✅ (预期)' : '❌');
      console.log(`  ${index + 1}. ${result.test}: ${status}`);
      if (result.onlineCount !== undefined) {
        console.log(`     在线用户数: ${result.onlineCount}`);
      }
      if (result.error) {
        console.log(`     错误: ${result.error}`);
      }
    });

    const messageResult = await testMessageBroadcast();
    console.log('\n📊 消息广播测试结果:');
    console.log(`  ✅ 消息发送成功，接收到 ${messageResult.messagesReceived} 条消息`);

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }

  console.log('\n🎯 测试完成！');
  process.exit(0);
}

runTests();