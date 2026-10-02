import { config } from '../../config/index.js';
import { getRequestId } from '../context/index.js';

const levels = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const currentLevelValue = levels[config.LOG_LEVEL] ?? levels.info;

function formatLog(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const requestId = meta.requestId || getRequestId();

  if (config.NODE_ENV === 'development') {
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] [${requestId}] ${message}${metaStr}`;
  }

  return JSON.stringify({
    timestamp,
    level,
    requestId,
    message,
    ...meta,
  });
}

export const logger = {
  debug(message, meta = {}) {
    if (levels.debug >= currentLevelValue) {
      console.info(formatLog('debug', message, meta));
    }
  },
  info(message, meta = {}) {
    if (levels.info >= currentLevelValue) {
      console.info(formatLog('info', message, meta));
    }
  },
  warn(message, meta = {}) {
    if (levels.warn >= currentLevelValue) {
      console.warn(formatLog('warn', message, meta));
    }
  },
  error(message, meta = {}) {
    if (levels.error >= currentLevelValue) {
      console.error(formatLog('error', message, meta));
    }
  },
};
