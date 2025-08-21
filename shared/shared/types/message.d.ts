/**
 * Message-related type definitions
 */
import { BaseEntity } from './index';
import { UserInfo } from './user';
export declare enum MessageType {
    TEXT = "text",
    FILE = "file",
    SYSTEM = "system"
}
export declare enum SystemMessageType {
    USER_JOINED = "user_joined",
    USER_LEFT = "user_left",
    SERVER_RESTART = "server_restart",
    MAINTENANCE = "maintenance",
    ANNOUNCEMENT = "announcement"
}
export declare enum MessageStatus {
    PENDING = "pending",
    SENT = "sent",
    DELIVERED = "delivered",
    FAILED = "failed"
}
export interface BaseMessage extends BaseEntity {
    type: MessageType;
    content: string;
    sender: UserInfo;
    timestamp: number;
}
export interface TextMessage extends BaseMessage {
    type: MessageType.TEXT;
    content: string;
}
export interface FileMessage extends BaseMessage {
    type: MessageType.FILE;
    content: string;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    downloadCount?: number;
}
export interface SystemMessage extends BaseMessage {
    type: MessageType.SYSTEM;
    sender: {
        id: 'system';
        username: 'System';
    };
    systemType: SystemMessageType;
    data?: any;
}
export type Message = TextMessage | FileMessage | SystemMessage;
export interface MessageWithStatus extends Message {
    status: MessageStatus;
    tempId?: string;
    retryCount?: number;
    errorMessage?: string;
}
export interface CreateMessageData {
    type: MessageType.TEXT;
    content: string;
    tempId?: string;
}
export interface MessageSendData {
    type: MessageType.TEXT | MessageType.FILE;
    content: string;
    timestamp: number;
    tempId?: string;
    fileData?: {
        fileName: string;
        fileSize: number;
        mimeType: string;
    };
}
export interface MessageReceivedData extends Message {
}
export interface MessageSentData {
    tempId: string;
    messageId: string;
    timestamp: number;
    status: 'success';
}
export interface MessageSendErrorData {
    tempId: string;
    code: string;
    message: string;
    details?: any;
}
export interface MessageQuery {
    limit?: number;
    before?: number;
    after?: number;
    userId?: string;
    type?: MessageType;
    search?: string;
}
export interface MessageHistoryResponse {
    messages: Message[];
    hasMore: boolean;
    total: number;
    oldestTimestamp?: number;
    newestTimestamp?: number;
}
export interface TypingData {
    username: string;
    timestamp: number;
}
export interface TypingUpdateData {
    type: 'start' | 'stop';
    user: UserInfo;
    timestamp: number;
}
export interface MessageStats {
    totalMessages: number;
    messagesPerDay: number;
    averageMessageLength: number;
    mostActiveUsers: Array<{
        user: UserInfo;
        messageCount: number;
    }>;
}
export interface FileUploadData {
    fileName: string;
    fileSize: number;
    mimeType: string;
    fileBuffer: ArrayBuffer;
}
export interface FileUploadResponse {
    fileId: string;
    fileName: string;
    fileSize: number;
    fileUrl: string;
    mimeType: string;
    uploadedAt: number;
}
export interface MessageSearchParams {
    query: string;
    type?: MessageType;
    userId?: string;
    dateFrom?: number;
    dateTo?: number;
    limit?: number;
    offset?: number;
}
export interface MessageSearchResult {
    messages: Message[];
    total: number;
    hasMore: boolean;
    searchTime: number;
}
//# sourceMappingURL=message.d.ts.map