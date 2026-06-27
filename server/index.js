import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import 'dotenv/config';
import { initDb } from './db/schema.js';
import apiRoutes from './routes/api.js';
import authRoutes from './routes/auth.js';
import { requestLogger } from './services/logger.js';
import { startReminderScheduler } from './services/reminders.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(helmet());
app.use(express.json());

// Request Logging
app.use(requestLogger);

// Rate Limiters
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: { error: 'Too many requests' } });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });

app.use(limiter);
app.use('/api/auth', authLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

// WhatsApp phone registration (stores mapping in env-like config)
app.post('/api/reminders/register', express.json(), (req, res) => {
  const { email, phone } = req.body;
  if (!email || !phone) return res.status(400).json({ error: 'Email and phone required' });
  const key = `WHATSAPP_${email.replace(/[@.]/g, '_').toUpperCase()}`;
  process.env[key] = phone;
  console.log(`[Reminders] Registered ${email} -> ${phone} for WhatsApp reminders`);
  res.json({ message: 'Phone registered for reminders' });
});

app.get('/health', (req, res) => res.redirect('/api/health'));

app.get('/api/health', (req, res) => {
  const apiKeyConfigured = !!(process.env.NVIDIA_API_KEY);
  res.json({ status: 'ok', message: 'AI Co-Founder API is running', apiKeyConfigured, timestamp: new Date().toISOString() });
});

// Initialize database, then start server
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`[Server] API listening on port ${PORT}`);
    startReminderScheduler();
  });
}).catch(err => {
  console.error('[Server] Database unavailable — starting without persistence:', err.message);
  app.listen(PORT, () => {
    console.log(`[Server] API listening on port ${PORT} (no database)`);
  });
});
