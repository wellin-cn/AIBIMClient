/**
 * 多用户连接测试用例
 * 测试多个用户登录、发消息、收消息的流程
 */

const io = require('socket.io-client');
const { expect } = require('chai');

describe('多用户连接测试', function() {
  this.timeout(10000);
  
  const SERVER_URL = 'http://localhost:3001';
  let clients = [];
  
  // 清理函数
  const cleanup = () => {
    clients.forEach(client => {
      if (client && client.connected) {
        client.disconnect();
      }
    });
    clients = [];
  };
  
  beforeEach(function() {
    cleanup();
  });
  
  afterEach(function() {
    cleanup();
  });

  describe('基础连接测试', function() {
    
    it('应该允许单个用户正常连接', function(done) {
      const client = io(SERVER_URL, { 
        transports: ['websocket'],
        autoConnect: false 
      });
      clients.push(client);
      
      client.on('connect', () => {
        client.emit('user:join', { username: 'testuser1' });
      });
      
      client.on('user:joined', (data) => {
        expect(data.user.username).to.equal('testuser1');
        expect(data.onlineUsers).to.have.length(1);
        done();
      });
      
      client.on('error', (error) => {
        done(new Error(`连接失败: ${error.message}`));
      });
      
      client.connect();
    });

    it('应该允许多个不同用户同时连接', function(done) {
      const usernames = ['alice', 'bob', 'charlie'];
      const connectedUsers = [];
      
      usernames.forEach((username, index) => {
        const client = io(SERVER_URL, { 
          transports: ['websocket'],
          autoConnect: false 
        });
        clients.push(client);
        
        client.on('connect', () => {
          client.emit('user:join', { username });
        });
        
        client.on('user:joined', (data) => {
          connectedUsers.push(data.user.username);
          
          // 当所有用户都连接完成时
          if (connectedUsers.length === usernames.length) {
            expect(connectedUsers).to.include.members(usernames);
            done();
          }
        });
        
        client.on('error', (error) => {
          done(new Error(`用户 ${username} 连接失败: ${error.message}`));
        });
        
        // 延时连接避免竞态条件
        setTimeout(() => client.connect(), index * 100);
      });
    });

    it('应该阻止相同用户名的重复连接', function(done) {
      const client1 = io(SERVER_URL, { 
        transports: ['websocket'],
        autoConnect: false 
      });
      const client2 = io(SERVER_URL, { 
        transports: ['websocket'],
        autoConnect: false 
      });
      clients.push(client1, client2);
      
      let firstUserJoined = false;
      
      // 第一个客户端连接
      client1.on('connect', () => {
        client1.emit('user:join', { username: 'duplicate_user' });
      });
      
      client1.on('user:joined', (data) => {
        expect(data.user.username).to.equal('duplicate_user');
        firstUserJoined = true;
        
        // 第二个客户端尝试使用相同用户名
        client2.connect();
      });
      
      // 第二个客户端连接
      client2.on('connect', () => {
        client2.emit('user:join', { username: 'duplicate_user' });
      });
      
      client2.on('error', (error) => {
        expect(firstUserJoined).to.be.true;
        expect(error.code).to.equal('USERNAME_EXISTS');
        expect(error.message).to.equal('Username already taken');
        done();
      });
      
      client2.on('user:joined', () => {
        done(new Error('不应该允许重复用户名连接'));
      });
      
      client1.connect();
    });
  });

  describe('消息发送与接收测试', function() {
    
    it('应该正确广播消息给所有在线用户', function(done) {
      const sender = io(SERVER_URL, { transports: ['websocket'], autoConnect: false });
      const receiver1 = io(SERVER_URL, { transports: ['websocket'], autoConnect: false });
      const receiver2 = io(SERVER_URL, { transports: ['websocket'], autoConnect: false });
      clients.push(sender, receiver1, receiver2);
      
      const testMessage = '这是一条测试消息';
      const receivedMessages = [];
      let usersConnected = 0;
      
      const checkAllConnected = () => {
        usersConnected++;
        if (usersConnected === 3) {
          // 所有用户连接完成，发送消息
          sender.emit('message:send', {
            type: 'text',
            content: testMessage,
            timestamp: Date.now()
          });
        }
      };
      
      // 设置消息接收处理
      [receiver1, receiver2].forEach((client, index) => {
        client.on('message:received', (data) => {
          receivedMessages.push({
            receiver: index + 1,
            message: data.content,
            sender: data.sender.username
          });
          
          // 当两个接收者都收到消息时
          if (receivedMessages.length === 2) {
            expect(receivedMessages.every(m => m.message === testMessage)).to.be.true;
            expect(receivedMessages.every(m => m.sender === 'sender')).to.be.true;
            done();
          }
        });
      });
      
      // 连接所有用户
      sender.on('connect', () => sender.emit('user:join', { username: 'sender' }));
      sender.on('user:joined', checkAllConnected);
      
      receiver1.on('connect', () => receiver1.emit('user:join', { username: 'receiver1' }));
      receiver1.on('user:joined', checkAllConnected);
      
      receiver2.on('connect', () => receiver2.emit('user:join', { username: 'receiver2' }));
      receiver2.on('user:joined', checkAllConnected);
      
      sender.connect();
      setTimeout(() => receiver1.connect(), 100);
      setTimeout(() => receiver2.connect(), 200);
    });

    it('应该正确处理用户断开连接', function(done) {
      const client1 = io(SERVER_URL, { transports: ['websocket'], autoConnect: false });
      const client2 = io(SERVER_URL, { transports: ['websocket'], autoConnect: false });
      clients.push(client1, client2);
      
      let usersConnected = 0;
      
      const checkConnection = () => {
        usersConnected++;
        if (usersConnected === 2) {
          // 两个用户都连接后，断开第一个用户
          client1.disconnect();
        }
      };
      
      client2.on('user:left', (data) => {
        expect(data.user.username).to.equal('user1');
        expect(data.onlineUsers).to.have.length(1);
        expect(data.onlineUsers[0].username).to.equal('user2');
        done();
      });
      
      client1.on('connect', () => client1.emit('user:join', { username: 'user1' }));
      client1.on('user:joined', checkConnection);
      
      client2.on('connect', () => client2.emit('user:join', { username: 'user2' }));
      client2.on('user:joined', checkConnection);
      
      client1.connect();
      setTimeout(() => client2.connect(), 100);
    });
  });

  describe('并发连接压力测试', function() {
    
    it('应该处理多个用户快速连接和断开', function(done) {
      this.timeout(15000);
      
      const userCount = 10;
      const users = [];
      let connectedCount = 0;
      let disconnectedCount = 0;
      
      for (let i = 0; i < userCount; i++) {
        const client = io(SERVER_URL, { 
          transports: ['websocket'],
          autoConnect: false 
        });
        users.push(client);
        clients.push(client);
        
        client.on('connect', () => {
          client.emit('user:join', { username: `user${i}` });
        });
        
        client.on('user:joined', () => {
          connectedCount++;
          
          // 随机延迟后断开连接
          setTimeout(() => {
            client.disconnect();
          }, Math.random() * 1000 + 500);
        });
        
        client.on('disconnect', () => {
          disconnectedCount++;
          
          if (disconnectedCount === userCount) {
            expect(connectedCount).to.equal(userCount);
            done();
          }
        });
        
        // 随机延迟连接
        setTimeout(() => client.connect(), Math.random() * 500);
      }
    });
  });

  describe('边界情况测试', function() {
    
    it('应该处理无效的用户名', function(done) {
      const client = io(SERVER_URL, { 
        transports: ['websocket'],
        autoConnect: false 
      });
      clients.push(client);
      
      client.on('connect', () => {
        client.emit('user:join', { username: '' }); // 空用户名
      });
      
      client.on('error', (error) => {
        expect(error.message).to.include('validation');
        done();
      });
      
      client.on('user:joined', () => {
        done(new Error('不应该允许空用户名'));
      });
      
      client.connect();
    });

    it('应该处理过长的消息', function(done) {
      const client = io(SERVER_URL, { 
        transports: ['websocket'],
        autoConnect: false 
      });
      clients.push(client);
      
      client.on('connect', () => {
        client.emit('user:join', { username: 'tester' });
      });
      
      client.on('user:joined', () => {
        // 发送过长的消息（超过1000字符）
        const longMessage = 'a'.repeat(1001);
        client.emit('message:send', {
          type: 'text',
          content: longMessage,
          timestamp: Date.now()
        });
      });
      
      client.on('error', (error) => {
        expect(error.message).to.include('too long');
        done();
      });
      
      client.connect();
    });
  });
});