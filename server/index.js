import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import { initDb } from './db/schema.js';
import { getDb, closeDb } from './db/database.js';
import apiRoutes from './routes/api.js';
import authRoutes from './routes/auth.js';
import { logger, requestLogger } from './services/logger.js';
import { startReminderScheduler, stopReminderScheduler, registerTelegramChatId, sendMorningReminder } from './services/reminders.js';
import { startBackgroundResearch, stopBackgroundResearch } from './services/backgroundResearch.js';
import { globalErrorHandler } from './services/errors.js';
import { requireJwt } from './routes/auth.js';
import { createServer } from 'http';

const validateEnv = () => {
  const required = ['JWT_SECRET', 'NVIDIA_API_KEY'];
  const missing = required.filter(k => !process.env[k]);
  if (missing.length > 0) {
    logger.error(`Missing required env vars: ${missing.join(', ')}`);
    process.exit(1);
  }

  // Validate FRONTEND_URL for production
  if (!process.env.FRONTEND_URL) {
    logger.warn('FRONTEND_URL not set. CORS will default to http://localhost:5173. Set this in production.');
  }

  // Warn about optional Supabase
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    logger.warn('Supabase credentials not configured. Database features will be unavailable.');
  }

  // Validate JWT_SECRET length
  if (process.env.JWT_SECRET.length < 32) {
    logger.error('JWT_SECRET must be at least 32 characters');
    process.exit(1);
  }
};

validateEnv();

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy — required for accurate rate limiting behind nginx/reverse proxy
app.set('trust proxy', 1);

// Validate CORS origin at startup to prevent misconfiguration
const corsOrigin = process.env.FRONTEND_URL || process.env.RENDER_EXTERNAL_URL || 'http://localhost:5173';

// Middleware
app.use(cors({
  origin: corsOrigin,
  credentials: true,
}));
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      fontSrc: ["'self'"],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
}));
app.use(express.json({ limit: '1mb' }));

// Request Logging
app.use(requestLogger);

// Rate Limiters — specific limiters first, global last
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts' },
});
const streamLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many stream requests' },
});
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests' },
});

app.use('/api/auth', authLimiter);
app.use('/api/chat/stream', streamLimiter);
app.use('/api', globalLimiter);

// Global request timeout — prevents long-running requests from hanging
const REQUEST_TIMEOUT_MS = parseInt(process.env.REQUEST_TIMEOUT_MS, 10) || 120000;
app.use((req, res, next) => {
  req.setTimeout(REQUEST_TIMEOUT_MS, () => {
    if (!res.headersSent) {
      res.status(408).json({ error: 'Request timeout' });
    }
  });
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

// Health endpoints — must be before the API 404 catch-all
app.get('/health', (req, res) => res.redirect('/api/health'));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    apiKeyConfigured: !!process.env.NVIDIA_API_KEY,
    memory: {
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + 'MB',
      heap: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
    },
  });
});

app.get('/api/health/ready', async (req, res) => {
  const checks = { database: 'ok', ai: process.env.NVIDIA_API_KEY || process.env.AI_MODEL ? 'configured' : 'not configured' };
  const supabase = getDb();
  if (supabase) {
    try {
      await supabase.from('users').select('id').limit(1);
      checks.database = 'ok';
    } catch {
      checks.database = 'error';
    }
  } else {
    checks.database = 'not configured';
  }
  const isReady = checks.database !== 'error';
  res.status(isReady ? 200 : 503).json({ status: isReady ? 'ready' : 'not ready', checks, timestamp: new Date().toISOString() });
});

// Telegram chat ID registration (requires authentication)
app.post('/api/reminders/register', requireJwt, async (req, res) => {
  try {
    const { email, chatId } = req.body;
    if (!email || !chatId) return res.status(400).json({ error: 'Email and Telegram chat ID required' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Invalid email format.' });
    await registerTelegramChatId(email, chatId.toString().trim());
    logger.info(`Registered ${email.replace(/./g, '*')} for Telegram reminders`);
    res.json({ message: 'Telegram chat ID registered for reminders' });
  } catch (error) {
    logger.error(`[Reminders] Registration failed: ${error.message}`);
    res.status(500).json({ error: 'Failed to register Telegram chat ID' });
  }
});

// Send a test Telegram reminder (requires authentication)
app.post('/api/reminders/test', requireJwt, async (req, res) => {
  try {
    const { chatId } = req.body;
    if (!chatId) return res.status(400).json({ error: 'Telegram chat ID required' });
    await sendMorningReminder(chatId.toString().trim(), 'Test User', [{ title: 'Test task 1' }, { title: 'Test task 2' }]);
    res.json({ message: 'Test Telegram message sent!' });
  } catch (error) {
    logger.error(`[Reminders] Test failed: ${error.message}`);
    res.status(500).json({ error: 'Failed to send test message' });
  }
});

// Serve built frontend in production (Docker deployment)
const distDir = path.resolve(__dirname, '..', 'dist');
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(distDir));
}

// API 404 — structured JSON response for unrecognised API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// SPA fallback — serve index.html for all non-API GET requests (client-side routing)
if (process.env.NODE_ENV === 'production') {
  app.get('/{*path}', (req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// 413 handler — payload too large
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request body too large' });
  }
  next(err);
});

// Global error handler — must be registered last. Sanitizes errors before
// sending to the client (see services/errors.js).
app.use(globalErrorHandler);

// Initialize database, then start server
const server = createServer(app);

const startServer = () => {
  server.listen(PORT, () => {
    logger.info(`API listening on port ${PORT}`);
    startReminderScheduler();
    startBackgroundResearch();
  });
};

initDb().then(startServer).catch(err => {
  logger.error(`Database unavailable — starting without persistence: ${err.message}`);
  startServer();
});

// Unhandled rejection/exception handlers
process.on('unhandledRejection', (reason, promise) => {
  logger.error(`[Process] Unhandled Rejection at: ${promise}`, reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

process.on('uncaughtException', (err) => {
  logger.error('[Process] Uncaught Exception:', err);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`[Server] Received ${signal}, shutting down gracefully...`);
  stopBackgroundResearch();
  stopReminderScheduler();
  closeDb();
  server.closeAllConnections?.();
  server.close(() => {
    logger.info('[Server] HTTP server closed');
    process.exit(0);
  });
  setTimeout(() => {
    logger.error('[Server] Forced shutdown after timeout');
    process.exit(1);
  }, 10000).unref();
};

process.once('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.once('SIGINT', () => gracefulShutdown('SIGINT'));
