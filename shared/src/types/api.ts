// 标准API响应格式
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: AppError;
  timestamp: number;
  requestId?: string;
  version?: string;
}

// API错误响应
export interface ApiErrorResponse {
  success: false;
  error: AppError;
  timestamp: number;
  requestId?: string;
}

// API成功响应
export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  timestamp: number;
  requestId?: string;
}

// 健康检查响应
export interface HealthCheckResponse {
  status: 'ok' | 'degraded' | 'down';
  timestamp: string;
  uptime: number;
  connections: number;
  version: string;
  environment: string;
  services: {
    database: 'ok' | 'error';
    websocket: 'ok' | 'error';
    fileSystem: 'ok' | 'error';
  };
  metrics: {
    memoryUsage: number;
    cpuUsage: number;
    diskUsage: number;
  };
}

// 消息API类型
export interface GetMessagesRequest {
  limit?: number;
  before?: number;
  after?: number;
}

export interface GetMessagesResponse {
  messages: any[];
  pagination: {
    hasMore: boolean;
    total: number;
    limit: number;
    before?: number;
    after?: number;
  };
}

// 用户API类型
export interface GetUsersRequest {
  limit?: number;
  includeOffline?: boolean;
  search?: string;
}

export interface GetUsersResponse {
  users: any[];
  onlineUsers: any[];
  stats: {
    total: number;
    online: number;
    peak: number;
  };
}

// 系统统计API类型
export interface SystemStatsResponse {
  server: {
    uptime: number;
    version: string;
    environment: string;
    startTime: number;
  };
  connections: {
    total: number;
    active: number;
    peak: number;
    byHour: Array<{
      hour: number;
      count: number;
    }>;
  };
  messages: {
    total: number;
    today: number;
    perHour: number;
    byType: Record<string, number>;
  };
  users: {
    total: number;
    online: number;
    registered: number;
    active24h: number;
  };
  performance: {
    averageResponseTime: number;
    errorRate: number;
    memoryUsage: number;
    cpuUsage: number;
  };
}

// 错误类型
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

// HTTP状态码
export enum HttpStatusCodes {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  CONFLICT = 409,
  PAYLOAD_TOO_LARGE = 413,
  UNSUPPORTED_MEDIA_TYPE = 415,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
}

// 错误代码
export enum ApiErrorCodes {
  // General errors (1000-1099)
  INTERNAL_ERROR = 'E1001',
  INVALID_REQUEST = 'E1002',
  VALIDATION_ERROR = 'E1003',
  NOT_FOUND = 'E1004',
  METHOD_NOT_ALLOWED = 'E1005',
  
  // User errors (1200-1299)
  USER_NOT_FOUND = 'E1201',
  USERNAME_TAKEN = 'E1202',
  USERNAME_INVALID = 'E1203',
  
  // Message errors (1300-1399)
  MESSAGE_TOO_LONG = 'E1301',
  MESSAGE_EMPTY = 'E1302',
  MESSAGE_NOT_FOUND = 'E1303',
  MESSAGE_FORBIDDEN = 'E1304',
  
  // File errors (1400-1499)
  FILE_TOO_LARGE = 'E1401',
  FILE_TYPE_NOT_ALLOWED = 'E1402',
  FILE_NOT_FOUND = 'E1403',
  FILE_UPLOAD_FAILED = 'E1404',
  
  // Rate limiting errors (1500-1599)
  RATE_LIMITED = 'E1501',
  TOO_MANY_REQUESTS = 'E1502',
  
  // Server errors (1600-1699)
  SERVICE_UNAVAILABLE = 'E1601',
  MAINTENANCE_MODE = 'E1602',
  DATABASE_ERROR = 'E1603',
}

export interface UserStats {
  totalUsers: number;
  onlineUsers: number;
  peakOnlineUsers: number;
  averageSessionDuration: number;
}