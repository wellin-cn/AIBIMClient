/**
 * User-related type definitions
 */
import { BaseEntity, UserStatus } from './index';
export interface User extends BaseEntity {
    username: string;
    lastSeen: number;
}
export interface UserInfo {
    id: string;
    username: string;
}
export interface OnlineUser extends User {
    socketId: string;
    joinedAt: number;
    status: UserStatus;
    ipAddress?: string;
}
export interface CreateUserData {
    username: string;
}
export interface UpdateUserData {
    username?: string;
    lastSeen?: number;
    status?: UserStatus;
}
export interface UserQuery {
    status?: UserStatus;
    search?: string;
    limit?: number;
    includeOffline?: boolean;
}
export interface UserJoinData {
    username: string;
    version?: string;
    clientInfo?: {
        platform: string;
        userAgent: string;
    };
}
export interface UserJoinedData {
    user: OnlineUser;
    onlineUsers: OnlineUser[];
    serverInfo: {
        version: string;
        maxUsers: number;
        currentUsers: number;
    };
}
export interface UserJoinErrorData {
    code: string;
    message: string;
    details?: {
        suggestions?: string[];
        retryAfter?: number;
    };
}
export interface UserLeaveData {
    reason?: 'user_quit' | 'network_error' | 'server_shutdown' | 'kicked';
    message?: string;
}
export interface UserLeftData {
    user: UserInfo;
    reason?: string;
    onlineUsers: OnlineUser[];
    timestamp: number;
}
export interface UsersUpdateData {
    type: 'user_joined' | 'user_left' | 'user_status_changed';
    user: UserInfo;
    onlineUsers: OnlineUser[];
    onlineCount: number;
    timestamp: number;
}
export interface UserStats {
    totalUsers: number;
    onlineUsers: number;
    peakOnlineUsers: number;
    averageSessionDuration: number;
}
export interface UserPreferences {
    theme: 'light' | 'dark' | 'auto';
    fontSize: 'small' | 'medium' | 'large';
    notifications: {
        sound: boolean;
        desktop: boolean;
        mentions: boolean;
    };
    privacy: {
        showOnlineStatus: boolean;
        showLastSeen: boolean;
    };
}
export interface UserSession {
    userId: string;
    socketId: string;
    ipAddress: string;
    userAgent: string;
    connectedAt: number;
    lastActivity: number;
}
//# sourceMappingURL=user.d.ts.map