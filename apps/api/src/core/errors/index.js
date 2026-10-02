import { ERROR_CODES, HTTP_STATUS } from '@devhouse/shared';
import { logger } from '../logger/index.js';
import { getRequestId } from '../context/index.js';

export class AppError extends Error {
  constructor(code, message, details = null, statusCode = null) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.status = statusCode || HTTP_STATUS[code] || 500;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', details = null) {
    super(ERROR_CODES.BAD_REQUEST, message, details, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required', code = ERROR_CODES.UNAUTHORIZED) {
    super(code, message, null, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden', details = null) {
    super(ERROR_CODES.FORBIDDEN, message, details, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', details = null) {
    super(ERROR_CODES.NOT_FOUND, message, details, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict', code = ERROR_CODES.CONFLICT, details = null) {
    super(code, message, details, 409);
  }
}

export class ValidationError extends AppError {
  constructor(details = null, message = 'Request validation failed') {
    super(ERROR_CODES.VALIDATION_ERROR, message, details, 422);
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message = 'Service temporarily unavailable', code = ERROR_CODES.SERVICE_UNAVAILABLE) {
    super(code, message, null, 503);
  }
}

export const errorHandler = (err, req, res, _next) => {
  const requestId = req.id || getRequestId();

  let statusCode = err.status || 500;
  let code = err.code || ERROR_CODES.INTERNAL_ERROR;
  let message = err.message || 'Internal server error';
  let details = err.details || null;

  // Handle Mongoose duplicate key error (E11000)
  if (err.name === 'MongoServerError' && err.code === 11000) {
    statusCode = 409;
    code = ERROR_CODES.CONFLICT;
    message = 'Duplicate key violation';
    const field = Object.keys(err.keyPattern || {})[0];
    details = [{ field, message: `${field} already exists` }];
  } else if (err.name === 'ValidationError') {
    // Mongoose validation error
    statusCode = 422;
    code = ERROR_CODES.VALIDATION_ERROR;
    message = 'Validation failed';
    details = Object.values(err.errors || {}).map(e => ({
      path: e.path,
      message: e.message,
    }));
  } else if (err.name === 'CastError') {
    statusCode = 400;
    code = ERROR_CODES.BAD_REQUEST;
    message = `Invalid format for ${err.path}`;
  } else if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    code = ERROR_CODES.BAD_REQUEST;
    message = 'Malformed JSON in request body';
  }

  if (statusCode >= 500) {
    logger.error(`Server error: ${err.message}`, {
      stack: err.stack,
      requestId,
      url: req.originalUrl,
      method: req.method,
    });
    // Sanitize 500 message for external consumers in production
    if (process.env.NODE_ENV === 'production') {
      message = 'An unexpected internal error occurred';
      details = null;
    }
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
      requestId,
    },
  });
};
