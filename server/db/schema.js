import { getDb } from './database.js';
import { logger } from '../services/logger.js';

const MIGRATION_TABLE = `
CREATE TABLE IF NOT EXISTS schema_migrations (
  version INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  applied_at TIMESTAMP DEFAULT NOW()
);
`;

const migrations = [
  {
    version: 1,
    name: 'initial_schema',
    sql: `
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
  source_node_id TEXT NOT NULL REFERENCES memory_nodes(id) ON DELETE CASCADE,
  target_node_id TEXT NOT NULL REFERENCES memory_nodes(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_memory_edges_source ON memory_edges(source_node_id);
CREATE INDEX IF NOT EXISTS idx_memory_edges_target ON memory_edges(target_node_id);
CREATE INDEX IF NOT EXISTS idx_memory_edges_user ON memory_edges(user_id);
CREATE INDEX IF NOT EXISTS idx_memory_nodes_founder ON memory_nodes(founder_id, user_id);
`,
  },
];

export const initDb = async () => {
  logger.info('Initializing database schema...');
  const supabase = getDb();
  if (!supabase) {
    logger.info('Supabase not configured — skipping schema init.');
    logger.info('To create tables manually, run this SQL in your Supabase SQL Editor:');
    for (const migration of migrations) {
      logger.info(`Migration ${migration.version}: ${migration.name}`);
      logger.info(migration.sql);
    }
    return;
  }

  try {
    const { error: tableError } = await supabase.rpc('exec_sql', { query: MIGRATION_TABLE });
    if (tableError) {
      logger.warn('Could not create migrations table (RPC may not exist). Using legacy init.');
      return await legacyInit(supabase);
    }

    const { data: applied } = await supabase
      .from('schema_migrations')
      .select('version')
      .order('version', { ascending: false })
      .limit(1);

    const currentVersion = applied?.[0]?.version || 0;

    for (const migration of migrations) {
      if (migration.version > currentVersion) {
        logger.info(`Applying migration ${migration.version}: ${migration.name}`);
        const { error } = await supabase.rpc('exec_sql', { query: migration.sql });
        if (error) {
          logger.error(`Migration ${migration.version} failed: ${error.message}`);
          throw error;
        }
        await supabase.from('schema_migrations').insert({
          version: migration.version,
          name: migration.name,
        });
        logger.info(`Migration ${migration.version} applied successfully.`);
      }
    }

    logger.info('Database schema is up to date.');
  } catch (error) {
    logger.error(`Schema initialization failed: ${error.message}`);
    logger.info('Falling back to legacy init...');
    await legacyInit(supabase);
  }
};

const legacyInit = async (supabase) => {
  const fullDDL = migrations.map(m => m.sql).join('\n');
  try {
    const { error } = await supabase.rpc('exec_sql', { query: fullDDL });
    if (error) {
      logger.warn('Could not auto-apply schema (RPC may not exist). Run manually.');
      logger.info(fullDDL);
    } else {
      logger.info('Schema applied successfully via legacy init.');
    }
  } catch {
    logger.warn('Could not auto-apply schema. Run manually:');
    logger.info(fullDDL);
  }
};
