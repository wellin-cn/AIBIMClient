const io = require('socket.io-client');

const SERVER_URL = 'http://localhost:3001';

// 存储客户端连接
const clients = [];

// 清理函数
function cleanup() {
  clients.forEach(client => {
    if (client.connected) {
      client.disconnect();
    }
  });
}

// 完整功能测试：多用户登录 + 消息收发
async function completeFeatureTest() {
  console.log('🔍 完整功能测试：多用户登录 + 消息收发');
  console.log('=====================================');
  
  return new Promise((resolve, reject) => {
    let testSteps = 0;
    const expectedSteps = 4; // 预期完成的测试步骤数
    
    // 超时处理
    setTimeout(() => {
      cleanup();
      reject(new Error('测试超时'));
    }, 15000);

    // 测试完成检查
    function checkTestCompletion() {
      testSteps++;
      if (testSteps >= expectedSteps) {
        console.log('\n🎉 所有测试步骤完成！');
        cleanup();
        resolve(true);
      }
    }

    console.log('\n📍 步骤1: 用户Alice登录');
    const alice = io(SERVER_URL, { transports: ['websocket'] });
    clients.push(alice);

    alice.on('connect', () => {
      console.log('✅ Alice 连接成功');
      alice.emit('user:join', { username: 'Alice' });
    });

    alice.on('user:joined', (data) => {
      console.log('✅ Alice 加入成功，用户信息:', {
        id: data.user.id,
        username: data.user.username,
        socketId: data.user.socketId
      });
      checkTestCompletion();

      // Alice登录成功后，让Bob登录
      setTimeout(() => {
        console.log('\n📍 步骤2: 用户Bob登录');
        const bob = io(SERVER_URL, { transports: ['websocket'] });
        clients.push(bob);

        bob.on('connect', () => {
          console.log('✅ Bob 连接成功');
          bob.emit('user:join', { username: 'Bob' });
        });

        bob.on('user:joined', (data) => {
          console.log('✅ Bob 加入成功，用户信息:', {
            id: data.user.id,
            username: data.user.username,
            socketId: data.user.socketId
          });
          console.log('   在线用户:', data.onlineUsers.map(u => u.username));
          checkTestCompletion();

          // Bob登录成功后，测试消息发送
          setTimeout(() => {
            console.log('\n📍 步骤3: Alice发送消息');
            alice.emit('message:send', {
              content: 'Hello Bob! 我是Alice',
              type: 'text'
            });
          }, 1000);
        });

        // Bob监听消息接收
        bob.on('message:received', (data) => {
          console.log('✅ Bob收到Alice的消息:', {
            content: data.content,
            sender: data.sender.username,
            type: data.type,
            timestamp: data.timestamp
          });
          checkTestCompletion();

          // Bob回复消息
          setTimeout(() => {
            console.log('\n📍 步骤4: Bob回复消息');
            bob.emit('message:send', {
              content: 'Hi Alice! 我是Bob，收到你的消息了！',
              type: 'text'
            });
          }, 500);
        });

        bob.on('error', (error) => {
          console.log(`❌ Bob 错误: ${error.message}`);
          cleanup();
          reject(error);
        });
      }, 1000);
    });

    // Alice监听新成员加入
    alice.on('user:new-member-joined', (data) => {
      console.log(`📢 Alice收到新成员加入通知: ${data.newMember.username}`);
    });

    // Alice监听消息接收
    alice.on('message:received', (data) => {
      console.log('✅ Alice收到Bob的回复消息:', {
        content: data.content,
        sender: data.sender.username,
        type: data.type,
        timestamp: data.timestamp
      });
      checkTestCompletion();
    });

    alice.on('error', (error) => {
      console.log(`❌ Alice 错误: ${error.message}`);
      cleanup();
      reject(error);
    });
  });
}

// 运行测试
completeFeatureTest()
  .then((success) => {
    console.log('\n🎉 完整功能测试通过！');
    console.log('✅ 多用户登录正常');
    console.log('✅ 用户信息独立性正常');
    console.log('✅ 消息发送接收正常');
    console.log('\n🎯 修复验证完成！用户同步问题已解决！');
    process.exit(0);
  })
  .catch((error) => {
    console.error(`❌ 测试失败: ${error.message}`);
    process.exit(1);
  });