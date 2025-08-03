/**
 * Socket.io event type definitions
 */
import { UserJoinData, UserJoinedData, UserJoinErrorData, UserLeaveData, UserLeftData, UsersUpdateData, TypingData, TypingUpdateData } from './user';
import { MessageSendData, MessageReceivedData, MessageSentData, MessageSendErrorData } from './message';
export interface SocketConfig {
    transports: ('websocket' | 'polling')[];
    timeout: number;
    autoConnect: boolean;
    reconnection: boolean;
    reconnectionDelay: number;
    reconnectionAttempts: number;
    reconnectionDelayMax: number;
    forceNew?: boolean;
}
export interface ClientToServerEvents {
    'user:join': (data: UserJoinData) => void;
    'user:leave': (data?: UserLeaveData) => void;
    'message:send': (data: MessageSendData) => void;
    'typing:start': (data: TypingData) => void;
    'typing:stop': (data: TypingData) => void;
    'ping': () => void;
}
export interface ServerToClientEvents {
    'connect': () => void;
    'disconnect': (reason: string) => void;
    'connect_error': (error: Error) => void;
    'reconnect': (attemptNumber: number) => void;
    'reconnect_attempt': (attemptNumber: number) => void;
    'reconnect_error': (error: Error) => void;
    'reconnect_failed': () => void;
    'user:joined': (data: UserJoinedData) => void;
    'user:join:error': (data: UserJoinErrorData) => void;
    'user:left': (data: UserLeftData) => void;
    'users:update': (data: UsersUpdateData) => void;
    'message:received': (data: MessageReceivedData) => void;
    'message:sent': (data: MessageSentData) => void;
    'message:send:error': (data: MessageSendErrorData) => void;
    'typing:update': (data: TypingUpdateData) => void;
    'system:notification': (data: SystemNotificationData) => void;
    'system:maintenance': (data: MaintenanceNotificationData) => void;
    'server:stats': (data: ServerStatsData) => void;
    'pong': () => void;
}
export interface InterServerEvents {
    'user:broadcast': (data: any) => void;
    'message:broadcast': (data: any) => void;
}
export interface SocketData {
    userId?: string;
    username?: string;
    joinedAt?: number;
    lastActivity?: number;
    ipAddress?: string;
    userAgent?: string;
}
export interface SystemNotificationData {
    type: 'info' | 'warning' | 'error' | 'success';
    title?: string;
    message: string;
    timestamp: number;
    persistent?: boolean;
    actionRequired?: boolean;
    autoClose?: number;
}
export interface MaintenanceNotificationData {
    type: 'scheduled' | 'emergency';
    message: string;
    startTime: number;
    estimatedDuration: number;
    affectedFeatures?: string[];
}
export interface ServerStatsData {
    timestamp: number;
    connections: {
        total: number;
        active: number;
        peak: number;
    };
    messages: {
        total: number;
        perSecond: number;
        perMinute: number;
    };
    uptime: number;
    version: string;
    memoryUsage: {
        used: number;
        total: number;
        percentage: number;
    };
}
export interface SocketEvent<T = any> {
    type: string;
    data: T;
    timestamp: number;
    sender?: {
        id: string;
        username: string;
    };
    metadata?: {
        version: string;
        source: 'client' | 'server';
        requestId?: string;
    };
}
export interface SocketErrorData {
    code: string;
    message: string;
    details?: any;
    timestamp: number;
    eventType?: string;
    recoverable: boolean;
}
export interface ConnectionState {
    status: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';
    connectedAt?: number;
    disconnectedAt?: number;
    reconnectAttempts: number;
    lastError?: SocketErrorData;
    latency?: number;
}
export interface SocketMiddlewareData {
    timestamp: number;
    eventType: string;
    userId?: string;
    ipAddress: string;
    userAgent: string;
    data?: any;
}
export interface RateLimitData {
    userId: string;
    eventType: string;
    count: number;
    windowStart: number;
    windowSize: number;
    limit: number;
    resetTime: number;
}
export interface SocketRoomData {
    roomId: string;
    roomName: string;
    memberCount: number;
    createdAt: number;
    lastActivity: number;
}
//# sourceMappingURL=socket.d.ts.map