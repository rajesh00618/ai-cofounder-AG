import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { getDb } from '../db/database.js';

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

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
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
    const token = jwt.sign({ userId: id, email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id, name, email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
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

    const { data: user, error: selectError } = await supabase.from('users').select('*').eq('email', email).maybeSingle();
    if (selectError) throw selectError;
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const JWT_SECRET = getJwtSecret();
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/me', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const token = auth.split(' ')[1];
    const JWT_SECRET = getJwtSecret();
    const decoded = jwt.verify(token, JWT_SECRET);

    const supabase = getDb();
    if (!supabase) return res.status(500).json({ error: 'Database not configured' });

    const { data: user } = await supabase.from('users').select('id, name, email, created_at').eq('id', decoded.userId).maybeSingle();
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
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
    const expires = new Date(Date.now() + 3600000).toISOString();

    await supabase.from('users').update({ reset_token: resetToken, reset_token_expires: expires }).eq('id', user.id);

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    if (process.env.NODE_ENV === 'production' && process.env.RESET_EMAIL_API) {
      try {
        await fetch(process.env.RESET_EMAIL_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: email, subject: 'Password Reset - AI Co-Founder', html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 1 hour.</p>` }),
        });
      } catch (mailErr) {
        console.warn('[Auth] Failed to send reset email:', mailErr.message);
      }
    } else {
      console.log(`[Auth] Password reset link sent to ${email}`);
    }

    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { token, email, password } = req.body;
    if (!token || !email || !password) {
      return res.status(400).json({ error: 'Token, email, and new password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const supabase = getDb();
    if (!supabase) return res.status(500).json({ error: 'Database not configured' });

    const { data: user } = await supabase.from('users')
      .select('id, reset_token, reset_token_expires')
      .eq('email', email)
      .maybeSingle();

    if (!user || !user.reset_token || user.reset_token !== token) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    if (new Date(user.reset_token_expires) < new Date()) {
      return res.status(400).json({ error: 'Reset token has expired' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    await supabase.from('users').update({
      password_hash,
      reset_token: null,
      reset_token_expires: null,
    }).eq('id', user.id);

    res.json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
export { getJwtSecret as JWT_SECRET };
