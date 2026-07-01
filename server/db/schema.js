import { getDb, resetDbClient } from './database.js';
import { logger } from '../services/logger.js';

// Source of truth for these constants is server/engines/memory.js
const VALID_NODE_TYPES = ['idea', 'task', 'customer', 'document', 'milestone', 'revenue', 'goal', 'project'];
const VALID_RELATIONSHIPS = ['related_to', 'depends_on', 'part_of', 'influences', 'blocks', 'enables', 'contradicts'];

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
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  profile_data TEXT NOT NULL,
  dna_scores TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS businesses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  founder_id TEXT NOT NULL REFERENCES founders(id) ON DELETE CASCADE,
  blueprint TEXT,
  health_scores TEXT,
  current_stage TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
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
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  founder_id TEXT NOT NULL REFERENCES founders(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (${VALID_NODE_TYPES.map(t => `'${t}'`).join(', ')})),
  label TEXT NOT NULL,
  metadata TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS memory_edges (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_node_id TEXT NOT NULL REFERENCES memory_nodes(id) ON DELETE CASCADE,
  target_node_id TEXT NOT NULL REFERENCES memory_nodes(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL CHECK (relationship IN (${VALID_RELATIONSHIPS.map(r => `'${r}'`).join(', ')})),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);
CREATE INDEX IF NOT EXISTS idx_founders_user ON founders(user_id);
CREATE INDEX IF NOT EXISTS idx_businesses_user ON businesses(user_id);
CREATE INDEX IF NOT EXISTS idx_businesses_founder ON businesses(founder_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_business ON tasks(business_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_sprint ON tasks(sprint_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created ON tasks(created_at);
CREATE INDEX IF NOT EXISTS idx_memory_edges_source ON memory_edges(source_node_id);
CREATE INDEX IF NOT EXISTS idx_memory_edges_target ON memory_edges(target_node_id);
CREATE INDEX IF NOT EXISTS idx_memory_edges_user ON memory_edges(user_id);
CREATE INDEX IF NOT EXISTS idx_memory_nodes_founder ON memory_nodes(founder_id, user_id);
CREATE INDEX IF NOT EXISTS idx_memory_nodes_type ON memory_nodes(type);
CREATE INDEX IF NOT EXISTS idx_memory_nodes_created ON memory_nodes(created_at);
`,
    down: `
DROP TABLE IF EXISTS memory_edges;
DROP TABLE IF EXISTS memory_nodes;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS businesses;
DROP TABLE IF EXISTS founders;
DROP TABLE IF EXISTS users;
`,
  },
  {
    version: 2,
    name: 'add_whatsapp_phone',
    sql: `
ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp_phone TEXT;
CREATE INDEX IF NOT EXISTS idx_users_whatsapp ON users(whatsapp_phone);
`,
    down: `
DROP INDEX IF EXISTS idx_users_whatsapp;
ALTER TABLE users DROP COLUMN IF EXISTS whatsapp_phone;
`,
  },
  {
    version: 3,
    name: 'switch_to_telegram',
    sql: `
ALTER TABLE users RENAME COLUMN whatsapp_phone TO telegram_chat_id;
DROP INDEX IF EXISTS idx_users_whatsapp;
CREATE INDEX IF NOT EXISTS idx_users_telegram ON users(telegram_chat_id);
`,
    down: `
DROP INDEX IF EXISTS idx_users_telegram;
ALTER TABLE users RENAME COLUMN telegram_chat_id TO whatsapp_phone;
CREATE INDEX IF NOT EXISTS idx_users_whatsapp ON users(whatsapp_phone);
`,
  },
];

const LOCK_KEY = 'schema_migration_lock';

const acquireLock = async (supabase) => {
  try {
    const { data, error } = await supabase.from('schema_migrations').insert({ version: -1, name: LOCK_KEY }, { onConflict: 'version', ignoreDuplicates: true }).select('version').maybeSingle();
    if (error) return false;
    if (!data) return false;
    return true;
  } catch {
    return false;
  }
};

const releaseLock = async (supabase) => {
  try {
    await supabase.from('schema_migrations').delete().eq('version', -1).eq('name', LOCK_KEY);
  } catch {}
};

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

    const locked = await acquireLock(supabase);
    if (!locked) {
      logger.info('Migration lock held by another instance — skipping.');
      return;
    }

    try {
      const { data: applied } = await supabase
        .from('schema_migrations')
        .select('version, name')
        .order('version', { ascending: false })
        .limit(1);

      const currentVersion = applied?.[0]?.version || 0;
      const currentName = applied?.[0]?.name || '';

      if (currentName.startsWith('rollback_')) {
        logger.warn('Last operation was a rollback — forcing fresh migration.');
      }

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
    } finally {
      await releaseLock(supabase);
      resetDbClient();
    }

    logger.info('Database schema is up to date.');
  } catch (error) {
    logger.error(`Schema initialization failed: ${error.message}`);
    logger.info('Falling back to legacy init...');
    await legacyInit(supabase);
  }
};

export const rollbackMigration = async (targetVersion = 0) => {
  const supabase = getDb();
  if (!supabase) {
    logger.warn('Cannot rollback — Supabase not configured.');
    return;
  }

  const { data: applied } = await supabase
    .from('schema_migrations')
    .select('version, name')
    .order('version', { ascending: false });

  const appliedVersions = (applied || []).map(m => m.version).filter(v => v > 0).sort((a, b) => b - a);
  for (const version of appliedVersions) {
    if (version <= targetVersion) break;
    const migration = migrations.find(m => m.version === version);
    if (migration?.down) {
      logger.info(`Rolling back migration ${version}: ${migration.name}`);
      const { error } = await supabase.rpc('exec_sql', { query: migration.down });
      if (error) throw error;
      await supabase.from('schema_migrations').delete().eq('version', version);
      logger.info(`Rollback of ${version} complete.`);
    }
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
