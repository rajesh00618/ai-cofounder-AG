import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb } from './db/schema.js';
import apiRoutes from './routes/api.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', apiRoutes);

app.get('/api/health', (req, res) => {
  const apiKeyConfigured = !!(process.env.NVIDIA_API_KEY);
  res.json({ status: 'ok', message: 'AI Co-Founder API is running', apiKeyConfigured, timestamp: new Date().toISOString() });
});

// Initialize database, then start server
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`[Server] API listening on port ${PORT}`);
  });
}).catch(err => {
  console.error('[Server] Failed to initialize database:', err);
  process.exit(1);
});
