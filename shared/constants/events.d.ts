/**
 * Socket.io Event Constants
 *
 * Centralized definition of all Socket.io event names to ensure consistency
 * between client and server implementations.
 */
export declare const SOCKET_EVENTS: {
    readonly CONNECT: "connect";
    readonly DISCONNECT: "disconnect";
    readonly CONNECT_ERROR: "connect_error";
    readonly RECONNECT: "reconnect";
    readonly RECONNECT_ATTEMPT: "reconnect_attempt";
    readonly RECONNECT_ERROR: "reconnect_error";
    readonly RECONNECT_FAILED: "reconnect_failed";
    readonly PING: "ping";
    readonly PONG: "pong";
};
export declare const USER_EVENTS: {
    readonly JOIN: "user:join";
    readonly LEAVE: "user:leave";
    readonly JOINED: "user:joined";
    readonly JOIN_ERROR: "user:join:error";
    readonly LEFT: "user:left";
    readonly UPDATE: "users:update";
};
export declare const MESSAGE_EVENTS: {
    readonly SEND: "message:send";
    readonly RECEIVED: "message:received";
    readonly SENT: "message:sent";
    readonly SEND_ERROR: "message:send:error";
};
export declare const TYPING_EVENTS: {
    readonly START: "typing:start";
    readonly STOP: "typing:stop";
    readonly UPDATE: "typing:update";
};
export declare const SYSTEM_EVENTS: {
    readonly NOTIFICATION: "system:notification";
    readonly MAINTENANCE: "system:maintenance";
    readonly STATS: "server:stats";
    readonly SHUTDOWN: "system:shutdown";
};
export declare const FILE_EVENTS: {
    readonly UPLOAD_START: "file:upload:start";
    readonly UPLOAD_CHUNK: "file:upload:chunk";
    readonly UPLOAD_COMPLETE: "file:upload:complete";
    readonly DOWNLOAD_REQUEST: "file:download:request";
    readonly UPLOAD_PROGRESS: "file:upload:progress";
    readonly UPLOAD_SUCCESS: "file:upload:success";
    readonly UPLOAD_ERROR: "file:upload:error";
    readonly DOWNLOAD_READY: "file:download:ready";
    readonly DOWNLOAD_ERROR: "file:download:error";
};
export declare const ROOM_EVENTS: {
    readonly JOIN_ROOM: "room:join";
    readonly LEAVE_ROOM: "room:leave";
    readonly CREATE_ROOM: "room:create";
    readonly ROOM_JOINED: "room:joined";
    readonly ROOM_LEFT: "room:left";
    readonly ROOM_CREATED: "room:created";
    readonly ROOM_UPDATED: "room:updated";
};
export declare const ADMIN_EVENTS: {
    readonly KICK_USER: "admin:kick:user";
    readonly BAN_USER: "admin:ban:user";
    readonly MUTE_USER: "admin:mute:user";
    readonly BROADCAST: "admin:broadcast";
    readonly USER_KICKED: "admin:user:kicked";
    readonly USER_BANNED: "admin:user:banned";
    readonly USER_MUTED: "admin:user:muted";
    readonly ADMIN_BROADCAST: "admin:broadcast:received";
};
export declare const ALL_EVENTS: {
    readonly KICK_USER: "admin:kick:user";
    readonly BAN_USER: "admin:ban:user";
    readonly MUTE_USER: "admin:mute:user";
    readonly BROADCAST: "admin:broadcast";
    readonly USER_KICKED: "admin:user:kicked";
    readonly USER_BANNED: "admin:user:banned";
    readonly USER_MUTED: "admin:user:muted";
    readonly ADMIN_BROADCAST: "admin:broadcast:received";
    readonly JOIN_ROOM: "room:join";
    readonly LEAVE_ROOM: "room:leave";
    readonly CREATE_ROOM: "room:create";
    readonly ROOM_JOINED: "room:joined";
    readonly ROOM_LEFT: "room:left";
    readonly ROOM_CREATED: "room:created";
    readonly ROOM_UPDATED: "room:updated";
    readonly UPLOAD_START: "file:upload:start";
    readonly UPLOAD_CHUNK: "file:upload:chunk";
    readonly UPLOAD_COMPLETE: "file:upload:complete";
    readonly DOWNLOAD_REQUEST: "file:download:request";
    readonly UPLOAD_PROGRESS: "file:upload:progress";
    readonly UPLOAD_SUCCESS: "file:upload:success";
    readonly UPLOAD_ERROR: "file:upload:error";
    readonly DOWNLOAD_READY: "file:download:ready";
    readonly DOWNLOAD_ERROR: "file:download:error";
    readonly NOTIFICATION: "system:notification";
    readonly MAINTENANCE: "system:maintenance";
    readonly STATS: "server:stats";
    readonly SHUTDOWN: "system:shutdown";
    readonly START: "typing:start";
    readonly STOP: "typing:stop";
    readonly UPDATE: "typing:update";
    readonly SEND: "message:send";
    readonly RECEIVED: "message:received";
    readonly SENT: "message:sent";
    readonly SEND_ERROR: "message:send:error";
    readonly JOIN: "user:join";
    readonly LEAVE: "user:leave";
    readonly JOINED: "user:joined";
    readonly JOIN_ERROR: "user:join:error";
    readonly LEFT: "user:left";
    readonly CONNECT: "connect";
    readonly DISCONNECT: "disconnect";
    readonly CONNECT_ERROR: "connect_error";
    readonly RECONNECT: "reconnect";
    readonly RECONNECT_ATTEMPT: "reconnect_attempt";
    readonly RECONNECT_ERROR: "reconnect_error";
    readonly RECONNECT_FAILED: "reconnect_failed";
    readonly PING: "ping";
    readonly PONG: "pong";
};
export declare const isValidEvent: (eventName: string) => boolean;
export declare const EVENT_CATEGORIES: {
    readonly CONNECTION: readonly ["connect", "disconnect", "connect_error", "reconnect", "reconnect_attempt", "reconnect_error", "reconnect_failed"];
    readonly USER: readonly ["user:join", "user:leave", "user:joined", "user:join:error", "user:left", "users:update"];
    readonly MESSAGE: readonly ["message:send", "message:received", "message:sent", "message:send:error"];
    readonly TYPING: readonly ["typing:start", "typing:stop", "typing:update"];
    readonly SYSTEM: readonly ["system:notification", "system:maintenance", "server:stats", "system:shutdown"];
};
//# sourceMappingURL=events.d.ts.map