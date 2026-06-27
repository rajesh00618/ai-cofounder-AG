import { runQuery, allQuery } from '../db/database.js';
import { v4 as uuidv4 } from 'uuid';

export const addMemoryNode = async (founderId, type, label, metadata = {}) => {
  const id = uuidv4();
  await runQuery(
    'INSERT INTO memory_nodes (id, founder_id, type, label, metadata) VALUES (?, ?, ?, ?, ?)',
    [id, founderId, type, label, JSON.stringify(metadata)]
  );
  return id;
};

export const getMemoryNodes = async (founderId) => {
  const rows = await allQuery(
    'SELECT * FROM memory_nodes WHERE founder_id = ? ORDER BY created_at DESC',
    [founderId]
  );
  return rows.map(r => ({
    ...r,
    metadata: r.metadata ? JSON.parse(r.metadata) : {}
  }));
};

export const getMemoryTimeline = async (founderId) => {
  const rows = await allQuery(
    'SELECT id, type, label, created_at FROM memory_nodes WHERE founder_id = ? ORDER BY created_at ASC',
    [founderId]
  );
  return rows;
};
