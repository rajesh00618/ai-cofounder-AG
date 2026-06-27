import { getDb } from '../db/database.js';
import { v4 as uuidv4 } from 'uuid';

export const addMemoryNode = async (userId, founderId, type, label, metadata = {}) => {
  const supabase = getDb();
  if (!supabase) return null;
  const id = uuidv4();
  const { error } = await supabase.from('memory_nodes').insert({
    id, user_id: userId, founder_id: founderId, type, label,
    metadata: JSON.stringify(metadata),
  });
  if (error) throw error;
  return id;
};

export const getMemoryNodes = async (userId, founderId) => {
  const supabase = getDb();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('memory_nodes')
    .select('*')
    .eq('user_id', userId)
    .eq('founder_id', founderId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(r => ({
    ...r,
    metadata: r.metadata ? JSON.parse(r.metadata) : {}
  }));
};

export const getMemoryTimeline = async (userId, founderId) => {
  const supabase = getDb();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('memory_nodes')
    .select('id, type, label, created_at')
    .eq('user_id', userId)
    .eq('founder_id', founderId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
};
