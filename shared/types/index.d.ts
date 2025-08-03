/**
 * Shared Type Definitions for IM Chat System
 *
 * This file exports all TypeScript type definitions used across
 * both server and client applications.
 *
 * @version 1.0.0
 * @author IM Chat Team
 */
export * from './user';
export * from './message';
export * from './socket';
export * from './api';
export interface BaseEntity {
    id: string;
    createdAt: number;
    updatedAt?: number;
}
export interface Timestamps {
    createdAt: number;
    updatedAt: number;
}
export interface PaginationParams {
    limit?: number;
    before?: number;
    after?: number;
    page?: number;
}
export interface PaginationResult<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        hasMore: boolean;
        hasPrevious: boolean;
    };
}
export declare enum ConnectionStatus {
    DISCONNECTED = "disconnected",
    CONNECTING = "connecting",
    CONNECTED = "connected",
    RECONNECTING = "reconnecting",
    ERROR = "error"
}
export declare enum UserStatus {
    OFFLINE = "offline",
    ONLINE = "online",
    AWAY = "away",
    BUSY = "busy"
}
export interface AppError {
    code: string;
    message: string;
    details?: any;
    timestamp?: number;
}
export interface ValidationError extends AppError {
    field?: string;
    value?: any;
}
export interface AppConfig {
    NODE_ENV: 'development' | 'production' | 'test';
    SERVER_PORT: number;
    DATABASE_PATH: string;
    UPLOAD_DIR: string;
    MAX_FILE_SIZE: number;
    CORS_ORIGIN: string;
    LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
}
export interface ClientConfig {
    SERVER_URL: string;
    APP_NAME: string;
    APP_VERSION: string;
    MAX_MESSAGE_LENGTH: number;
    MAX_USERNAME_LENGTH: number;
    RECONNECT_ATTEMPTS: number;
    RECONNECT_DELAY: number;
}
//# sourceMappingURL=index.d.ts.map