"use strict";
/**
 * API-related type definitions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpStatusCodes = exports.ApiErrorCodes = void 0;
// Error codes enum
var ApiErrorCodes;
(function (ApiErrorCodes) {
    // General errors (1000-1099)
    ApiErrorCodes["INTERNAL_ERROR"] = "E1001";
    ApiErrorCodes["INVALID_REQUEST"] = "E1002";
    ApiErrorCodes["VALIDATION_ERROR"] = "E1003";
    ApiErrorCodes["NOT_FOUND"] = "E1004";
    ApiErrorCodes["METHOD_NOT_ALLOWED"] = "E1005";
    // Authentication/Authorization errors (1100-1199)
    ApiErrorCodes["UNAUTHORIZED"] = "E1101";
    ApiErrorCodes["FORBIDDEN"] = "E1102";
    ApiErrorCodes["TOKEN_EXPIRED"] = "E1103";
    ApiErrorCodes["TOKEN_INVALID"] = "E1104";
    // User errors (1200-1299)
    ApiErrorCodes["USER_NOT_FOUND"] = "E1201";
    ApiErrorCodes["USERNAME_TAKEN"] = "E1202";
    ApiErrorCodes["USERNAME_INVALID"] = "E1203";
    ApiErrorCodes["USER_BANNED"] = "E1204";
    // Message errors (1300-1399)
    ApiErrorCodes["MESSAGE_TOO_LONG"] = "E1301";
    ApiErrorCodes["MESSAGE_EMPTY"] = "E1302";
    ApiErrorCodes["MESSAGE_NOT_FOUND"] = "E1303";
    ApiErrorCodes["MESSAGE_FORBIDDEN"] = "E1304";
    // File errors (1400-1499)
    ApiErrorCodes["FILE_TOO_LARGE"] = "E1401";
    ApiErrorCodes["FILE_TYPE_NOT_ALLOWED"] = "E1402";
    ApiErrorCodes["FILE_NOT_FOUND"] = "E1403";
    ApiErrorCodes["FILE_UPLOAD_FAILED"] = "E1404";
    // Rate limiting errors (1500-1599)
    ApiErrorCodes["RATE_LIMITED"] = "E1501";
    ApiErrorCodes["TOO_MANY_REQUESTS"] = "E1502";
    // Server errors (1600-1699)
    ApiErrorCodes["SERVICE_UNAVAILABLE"] = "E1601";
    ApiErrorCodes["MAINTENANCE_MODE"] = "E1602";
    ApiErrorCodes["DATABASE_ERROR"] = "E1603";
})(ApiErrorCodes = exports.ApiErrorCodes || (exports.ApiErrorCodes = {}));
// HTTP status codes
var HttpStatusCodes;
(function (HttpStatusCodes) {
    HttpStatusCodes[HttpStatusCodes["OK"] = 200] = "OK";
    HttpStatusCodes[HttpStatusCodes["CREATED"] = 201] = "CREATED";
    HttpStatusCodes[HttpStatusCodes["NO_CONTENT"] = 204] = "NO_CONTENT";
    HttpStatusCodes[HttpStatusCodes["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    HttpStatusCodes[HttpStatusCodes["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
    HttpStatusCodes[HttpStatusCodes["FORBIDDEN"] = 403] = "FORBIDDEN";
    HttpStatusCodes[HttpStatusCodes["NOT_FOUND"] = 404] = "NOT_FOUND";
    HttpStatusCodes[HttpStatusCodes["METHOD_NOT_ALLOWED"] = 405] = "METHOD_NOT_ALLOWED";
    HttpStatusCodes[HttpStatusCodes["CONFLICT"] = 409] = "CONFLICT";
    HttpStatusCodes[HttpStatusCodes["PAYLOAD_TOO_LARGE"] = 413] = "PAYLOAD_TOO_LARGE";
    HttpStatusCodes[HttpStatusCodes["UNSUPPORTED_MEDIA_TYPE"] = 415] = "UNSUPPORTED_MEDIA_TYPE";
    HttpStatusCodes[HttpStatusCodes["TOO_MANY_REQUESTS"] = 429] = "TOO_MANY_REQUESTS";
    HttpStatusCodes[HttpStatusCodes["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
    HttpStatusCodes[HttpStatusCodes["BAD_GATEWAY"] = 502] = "BAD_GATEWAY";
    HttpStatusCodes[HttpStatusCodes["SERVICE_UNAVAILABLE"] = 503] = "SERVICE_UNAVAILABLE";
    HttpStatusCodes[HttpStatusCodes["GATEWAY_TIMEOUT"] = 504] = "GATEWAY_TIMEOUT";
})(HttpStatusCodes = exports.HttpStatusCodes || (exports.HttpStatusCodes = {}));
//# sourceMappingURL=api.js.map