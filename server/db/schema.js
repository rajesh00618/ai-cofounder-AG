import { runQuery } from './database.js';

export const initDb = async () => {
  console.log('[DB] Initializing schema...');
  
  try {
    // Founders table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS founders (
        id TEXT PRIMARY KEY,
        profile_data TEXT NOT NULL,
        dna_scores TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Businesses table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS businesses (
        id TEXT PRIMARY KEY,
        founder_id TEXT NOT NULL,
        blueprint TEXT,
        health_scores TEXT,
        current_stage TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (founder_id) REFERENCES founders(id)
      )
    `);

    // Tasks table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        business_id TEXT NOT NULL,
        sprint_id TEXT,
        title TEXT NOT NULL,
        description TEXT,
        priority TEXT,
        estimated_time TEXT,
        difficulty TEXT,
        ai_assistance TEXT,
        status TEXT DEFAULT 'todo',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        FOREIGN KEY (business_id) REFERENCES businesses(id)
      )
    `);

    // Memory nodes table (for Graph store)
    await runQuery(`
      CREATE TABLE IF NOT EXISTS memory_nodes (
        id TEXT PRIMARY KEY,
        founder_id TEXT NOT NULL,
        type TEXT NOT NULL,
        label TEXT NOT NULL,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (founder_id) REFERENCES founders(id)
      )
    `);
    
    console.log('[DB] Schema initialization complete.');
  } catch (err) {
    console.error('[DB] Schema initialization failed:', err);
    throw err;
  }
};
