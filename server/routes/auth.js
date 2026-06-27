import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { getDb } from '../db/database.js';

const generateId = () => crypto.randomUUID();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || (() => { throw new Error('JWT_SECRET must be set in .env') })();

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

    const { data: existing } = await supabase.from('users').select('id').eq('email', email).maybeSingle();
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const id = generateId();
    const password_hash = await bcrypt.hash(password, 10);
    const { error: insertError } = await supabase.from('users').insert({ id, name, email, password_hash });
    if (insertError) throw insertError;

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
    const decoded = jwt.verify(token, JWT_SECRET);

    const supabase = getDb();
    if (!supabase) return res.status(500).json({ error: 'Database not configured' });

    const { data: user } = await supabase.from('users').select('id, name, email, created_at').eq('id', decoded.userId).maybeSingle();
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
export { JWT_SECRET };
