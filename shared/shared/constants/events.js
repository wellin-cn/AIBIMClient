"use strict";
/**
 * Socket.io Event Constants
 *
 * Centralized definition of all Socket.io event names to ensure consistency
 * between client and server implementations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVENT_CATEGORIES = exports.isValidEvent = exports.ALL_EVENTS = exports.ADMIN_EVENTS = exports.ROOM_EVENTS = exports.FILE_EVENTS = exports.SYSTEM_EVENTS = exports.TYPING_EVENTS = exports.MESSAGE_EVENTS = exports.USER_EVENTS = exports.SOCKET_EVENTS = void 0;
// Built-in Socket.io events
exports.SOCKET_EVENTS = {
    // Connection events
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    CONNECT_ERROR: 'connect_error',
    RECONNECT: 'reconnect',
    RECONNECT_ATTEMPT: 'reconnect_attempt',
    RECONNECT_ERROR: 'reconnect_error',
    RECONNECT_FAILED: 'reconnect_failed',
    // Heartbeat events
    PING: 'ping',
    PONG: 'pong'
};
// User-related events
exports.USER_EVENTS = {
    // Client to server
    JOIN: 'user:join',
    LEAVE: 'user:leave',
    // Server to client
    JOINED: 'user:joined',
    JOIN_ERROR: 'user:join:error',
    LEFT: 'user:left',
    UPDATE: 'users:update'
};
// Message-related events
exports.MESSAGE_EVENTS = {
    // Client to server
    SEND: 'message:send',
    // Server to client
    RECEIVED: 'message:received',
    SENT: 'message:sent',
    SEND_ERROR: 'message:send:error'
};
// Typing indicator events
exports.TYPING_EVENTS = {
    // Client to server
    START: 'typing:start',
    STOP: 'typing:stop',
    // Server to client
    UPDATE: 'typing:update'
};
// System events
exports.SYSTEM_EVENTS = {
    NOTIFICATION: 'system:notification',
    MAINTENANCE: 'system:maintenance',
    STATS: 'server:stats',
    SHUTDOWN: 'system:shutdown'
};
// File-related events (Phase 2)
exports.FILE_EVENTS = {
    // Client to server
    UPLOAD_START: 'file:upload:start',
    UPLOAD_CHUNK: 'file:upload:chunk',
    UPLOAD_COMPLETE: 'file:upload:complete',
    DOWNLOAD_REQUEST: 'file:download:request',
    // Server to client
    UPLOAD_PROGRESS: 'file:upload:progress',
    UPLOAD_SUCCESS: 'file:upload:success',
    UPLOAD_ERROR: 'file:upload:error',
    DOWNLOAD_READY: 'file:download:ready',
    DOWNLOAD_ERROR: 'file:download:error'
};
// Room/Channel events (Future feature)
exports.ROOM_EVENTS = {
    // Client to server
    JOIN_ROOM: 'room:join',
    LEAVE_ROOM: 'room:leave',
    CREATE_ROOM: 'room:create',
    // Server to client
    ROOM_JOINED: 'room:joined',
    ROOM_LEFT: 'room:left',
    ROOM_CREATED: 'room:created',
    ROOM_UPDATED: 'room:updated'
};
// Admin events (Future feature)
exports.ADMIN_EVENTS = {
    // Client to server
    KICK_USER: 'admin:kick:user',
    BAN_USER: 'admin:ban:user',
    MUTE_USER: 'admin:mute:user',
    BROADCAST: 'admin:broadcast',
    // Server to client
    USER_KICKED: 'admin:user:kicked',
    USER_BANNED: 'admin:user:banned',
    USER_MUTED: 'admin:user:muted',
    ADMIN_BROADCAST: 'admin:broadcast:received'
};
// All events combined for validation
exports.ALL_EVENTS = {
    ...exports.SOCKET_EVENTS,
    ...exports.USER_EVENTS,
    ...exports.MESSAGE_EVENTS,
    ...exports.TYPING_EVENTS,
    ...exports.SYSTEM_EVENTS,
    ...exports.FILE_EVENTS,
    ...exports.ROOM_EVENTS,
    ...exports.ADMIN_EVENTS
};
// Event validation helper
const isValidEvent = (eventName) => {
    return Object.values(exports.ALL_EVENTS).includes(eventName);
};
exports.isValidEvent = isValidEvent;
// Event categorization
exports.EVENT_CATEGORIES = {
    CONNECTION: [
        exports.SOCKET_EVENTS.CONNECT,
        exports.SOCKET_EVENTS.DISCONNECT,
        exports.SOCKET_EVENTS.CONNECT_ERROR,
        exports.SOCKET_EVENTS.RECONNECT,
        exports.SOCKET_EVENTS.RECONNECT_ATTEMPT,
        exports.SOCKET_EVENTS.RECONNECT_ERROR,
        exports.SOCKET_EVENTS.RECONNECT_FAILED
    ],
    USER: [
        exports.USER_EVENTS.JOIN,
        exports.USER_EVENTS.LEAVE,
        exports.USER_EVENTS.JOINED,
        exports.USER_EVENTS.JOIN_ERROR,
        exports.USER_EVENTS.LEFT,
        exports.USER_EVENTS.UPDATE
    ],
    MESSAGE: [
        exports.MESSAGE_EVENTS.SEND,
        exports.MESSAGE_EVENTS.RECEIVED,
        exports.MESSAGE_EVENTS.SENT,
        exports.MESSAGE_EVENTS.SEND_ERROR
    ],
    TYPING: [
        exports.TYPING_EVENTS.START,
        exports.TYPING_EVENTS.STOP,
        exports.TYPING_EVENTS.UPDATE
    ],
    SYSTEM: [
        exports.SYSTEM_EVENTS.NOTIFICATION,
        exports.SYSTEM_EVENTS.MAINTENANCE,
        exports.SYSTEM_EVENTS.STATS,
        exports.SYSTEM_EVENTS.SHUTDOWN
    ]
};
//# sourceMappingURL=events.js.map