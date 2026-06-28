import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_DIR = path.join(__dirname, '..', 'logs');

if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

const logFile = path.join(LOG_DIR, `app-${new Date().toISOString().slice(0, 10)}.log`);
const errorFile = path.join(LOG_DIR, `error-${new Date().toISOString().slice(0, 10)}.log`);

const formatEntry = (level, message, meta) => {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(meta ? { meta } : {}),
  };
  return JSON.stringify(entry) + '\n';
};

/**
 * Buffered, asynchronous log writer.
 *
 * Buffers entries and flushes to disk on a timer (or when the buffer fills).
 * This keeps the hot request path off the event loop's blocking I/O path —
 * the previous `appendFileSync` blocked every single request.
 */
const buffers = { log: '', error: '' };
const FLUSH_INTERVAL_MS = 1000;
const MAX_BUFFER_SIZE = 16384;

let flushTimer = null;

const flush = (target) => {
  const data = buffers[target];
  if (!data) return;
  buffers[target] = '';
  const file = target === 'error' ? errorFile : logFile;
  // Promisified append — does not block the event loop.
  fs.promises.appendFile(file, data).catch((err) => {
    console.error(`[Logger] Failed to flush ${target} log:`, err.message);
  });
};

const flushAll = () => {
  flush('log');
  flush('error');
};

const scheduleFlush = () => {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    flushAll();
  }, FLUSH_INTERVAL_MS);
  // Don't keep the process alive just for logging.
  if (flushTimer.unref) flushTimer.unref();
};

const write = (target, entry) => {
  buffers[target] += entry;
  // Flush immediately if buffer grows large, otherwise debounce.
  if (buffers[target].length >= MAX_BUFFER_SIZE) {
    flush(target);
  } else {
    scheduleFlush();
  }
};

// Make sure no log entries are lost on shutdown.
const gracefulShutdown = () => flushAll();
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('exit', gracefulShutdown);

export const logger = {
  debug: (msg, meta) => write('log', formatEntry('DEBUG', msg, meta)),
  info: (msg, meta) => {
    write('log', formatEntry('INFO', msg, meta));
    console.log(`[${new Date().toLocaleTimeString()}] ${msg}`);
  },
  warn: (msg, meta) => {
    write('log', formatEntry('WARN', msg, meta));
    console.warn(`[${new Date().toLocaleTimeString()}] ⚠ ${msg}`);
  },
  error: (msg, meta) => {
    write('error', formatEntry('ERROR', msg, meta));
    write('log', formatEntry('ERROR', msg, meta));
    console.error(`[${new Date().toLocaleTimeString()}] ✗ ${msg}`);
  },
  request: (req, statusCode, durationMs) => {
    const entry = formatEntry('INFO', `${req.method} ${req.path}`, {
      method: req.method,
      path: req.path,
      status: statusCode,
      duration: `${durationMs}ms`,
      ip: req.ip,
      userId: req.userId || 'anonymous',
    });
    write('log', entry);
  },
};

export const requestLogger = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    logger.request(req, res.statusCode, Date.now() - start);
  });
  next();
};
