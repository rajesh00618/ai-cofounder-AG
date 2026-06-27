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

const write = (file, entry) => {
  try {
    fs.appendFileSync(file, entry);
  } catch (err) {
    console.error(`[Logger] Failed to write to ${file}:`, err.message);
  }
};

export const logger = {
  debug: (msg, meta) => write(logFile, formatEntry('DEBUG', msg, meta)),
  info: (msg, meta) => {
    write(logFile, formatEntry('INFO', msg, meta));
    console.log(`[${new Date().toLocaleTimeString()}] ${msg}`);
  },
  warn: (msg, meta) => {
    write(logFile, formatEntry('WARN', msg, meta));
    console.warn(`[${new Date().toLocaleTimeString()}] ⚠ ${msg}`);
  },
  error: (msg, meta) => {
    write(errorFile, formatEntry('ERROR', msg, meta));
    write(logFile, formatEntry('ERROR', msg, meta));
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
    write(logFile, entry);
  },
};

export const requestLogger = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    logger.request(req, res.statusCode, Date.now() - start);
  });
  next();
};
