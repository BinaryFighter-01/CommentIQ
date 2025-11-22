// src/lib/utils/errors.ts

/**
 * Base custom error class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
    Object.setPrototypeOf(this, AppError.prototype);
    this.name = this.constructor.name;
  }
}

/**
 * 400 Bad Request
 */
export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed') {
    super(message, 400);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * 401 Unauthorized
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401);
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * 403 Forbidden
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403);
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

/**
 * 404 Not Found
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * 409 Conflict
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

/**
 * 429 Too Many Requests
 */
export class RateLimitError extends AppError {
  public readonly retryAfter?: number;

  constructor(message: string = 'Rate limit exceeded', retryAfter?: number) {
    super(message, 429);
    this.retryAfter = retryAfter;
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

/**
 * 500 Internal Server Error
 */
export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error') {
    super(message, 500);
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}

/**
 * 503 Service Unavailable
 */
export class ServiceUnavailableError extends AppError {
  constructor(service: string = 'Service') {
    super(`${service} is currently unavailable`, 503);
    Object.setPrototypeOf(this, ServiceUnavailableError.prototype);
  }
}

/**
 * API-specific errors
 */
export class YouTubeAPIError extends AppError {
  constructor(message: string = 'YouTube API error', statusCode: number = 500) {
    super(message, statusCode);
    Object.setPrototypeOf(this, YouTubeAPIError.prototype);
  }
}

export class RedditAPIError extends AppError {
  constructor(message: string = 'Reddit API error', statusCode: number = 500) {
    super(message, statusCode);
    Object.setPrototypeOf(this, RedditAPIError.prototype);
  }
}

export class OpenAIAPIError extends AppError {
  constructor(message: string = 'OpenAI API error', statusCode: number = 500) {
    super(message, statusCode);
    Object.setPrototypeOf(this, OpenAIAPIError.prototype);
  }
}

/**
 * Database errors
 */
export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed', isOperational: boolean = true) {
    super(message, 500, isOperational);
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

/**
 * Cache errors
 */
export class CacheError extends AppError {
  constructor(message: string = 'Cache operation failed') {
    super(message, 500);
    Object.setPrototypeOf(this, CacheError.prototype);
  }
}

/**
 * Error handler utility
 */
export function isOperationalError(error: Error): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}

/**
 * Format error for API response
 */
export function formatErrorResponse(error: Error) {
  if (error instanceof AppError) {
    return {
      error: error.message,
      statusCode: error.statusCode,
      ...(error instanceof RateLimitError && error.retryAfter
        ? { retryAfter: error.retryAfter }
        : {}),
    };
  }

  // Unknown errors
  return {
    error: 'Internal server error',
    statusCode: 500,
  };
}
