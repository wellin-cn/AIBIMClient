"use strict";
/**
 * Shared Type Definitions for IM Chat System
 *
 * This file exports all TypeScript type definitions used across
 * both server and client applications.
 *
 * @version 1.0.0
 * @author IM Chat Team
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserStatus = exports.ConnectionStatus = void 0;
// Re-export all types for easy importing
// 导出所有类型定义
__exportStar(require("./user"), exports);
__exportStar(require("./message"), exports);
__exportStar(require("./socket"), exports);
__exportStar(require("./api"), exports);
// Common status enums
var ConnectionStatus;
(function (ConnectionStatus) {
    ConnectionStatus["DISCONNECTED"] = "disconnected";
    ConnectionStatus["CONNECTING"] = "connecting";
    ConnectionStatus["CONNECTED"] = "connected";
    ConnectionStatus["RECONNECTING"] = "reconnecting";
    ConnectionStatus["ERROR"] = "error";
})(ConnectionStatus = exports.ConnectionStatus || (exports.ConnectionStatus = {}));
var UserStatus;
(function (UserStatus) {
    UserStatus["OFFLINE"] = "offline";
    UserStatus["ONLINE"] = "online";
    UserStatus["AWAY"] = "away";
    UserStatus["BUSY"] = "busy";
})(UserStatus = exports.UserStatus || (exports.UserStatus = {}));
//# sourceMappingURL=index.js.map