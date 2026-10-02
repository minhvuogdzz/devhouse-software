import { getRequestId } from '../context/index.js';

export const sendSuccess = (res, data, statusCode = 200, meta = {}) => {
  const requestId = res.req?.id || getRequestId();
  return res.status(statusCode).json({
    success: true,
    data,
    meta: {
      requestId,
      ...meta,
    },
  });
};

export const sendPaginated = (res, data, pagination, meta = {}) => {
  return sendSuccess(res, data, 200, {
    pagination,
    ...meta,
  });
};

export const asyncHandler = fn => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
