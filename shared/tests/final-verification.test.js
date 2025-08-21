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

// 最终验证测试 - 验证用户同步问题是否已修复
async function finalVerificationTest() {
  console.log('🔍 最终验证测试：用户信息同步问题修复确认');
  console.log('=============================================');
  
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
      console.log(`   张三的用户信息:`, {
        id: data.user.id,
        username: data.user.username,
        socketId: data.user.socketId
      });
      
      // 保存张三的初始状态
      userStates.zhangsan = {
        userId: data.user.id,
        username: data.user.username,
        socketId: data.user.socketId
      };

      // 等待后让第二个用户登录
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
          console.log(`   李四的用户信息:`, {
            id: data.user.id,
            username: data.user.username,
            socketId: data.user.socketId
          });
          
          // 保存李四的状态
          userStates.lisi = {
            userId: data.user.id,
            username: data.user.username,
            socketId: data.user.socketId
          };

          // 等待一段时间后进行最终验证
          setTimeout(() => {
            console.log('\n📊 最终验证结果：');
            console.log('================');
            
            console.log('张三的信息:', userStates.zhangsan);
            console.log('李四的信息:', userStates.lisi);
            
            // 验证张三和李四的信息没有混淆
            const isValid = userStates.zhangsan.username === '张三' && 
                           userStates.lisi.username === '李四' &&
                           userStates.zhangsan.userId !== userStates.lisi.userId;
            
            if (isValid) {
              console.log('✅ 验证通过：用户信息没有混淆，各自保持独立！');
            } else {
              console.log('❌ 验证失败：用户信息仍然存在混淆！');
            }
            
            cleanup();
            resolve(isValid);
          }, 1000);
        });

        lisi.on('error', (error) => {
          console.log(`❌ 李四 错误: ${error.message}`);
          cleanup();
          reject(error);
        });
      }, 1000);
    });

    // 监听新成员加入事件（避免与个人加入事件混淆）
    zhangsan.on('user:new-member-joined', (data) => {
      console.log(`\n📢 张三收到新成员加入通知: ${data.newMember.username}`);
      console.log(`   新成员信息:`, {
        id: data.newMember.id,
        username: data.newMember.username,
        socketId: data.newMember.socketId
      });
      console.log(`   张三的信息保持不变:`, userStates.zhangsan);
      
      // 验证张三的信息没有被新成员的信息覆盖
      if (userStates.zhangsan && 
          userStates.zhangsan.username === '张三' && 
          userStates.zhangsan.userId !== data.newMember.id) {
        console.log('✅ 完美！张三的用户信息没有被新成员信息影响');
      } else {
        console.log('⚠️  警告：张三的用户信息可能受到影响');
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
finalVerificationTest()
  .then((success) => {
    if (success) {
      console.log('\n🎉 最终验证测试通过！用户信息同步问题已修复！');
    } else {
      console.log('\n❌ 最终验证测试失败！需要进一步调试。');
    }
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error(`❌ 测试失败: ${error.message}`);
    process.exit(1);
  });