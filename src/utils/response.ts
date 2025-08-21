import { Response } from 'express';
import { 
  ApiResponse, 
  ApiSuccessResponse, 
  ApiErrorResponse,
  HttpStatusCodes 
} from '../types/api';
import { ApplicationError, formatErrorResponse } from './errors';
import { v4 as uuidv4 } from 'uuid';

// Generate unique request ID
export const generateRequestId = (): string => uuidv4();

// Success response helper
export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode: number = HttpStatusCodes.OK,
  requestId?: string
): void => {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
    timestamp: Date.now(),
    requestId: requestId || res.getHeader('X-Request-ID') as string
  };

  res.status(statusCode).json(response);
};

// Error response helper
export const sendError = (
  res: Response,
  error: Error | ApplicationError,
  statusCode?: number,
  requestId?: string
): void => {
  const appError = formatErrorResponse(error);
  
  // Determine status code
  let httpStatus = statusCode || HttpStatusCodes.INTERNAL_SERVER_ERROR;
  
  if (error instanceof ApplicationError) {
    switch (error.code) {
      case 'E1002': // INVALID_REQUEST
      case 'E1003': // VALIDATION_ERROR
      case 'E1301': // MESSAGE_TOO_LONG
      case 'E1302': // MESSAGE_EMPTY
        httpStatus = HttpStatusCodes.BAD_REQUEST;
        break;
      case 'E1004': // NOT_FOUND
      case 'E1201': // USER_NOT_FOUND
      case 'E1303': // MESSAGE_NOT_FOUND
      case 'E1403': // FILE_NOT_FOUND
        httpStatus = HttpStatusCodes.NOT_FOUND;
        break;
      case 'E1202': // USERNAME_TAKEN
        httpStatus = HttpStatusCodes.CONFLICT;
        break;
      case 'E1501': // RATE_LIMITED
      case 'E1502': // TOO_MANY_REQUESTS
        httpStatus = HttpStatusCodes.TOO_MANY_REQUESTS;
        break;
      case 'E1401': // FILE_TOO_LARGE
        httpStatus = HttpStatusCodes.PAYLOAD_TOO_LARGE;
        break;
      case 'E1402': // FILE_TYPE_NOT_ALLOWED
        httpStatus = HttpStatusCodes.UNSUPPORTED_MEDIA_TYPE;
        break;
      case 'E1601': // SERVICE_UNAVAILABLE
        httpStatus = HttpStatusCodes.SERVICE_UNAVAILABLE;
        break;
    }
  }

  const response: ApiErrorResponse = {
    success: false,
    error: appError,
    timestamp: Date.now(),
    requestId: requestId || res.getHeader('X-Request-ID') as string
  };

  res.status(httpStatus).json(response);
};

// Generic API response wrapper
export const apiResponse = <T>(
  res: Response,
  data?: T,
  error?: Error,
  statusCode?: number,
  requestId?: string
): void => {
  if (error) {
    sendError(res, error, statusCode, requestId);
  } else {
    sendSuccess(res, data, statusCode || HttpStatusCodes.OK, requestId);
  }
};

// Add request ID middleware
export const addRequestId = (req: any, res: Response, next: any): void => {
  const requestId = req.headers['x-request-id'] || generateRequestId();
  res.setHeader('X-Request-ID', requestId);
  req.requestId = requestId;
  next();
};