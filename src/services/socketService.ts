import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { UserModel } from '../models/User';
import { OnlineUserModel } from '../models/OnlineUser';
import { MessageModel } from '../models/Message';
import { SocketEvents } from '../types';
import { validateSocketData, schemas } from '../middleware/validation';
import { checkMessageRateLimit } from '../middleware/security';
import config from '../config';
import logger from '../utils/logger';

export class SocketService {
  private io: SocketIOServer;

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: config.CORS_ORIGIN,
        methods: ['GET', 'POST'],
        credentials: true,
      },
      pingTimeout: config.SOCKET_PING_TIMEOUT,
      pingInterval: config.SOCKET_PING_INTERVAL,
    });

    this.setupEventHandlers();
    logger.info('Socket.io server initialized');
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      logger.info(`New socket connection: ${socket.id}`);

      // 用户加入事件
      socket.on('user:join', async (data) => {
        try {
          await this.handleUserJoin(socket, data);
        } catch (error) {
          logger.error('Error handling user join:', error);
          socket.emit('error', { message: 'Failed to join chat' });
        }
      });

      // 消息发送事件
      socket.on('message:send', async (data) => {
        try {
          await this.handleMessageSend(socket, data);
        } catch (error) {
          logger.error('Error handling message send:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // 用户断开连接
      socket.on('disconnect', async () => {
        try {
          await this.handleUserDisconnect(socket);
        } catch (error) {
          logger.error('Error handling user disconnect:', error);
        }
      });

      // 心跳更新
      socket.on('ping', async () => {
        try {
          await OnlineUserModel.updatePing(socket.id);
          socket.emit('pong');
        } catch (error) {
          logger.error('Error updating ping:', error);
        }
      });
    });
  }

  private async handleUserJoin(socket: Socket, data: any): Promise<void> {
    // 验证输入数据
    const validatedData = validateSocketData<{ username: string }>(schemas.userJoin, data);
    const { username } = validatedData;

    logger.info(`User attempting to join: ${username} (${socket.id})`);

    // 检查用户名是否已在线
    const existingOnlineUser = await OnlineUserModel.findByUsername(username);
    if (existingOnlineUser) {
      socket.emit('error', { 
        message: 'Username already taken',
        code: 'USERNAME_EXISTS' 
      });
      return;
    }

    // 检查在线用户数量限制
    const onlineCount = await OnlineUserModel.getCount();
    if (onlineCount >= config.MAX_ONLINE_USERS) {
      socket.emit('error', {
        message: 'Chat room is full',
        code: 'ROOM_FULL'
      });
      return;
    }

    // 查找或创建用户
    let user = await UserModel.findByUsername(username);
    if (!user) {
      user = await UserModel.create(username);
      // 发送系统欢迎消息
      await MessageModel.createSystemMessage(`欢迎 ${username} 加入聊天！`);
    } else {
      // 更新最后在线时间
      await UserModel.updateLastSeen(user.id);
      // 发送系统回归消息
      await MessageModel.createSystemMessage(`${username} 重新加入了聊天`);
    }

    // 添加到在线用户列表
    const onlineUser = await OnlineUserModel.add(socket.id, user.id, username);

    // 让用户加入默认房间
    socket.join('chat');

    // 获取更新后的在线用户列表
    const onlineUsers = await OnlineUserModel.getAll();

    // 通知用户加入成功 - 按照shared/types/user.ts的UserJoinedData格式
    const userJoinedResponse = {
      user: {
        id: user.id,
        username: user.username,
        socketId: socket.id,
        joinedAt: Date.now(),
        status: 'online' as const,
        ipAddress: socket.handshake.address
      },
      onlineUsers: onlineUsers.map(ou => ({
        id: ou.userId,
        username: ou.username,
        socketId: ou.socketId,
        joinedAt: Date.now(),
        status: 'online' as const,
        ipAddress: socket.handshake.address
      })),
      serverInfo: {
        version: process.env.npm_package_version || '1.0.0',
        maxUsers: config.MAX_ONLINE_USERS,
        currentUsers: onlineUsers.length
      }
    };

    socket.emit('user:joined', userJoinedResponse);

    // 广播给其他用户 - 使用专门的新成员加入事件，避免与个人加入事件混淆
    const newOnlineUser = onlineUsers.find(ou => ou.userId === user?.id);
    if (newOnlineUser && user) {
      socket.to('chat').emit('user:new-member-joined', {
        newMember: {
          id: newOnlineUser.userId,
          username: newOnlineUser.username,
          socketId: newOnlineUser.socketId,
          joinedAt: newOnlineUser.joinedAt.getTime(),
          status: 'online' as const,
          ipAddress: socket.handshake.address
        },
        onlineUsers: onlineUsers.map(ou => ({
          id: ou.userId,
          username: ou.username,
          socketId: ou.socketId,
          joinedAt: ou.joinedAt.getTime(),
          status: 'online' as const
        }))
      });
    }

    // 广播在线用户列表更新
    this.io.to('chat').emit('users:update', { onlineUsers });

    logger.info(`User ${username} joined successfully (${socket.id})`);
  }

  private async handleMessageSend(socket: Socket, data: any): Promise<void> {
    try {
      // 记录接收到的原始数据
      logger.info(`Received message data from ${socket.id}:`, data);

      // 验证输入数据
      const validatedData = validateSocketData<{ type: 'text' | 'file'; content: string; tempId?: string }>(schemas.messageSend, data);
      const { type, content, tempId } = validatedData;

      // 获取发送者信息
      const onlineUser = await OnlineUserModel.findBySocketId(socket.id);
      if (!onlineUser) {
        socket.emit('message:send:error', { 
          tempId: tempId || '',
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        });
        return;
      }

      // 检查消息发送频率限制
      if (!checkMessageRateLimit(onlineUser.userId, 10, 60000)) {
        socket.emit('message:send:error', { 
          tempId: tempId || '',
          code: 'RATE_LIMIT',
          message: 'Message rate limit exceeded'
        });
        return;
      }

      logger.info(`Message from ${onlineUser.username}: ${type}`, {
        userId: onlineUser.userId,
        type,
        contentLength: content.length,
        tempId
      });

      // 创建消息
      const message = await MessageModel.create({
        type,
        content,
        senderId: onlineUser.userId,
      });

      // 构造包含完整发送者信息的消息对象
      const messageWithSender = {
        id: message.id,
        type: message.type,
        content: message.content,
        sender: {
          id: onlineUser.userId,
          username: onlineUser.username
        },
        timestamp: message.timestamp.getTime(), // 转换为数字时间戳
        filePath: message.filePath,
        fileName: message.fileName,
        fileSize: message.fileSize,
      };

      // 先向发送者确认消息发送成功
      socket.emit('message:sent', {
        tempId: tempId || '',
        messageId: message.id,
        timestamp: message.timestamp.getTime(),
        status: 'success'
      });

      // 然后广播消息给所有在线用户（包括发送者）
      this.io.to('chat').emit('message:received', messageWithSender);

      logger.info(`Message sent and broadcast completed: ${message.id}`);
    } catch (error) {
      logger.error('Error in handleMessageSend:', error);
      
      // 发送错误响应给发送者
      socket.emit('message:send:error', {
        tempId: data?.tempId || '',
        code: 'SEND_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error
      });
    }
  }

  private async handleUserDisconnect(socket: Socket): Promise<void> {
    logger.info(`Socket disconnecting: ${socket.id}`);

    // 获取用户信息
    const onlineUser = await OnlineUserModel.findBySocketId(socket.id);
    if (!onlineUser) {
      return;
    }

    // 从在线用户列表移除
    await OnlineUserModel.remove(socket.id);

    // 更新用户最后在线时间
    await UserModel.updateLastSeen(onlineUser.userId);

    // 发送系统离开消息
    await MessageModel.createSystemMessage(`${onlineUser.username} 离开了聊天`);

    // 获取更新后的在线用户列表
    const onlineUsers = await OnlineUserModel.getAll();

    // 广播用户离开事件
    socket.to('chat').emit('user:left', {
      user: { id: onlineUser.userId, username: onlineUser.username },
      onlineUsers,
    });

    // 广播在线用户列表更新
    socket.to('chat').emit('users:update', { onlineUsers });

    logger.info(`User ${onlineUser.username} disconnected (${socket.id})`);
  }

  // 获取在线用户数量
  public async getOnlineCount(): Promise<number> {
    return await OnlineUserModel.getCount();
  }

  // 向所有用户广播系统消息
  public async broadcastSystemMessage(content: string): Promise<void> {
    const message = await MessageModel.createSystemMessage(content);
    this.io.to('chat').emit('message:received', message);
    logger.info(`System message broadcast: ${content}`);
  }

  // 获取Socket.io实例
  public getIO(): SocketIOServer {
    return this.io;
  }
}