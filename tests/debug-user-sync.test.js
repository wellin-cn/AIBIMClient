const io = require('socket.io-client');

const SERVER_URL = 'http://localhost:3001';

// 存储客户端连接
const clients = [];
const userStates = {};

// 清理函数
function cleanup() {
  clients.forEach(client => {
    if (client.connected) {
      client.disconnect();
    }
  });
}

// 调试用户信息同步问题
async function debugUserSyncIssue() {
  console.log('🔍 调试用户信息同步问题');
  console.log('========================');
  
  return new Promise((resolve, reject) => {
    // 超时处理
    setTimeout(() => {
      cleanup();
      reject(new Error('测试超时'));
    }, 10000);

    console.log('\n📍 第一个用户（张三）登录');
    const zhangsan = io(SERVER_URL, { transports: ['websocket'] });
    clients.push(zhangsan);

    zhangsan.on('connect', () => {
      console.log('✅ 张三 连接成功');
      zhangsan.emit('user:join', { username: '张三' });
    });

    zhangsan.on('user:joined', (data) => {
      console.log(`✅ 张三 加入成功`);
      console.log(`   张三的初始用户信息:`, data.user);
      console.log(`   张三的初始在线用户:`, data.onlineUsers);
      
      // 保存张三的初始状态 - 详细记录
      userStates.zhangsan_initial = {
        userId: data.user.id,
        username: data.user.username,
        socketId: data.user.socketId,
        从onlineUsers中找到的自己: data.onlineUsers.find(u => u.username === '张三')
      };
      
      console.log('\n📊 张三初始状态详细信息:');
      console.log('   user.id:', data.user.id);
      console.log('   user.socketId:', data.user.socketId);
      console.log('   onlineUsers中自己的信息:', JSON.stringify(data.onlineUsers.find(u => u.username === '张三'), null, 2));
      
      // 等待一段时间，然后让第二个用户登录
      setTimeout(() => {
        console.log('\n📍 第二个用户（李四）登录');
        const lisi = io(SERVER_URL, { transports: ['websocket'] });
        clients.push(lisi);

        lisi.on('connect', () => {
          console.log('✅ 李四 连接成功');
          lisi.emit('user:join', { username: '李四' });
        });

        lisi.on('user:joined', (data) => {
          console.log(`✅ 李四 加入成功`);
          console.log(`   李四的用户信息:`, data.user);
          
          setTimeout(() => {
            cleanup();
            resolve();
          }, 1000);
        });

        lisi.on('error', (error) => {
          console.log(`❌ 李四 加入失败: ${error.message}`);
          cleanup();
          reject(error);
        });
      }, 1000);
    });

    // 监听张三收到的user:joined事件（其他用户加入时）
    zhangsan.on('user:joined', (data) => {
      // 忽略自己的加入事件
      if (data.user.username === '张三' && !userStates.zhangsan_initial) return;
      
      console.log(`\n📡 张三收到新用户加入: ${data.user.username}`);
      console.log(`   新加入用户信息:`, data.user);
      console.log(`   更新后的在线用户列表:`, data.onlineUsers);
      
      // 检查张三的用户信息是否发生变化
      if (userStates.zhangsan_initial) {
        const currentZhangsan = data.onlineUsers.find(u => u.username === '张三');
        console.log('\n🔍 详细比较张三的信息:');
        console.log('   张三初始 userId:', userStates.zhangsan_initial.userId);
        console.log('   张三初始 socketId:', userStates.zhangsan_initial.socketId);
        console.log('   张三当前 id:', currentZhangsan?.id);
        console.log('   张三当前 socketId:', currentZhangsan?.socketId);
        console.log('   ID比较结果:', currentZhangsan?.id === userStates.zhangsan_initial.userId ? '✅ 相等' : '❌ 不相等');
        console.log('   SocketId比较结果:', currentZhangsan?.socketId === userStates.zhangsan_initial.socketId ? '✅ 相等' : '❌ 不相等');
        
        if (currentZhangsan?.id !== userStates.zhangsan_initial.userId ||
            currentZhangsan?.socketId !== userStates.zhangsan_initial.socketId) {
          console.log('\n⚠️  警告：张三的用户信息确实发生了变化！');
        } else {
          console.log('\n✅ 张三的用户信息保持一致');
        }
      }
    });

    zhangsan.on('error', (error) => {
      console.log(`❌ 张三 错误: ${error.message}`);
      cleanup();
      reject(error);
    });
  });
}

// 运行测试
debugUserSyncIssue()
  .then(() => {
    console.log('\n🎯 调试完成！');
    process.exit(0);
  })
  .catch((error) => {
    console.error(`❌ 调试失败: ${error.message}`);
    process.exit(1);
  });