/**
 * 专门测试用户信息同步问题
 * 验证：新客户端登录后，老客户端用户信息是否被同步
 */

const io = require('socket.io-client');

const SERVER_URL = 'http://localhost:3001';
console.log('🔍 用户信息同步问题测试');
console.log('=======================');

async function testUserInfoSync() {
  return new Promise((resolve, reject) => {
    const clients = [];
    const userStates = {};

    function cleanup() {
      clients.forEach(client => {
        if (client && client.connected) {
          client.disconnect();
        }
      });
    }

    setTimeout(() => {
      cleanup();
      reject(new Error('测试超时'));
    }, 15000);

    console.log('\n📍 步骤1: 第一个用户（张三）登录');
    const zhangsan = io(SERVER_URL, { transports: ['websocket'] });
    clients.push(zhangsan);

    zhangsan.on('connect', () => {
      console.log('✅ 张三 连接成功');
      zhangsan.emit('user:join', { username: '张三' });
    });

    zhangsan.on('user:joined', (data) => {
      console.log(`✅ 张三 加入成功`);
      console.log(`   张三看到的用户信息:`, data.user);
      console.log(`   张三看到的在线用户:`, data.onlineUsers.map(u => u.username));
      
      userStates.zhangsan_initial = {
        userId: data.user.id,
        username: data.user.username,
        socketId: data.user.socketId,
        onlineUsers: data.onlineUsers.map(u => u.username)
      };

      // 等待一段时间，然后让第二个用户登录
      setTimeout(() => {
        console.log('\n📍 步骤2: 第二个用户（李四）登录');
        const lisi = io(SERVER_URL, { transports: ['websocket'] });
        clients.push(lisi);

        lisi.on('connect', () => {
          console.log('✅ 李四 连接成功');
          lisi.emit('user:join', { username: '李四' });
        });

        lisi.on('user:joined', (data) => {
          console.log(`✅ 李四 加入成功`);
          console.log(`   李四看到的用户信息:`, data.user);
          console.log(`   李四看到的在线用户:`, data.onlineUsers.map(u => u.username));
          
          userStates.lisi_initial = {
            userId: data.user.id,
            username: data.user.username,
            socketId: data.user.socketId,
            onlineUsers: data.onlineUsers.map(u => u.username)
          };

          // 检查张三是否收到了用户列表更新
          setTimeout(() => {
            console.log('\n📍 步骤3: 尝试让第三个用户（王五）登录');
            const wangwu = io(SERVER_URL, { transports: ['websocket'] });
            clients.push(wangwu);

            wangwu.on('connect', () => {
              console.log('✅ 王五 连接成功');
              wangwu.emit('user:join', { username: '王五' });
            });

            wangwu.on('user:joined', (data) => {
              console.log(`✅ 王五 加入成功`);
              console.log(`   王五看到的用户信息:`, data.user);
              console.log(`   王五看到的在线用户:`, data.onlineUsers.map(u => u.username));
              
              userStates.wangwu_initial = {
                userId: data.user.id,
                username: data.user.username,
                socketId: data.user.socketId,
                onlineUsers: data.onlineUsers.map(u => u.username)
              };

              // 分析结果
              setTimeout(() => {
                console.log('\n📊 分析结果:');
                console.log('=============');
                
                console.log('\n1. 张三的状态:');
                console.log('   初始状态:', userStates.zhangsan_initial);
                if (userStates.zhangsan_updated) {
                  console.log('   更新后状态:', userStates.zhangsan_updated);
                  console.log('   ⚠️  张三的用户信息发生了变化！');
                } else {
                  console.log('   ✅ 张三的用户信息保持不变');
                }

                console.log('\n2. 李四的状态:');
                console.log('   初始状态:', userStates.lisi_initial);
                if (userStates.lisi_updated) {
                  console.log('   更新后状态:', userStates.lisi_updated);
                  console.log('   ⚠️  李四的用户信息发生了变化！');
                } else {
                  console.log('   ✅ 李四的用户信息保持不变');
                }

                cleanup();
                resolve(userStates);
              }, 2000);
            });

            wangwu.on('error', (error) => {
              console.log(`❌ 王五 加入失败: ${error.message}`);
              setTimeout(() => {
                cleanup();
                resolve(userStates);
              }, 1000);
            });
          }, 2000);
        });

        lisi.on('error', (error) => {
          console.log(`❌ 李四 加入失败: ${error.message}`);
          cleanup();
          reject(error);
        });
      }, 2000);
    });

    // 监听张三的用户信息更新事件
    zhangsan.on('user:joined', (data) => {
      // 忽略自己的加入事件
      if (data.user.username === '张三' && !userStates.zhangsan_initial) return;
      
      console.log(`📡 张三收到新用户加入: ${data.user.username}`);
      console.log(`   张三现在看到的在线用户:`, data.onlineUsers.map(u => u.username));
      
      // 检查张三的用户信息是否发生变化
      if (userStates.zhangsan_initial) {
        const currentUser = data.onlineUsers.find(u => u.username === '张三');
        if (currentUser) {
          console.log(`   张三的当前用户信息:`, {
            userId: currentUser.id,
            username: currentUser.username,
            socketId: currentUser.socketId
          });
          
          // 检查是否有变化
          if (currentUser.socketId !== userStates.zhangsan_initial.socketId ||
              currentUser.id !== userStates.zhangsan_initial.userId) {
            console.log(`⚠️  警告：张三的用户信息发生了变化！`);
            userStates.zhangsan_updated = {
              userId: currentUser.id,
              username: currentUser.username,
              socketId: currentUser.socketId,
              onlineUsers: data.onlineUsers.map(u => u.username)
            };
          }
        }
      }
    });

    // 监听李四的用户信息更新事件
    zhangsan.on('users:update', (data) => {
      console.log(`📡 张三收到用户列表更新:`, data.onlineUsers.map(u => u.username));
    });

    zhangsan.on('error', (error) => {
      console.log(`❌ 张三 错误: ${error.message}`);
      cleanup();
      reject(error);
    });
  });
}

async function testMessageReceiving() {
  return new Promise((resolve, reject) => {
    console.log('\n📍 步骤4: 测试消息接收');
    const clients = [];

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
    }, 10000);

    const sender = io(SERVER_URL, { transports: ['websocket'] });
    const receiver = io(SERVER_URL, { transports: ['websocket'] });
    clients.push(sender, receiver);

    let senderReady = false;
    let receiverReady = false;

    function checkBothReady() {
      if (senderReady && receiverReady) {
        setTimeout(() => {
          console.log('📤 发送测试消息...');
          sender.emit('message:send', {
            type: 'text',
            content: '测试消息：检查用户身份',
            timestamp: Date.now()
          });
        }, 1000);
      }
    }

    sender.on('connect', () => {
      sender.emit('user:join', { username: '发送者A' });
    });

    sender.on('user:joined', () => {
      console.log('✅ 发送者A 准备就绪');
      senderReady = true;
      checkBothReady();
    });

    receiver.on('connect', () => {
      receiver.emit('user:join', { username: '接收者B' });
    });

    receiver.on('user:joined', () => {
      console.log('✅ 接收者B 准备就绪');
      receiverReady = true;
      checkBothReady();
    });

    receiver.on('message:received', (data) => {
      console.log(`📨 接收者B 收到消息: "${data.content}"`);
      console.log(`   消息来源显示: ${data.sender.username} (ID: ${data.sender.id})`);
      
      cleanup();
      resolve({
        messageContent: data.content,
        senderUsername: data.sender.username,
        senderId: data.sender.id
      });
    });

    sender.on('error', (error) => {
      console.log(`❌ 发送者A 错误: ${error.message}`);
      cleanup();
      reject(error);
    });

    receiver.on('error', (error) => {
      console.log(`❌ 接收者B 错误: ${error.message}`);
      cleanup();
      reject(error);
    });
  });
}

async function runFullTest() {
  try {
    console.log('🚀 开始完整的用户信息同步测试...\n');
    
    const syncResults = await testUserInfoSync();
    console.log('\n✅ 用户信息同步测试完成');
    
    const messageResults = await testMessageReceiving();
    console.log('\n✅ 消息测试完成');
    
    console.log('\n🎯 测试总结:');
    console.log('===========');
    console.log('如果出现用户信息同步问题，您应该会在上面的日志中看到警告信息。');
    console.log('正常情况下，每个用户的ID和Socket ID应该保持不变。');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }

  console.log('\n🎯 测试完成！');
  process.exit(0);
}

runFullTest();