import { getDb } from './database.js';

const DDL = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  reset_token TEXT,
  reset_token_expires TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS founders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  profile_data TEXT NOT NULL,
  dna_scores TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS businesses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  founder_id TEXT NOT NULL REFERENCES founders(id),
  blueprint TEXT,
  health_scores TEXT,
  current_stage TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  business_id TEXT NOT NULL REFERENCES businesses(id),
  sprint_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT,
  estimated_time TEXT,
  difficulty TEXT,
  ai_assistance TEXT,
  status TEXT DEFAULT 'todo',
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS memory_nodes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  founder_id TEXT NOT NULL REFERENCES founders(id),
  type TEXT NOT NULL,
  label TEXT NOT NULL,
  metadata TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS memory_edges (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  source_node_id TEXT NOT NULL REFERENCES memory_nodes(id),
  target_node_id TEXT NOT NULL REFERENCES memory_nodes(id),
  relationship TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_memory_edges_source ON memory_edges(source_node_id);
CREATE INDEX IF NOT EXISTS idx_memory_nodes_founder ON memory_nodes(founder_id, user_id);
`;

export const initDb = async () => {
  console.log('[DB] Checking Supabase connection...');
  const supabase = getDb();
  if (!supabase) {
    console.log('[DB] Supabase not configured — skipping schema init.');
    console.log('[DB] To create tables, run this SQL in your Supabase SQL Editor:');
    console.log(DDL);
    return;
  }
  console.log('[DB] Supabase connected. Run the DDL above in your Supabase SQL Editor if tables do not exist.');
};
