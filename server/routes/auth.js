import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { getDb } from '../db/database.js';
import { setApiKey as cacheSetApiKey, hasApiKey } from '../apiKeyCache.js';
import { sendError } from '../services/errors.js';

const generateId = () => crypto.randomUUID();

const router = express.Router();

// Lazily validate JWT_SECRET to avoid crashing at module load time
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET must be set in .env');
  }
  return secret;
};

/** Shared JWT verification middleware. */
const requireJwt = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    const decoded = jwt.verify(auth.split(' ')[1], getJwtSecret());
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const supabase = getDb();
    if (!supabase) return res.status(500).json({ error: 'Database not configured' });

    const id = generateId();
    const password_hash = await bcrypt.hash(password, 10);

    // Use a single insert with a catch for unique violation instead of select-then-insert
    // This avoids the race condition between the check and the insert
    const { error: insertError } = await supabase.from('users').insert({
      id, name, email, password_hash
    });

    if (insertError) {
      // Check for unique constraint violation (PostgreSQL error code 23505)
      if (insertError.code === '23505' || (insertError.message && insertError.message.includes('duplicate'))) {
        return res.status(409).json({ error: 'Email already registered' });
      }
      throw insertError;
    }

    const JWT_SECRET = getJwtSecret();
    const token = jwt.sign({ userId: id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id, name, email } });
  } catch (error) {
    sendError(res, error);
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const supabase = getDb();
    if (!supabase) return res.status(500).json({ error: 'Database not configured' });

    const { data: user, error: selectError } = await supabase.from('users').select('id, name, email, password_hash').eq('email', email).maybeSingle();
    if (selectError) throw selectError;
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const JWT_SECRET = getJwtSecret();
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    sendError(res, error);
  }
});

router.get('/me', requireJwt, async (req, res) => {
  try {
    const supabase = getDb();
    if (!supabase) return res.status(500).json({ error: 'Database not configured' });

    const { data: user } = await supabase.from('users').select('id, name, email, created_at').eq('id', req.userId).maybeSingle();
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (error) {
    sendError(res, error);
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const supabase = getDb();
    if (!supabase) return res.status(500).json({ error: 'Database not configured' });

    const { data: user } = await supabase.from('users').select('id').eq('email', email).maybeSingle();
    if (!user) return res.json({ message: 'If that email exists, a reset link has been sent.' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    // NOTE: SHA-256 is used here for simplicity, but bcrypt would be more
    // resistant to timing attacks on the stored hash. Email sending is not yet
    // implemented — the token is returned in the response for testing purposes.
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expires = new Date(Date.now() + 3600000).toISOString();

    await supabase.from('users').update({ reset_token: resetTokenHash, reset_token_expires: expires }).eq('id', user.id);

    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (error) {
    sendError(res, error);
  }
});

router.post('/api-key', requireJwt, async (req, res) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
      return res.status(400).json({ error: 'API key is required' });
    }
    cacheSetApiKey(req.userId, apiKey.trim());
    res.json({ message: 'API key stored securely' });
  } catch (error) {
    sendError(res, error);
  }
});

router.get('/api-key', requireJwt, async (req, res) => {
  try {
    res.json({ hasApiKey: hasApiKey(req.userId) });
  } catch (error) {
    sendError(res, error);
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { token, email, password } = req.body;
    if (!token || !email || !password) {
      return res.status(400).json({ error: 'Token, email, and new password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const supabase = getDb();
    if (!supabase) return res.status(500).json({ error: 'Database not configured' });

    const { data: user } = await supabase.from('users')
      .select('id, reset_token, reset_token_expires')
      .eq('email', email)
      .maybeSingle();

    if (!user || !user.reset_token) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    if (new Date(user.reset_token_expires) < new Date()) {
      return res.status(400).json({ error: 'Reset token has expired' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const storedBuf = Buffer.from(user.reset_token);
    const tokenBuf = Buffer.from(tokenHash);
    if (storedBuf.length !== tokenBuf.length || !crypto.timingSafeEqual(storedBuf, tokenBuf)) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    await supabase.from('users').update({
      password_hash,
      reset_token: null,
      reset_token_expires: null,
    }).eq('id', user.id);

    res.json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    sendError(res, error);
  }
});

export default router;
export { getJwtSecret as JWT_SECRET, requireJwt };
