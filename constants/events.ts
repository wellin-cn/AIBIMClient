/**
 * Socket.io Event Constants
 * 
 * Centralized definition of all Socket.io event names to ensure consistency
 * between client and server implementations.
 */

// Built-in Socket.io events
export const SOCKET_EVENTS = {
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
} as const

// User-related events
export const USER_EVENTS = {
  // Client to server
  JOIN: 'user:join',
  LEAVE: 'user:leave',
  
  // Server to client
  JOINED: 'user:joined',
  JOIN_ERROR: 'user:join:error',
  LEFT: 'user:left',
  UPDATE: 'users:update'
} as const

// Message-related events
export const MESSAGE_EVENTS = {
  // Client to server
  SEND: 'message:send',
  
  // Server to client
  RECEIVED: 'message:received',
  SENT: 'message:sent',
  SEND_ERROR: 'message:send:error'
} as const

// Typing indicator events
export const TYPING_EVENTS = {
  // Client to server
  START: 'typing:start',
  STOP: 'typing:stop',
  
  // Server to client
  UPDATE: 'typing:update'
} as const

// System events
export const SYSTEM_EVENTS = {
  NOTIFICATION: 'system:notification',
  MAINTENANCE: 'system:maintenance',
  STATS: 'server:stats',
  SHUTDOWN: 'system:shutdown'
} as const

// File-related events (Phase 2)
export const FILE_EVENTS = {
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
} as const

// Room/Channel events (Future feature)
export const ROOM_EVENTS = {
  // Client to server
  JOIN_ROOM: 'room:join',
  LEAVE_ROOM: 'room:leave',
  CREATE_ROOM: 'room:create',
  
  // Server to client
  ROOM_JOINED: 'room:joined',
  ROOM_LEFT: 'room:left',
  ROOM_CREATED: 'room:created',
  ROOM_UPDATED: 'room:updated'
} as const

// Admin events (Future feature)
export const ADMIN_EVENTS = {
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
} as const

// All events combined for validation
export const ALL_EVENTS = {
  ...SOCKET_EVENTS,
  ...USER_EVENTS,
  ...MESSAGE_EVENTS,
  ...TYPING_EVENTS,
  ...SYSTEM_EVENTS,
  ...FILE_EVENTS,
  ...ROOM_EVENTS,
  ...ADMIN_EVENTS
} as const

// Event validation helper
export const isValidEvent = (eventName: string): boolean => {
  return Object.values(ALL_EVENTS).includes(eventName as any)
}

// Event categorization
export const EVENT_CATEGORIES = {
  CONNECTION: [
    SOCKET_EVENTS.CONNECT,
    SOCKET_EVENTS.DISCONNECT,
    SOCKET_EVENTS.CONNECT_ERROR,
    SOCKET_EVENTS.RECONNECT,
    SOCKET_EVENTS.RECONNECT_ATTEMPT,
    SOCKET_EVENTS.RECONNECT_ERROR,
    SOCKET_EVENTS.RECONNECT_FAILED
  ],
  USER: [
    USER_EVENTS.JOIN,
    USER_EVENTS.LEAVE,
    USER_EVENTS.JOINED,
    USER_EVENTS.JOIN_ERROR,
    USER_EVENTS.LEFT,
    USER_EVENTS.UPDATE
  ],
  MESSAGE: [
    MESSAGE_EVENTS.SEND,
    MESSAGE_EVENTS.RECEIVED,
    MESSAGE_EVENTS.SENT,
    MESSAGE_EVENTS.SEND_ERROR
  ],
  TYPING: [
    TYPING_EVENTS.START,
    TYPING_EVENTS.STOP,
    TYPING_EVENTS.UPDATE
  ],
  SYSTEM: [
    SYSTEM_EVENTS.NOTIFICATION,
    SYSTEM_EVENTS.MAINTENANCE,
    SYSTEM_EVENTS.STATS,
    SYSTEM_EVENTS.SHUTDOWN
  ]
} as const