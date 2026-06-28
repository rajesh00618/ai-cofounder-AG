import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import 'dotenv/config';
import { initDb } from './db/schema.js';
import apiRoutes from './routes/api.js';
import authRoutes from './routes/auth.js';
import { logger, requestLogger } from './services/logger.js';
import { startReminderScheduler, registerWhatsAppPhone } from './services/reminders.js';
import { globalErrorHandler } from './services/errors.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy — required for accurate rate limiting behind nginx/reverse proxy
app.set('trust proxy', 1);

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(helmet());
app.use(express.json({ limit: '1mb' }));

// Request Logging
app.use(requestLogger);

// Rate Limiters
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: { error: 'Too many requests' } });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { error: 'Too many authentication attempts' } });

app.use(limiter);
app.use('/api/auth', authLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

// WhatsApp phone registration (safe in-memory registry, never mutates process.env)
app.post('/api/reminders/register', (req, res) => {
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
  res.json({ status: 'ok', message: 'AI Co-Founder API is running', timestamp: new Date().toISOString() });
});

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handler — must be registered last. Sanitizes errors before
// sending to the client (see services/errors.js).
app.use(globalErrorHandler);

// Initialize database, then start server
initDb().then(() => {
  app.listen(PORT, () => {
    logger.info(`API listening on port ${PORT}`);
    startReminderScheduler();
  });
}).catch(err => {
  logger.error(`Database unavailable — starting without persistence: ${err.message}`);
  app.listen(PORT, () => {
    logger.info(`API listening on port ${PORT} (no database)`);
  });
});
