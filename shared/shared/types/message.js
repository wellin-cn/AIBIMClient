"use strict";
/**
 * Message-related type definitions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageStatus = exports.SystemMessageType = exports.MessageType = void 0;
// Message types
var MessageType;
(function (MessageType) {
    MessageType["TEXT"] = "text";
    MessageType["FILE"] = "file";
    MessageType["SYSTEM"] = "system";
})(MessageType = exports.MessageType || (exports.MessageType = {}));
// System message subtypes
var SystemMessageType;
(function (SystemMessageType) {
    SystemMessageType["USER_JOINED"] = "user_joined";
    SystemMessageType["USER_LEFT"] = "user_left";
    SystemMessageType["SERVER_RESTART"] = "server_restart";
    SystemMessageType["MAINTENANCE"] = "maintenance";
    SystemMessageType["ANNOUNCEMENT"] = "announcement";
})(SystemMessageType = exports.SystemMessageType || (exports.SystemMessageType = {}));
// Message status (client-side)
var MessageStatus;
(function (MessageStatus) {
    MessageStatus["PENDING"] = "pending";
    MessageStatus["SENT"] = "sent";
    MessageStatus["DELIVERED"] = "delivered";
    MessageStatus["FAILED"] = "failed";
})(MessageStatus = exports.MessageStatus || (exports.MessageStatus = {}));
//# sourceMappingURL=message.js.map