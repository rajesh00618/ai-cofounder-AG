import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import 'dotenv/config';
import { initDb } from './db/schema.js';
import { getDb } from './db/database.js';
import apiRoutes from './routes/api.js';
import authRoutes from './routes/auth.js';
import { logger, requestLogger } from './services/logger.js';
import { startReminderScheduler, stopReminderScheduler, registerWhatsAppPhone } from './services/reminders.js';
import { startBackgroundResearch, stopBackgroundResearch } from './services/backgroundResearch.js';
import { globalErrorHandler } from './services/errors.js';
import { requireJwt } from './routes/auth.js';
import { createServer } from 'http';

const validateEnv = () => {
  const required = ['JWT_SECRET', 'NVIDIA_API_KEY'];
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    logger.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
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
const corsOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';

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

// Rate Limiters
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests' },
});
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

app.use(limiter);
app.use('/api/auth', authLimiter);
app.use('/api/chat/stream', streamLimiter);

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

// WhatsApp phone registration (requires authentication)
app.post('/api/reminders/register', requireJwt, (req, res) => {
  const { email, phone } = req.body;
  if (!email || !phone) return res.status(400).json({ error: 'Email and phone required' });
  if (!/^\+\d{7,15}$/.test(phone)) return res.status(400).json({ error: 'Invalid phone number format. Use +CountryCode (e.g., +1234567890).' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Invalid email format.' });
  registerWhatsAppPhone(email, phone);
  logger.info(`Registered ${email} -> ${phone} for WhatsApp reminders`);
  res.json({ message: 'Phone registered for reminders' });
});

app.get('/health', (req, res) => res.redirect('/api/health'));

app.get('/api/health', (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    apiKeyConfigured: !!process.env.NVIDIA_API_KEY,
    memory: {
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + 'MB',
      heap: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
    },
  };
  res.json(health);
});

app.get('/api/health/ready', async (req, res) => {
  const checks = {
    database: 'ok',
    ai: process.env.NVIDIA_API_KEY || process.env.AI_MODEL ? 'configured' : 'not configured',
  };

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
  res.status(isReady ? 200 : 503).json({
    status: isReady ? 'ready' : 'not ready',
    checks,
    timestamp: new Date().toISOString(),
  });
});

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
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

// Graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`[Server] Received ${signal}, shutting down gracefully...`);
  stopBackgroundResearch();
  stopReminderScheduler();
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
