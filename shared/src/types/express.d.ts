// 扩展Express Request接口
declare namespace Express {
  interface Request {
    requestId?: string;
  }
}