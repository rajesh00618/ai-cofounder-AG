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

export const addMemoryEdge = async (userId, sourceNodeId, targetNodeId, relationship) => {
  const supabase = getDb();
  if (!supabase) return null;
  const id = uuidv4();
  const { error } = await supabase.from('memory_edges').insert({
    id, user_id: userId, source_node_id: sourceNodeId,
    target_node_id: targetNodeId, relationship,
  });
  if (error) throw error;
  return id;
};

export const getMemoryGraph = async (userId, founderId) => {
  const supabase = getDb();
  if (!supabase) return { nodes: [], edges: [] };

  const { data: nodes, error: nodeError } = await supabase
    .from('memory_nodes')
    .select('*')
    .eq('user_id', userId)
    .eq('founder_id', founderId)
    .order('created_at', { ascending: false });
  if (nodeError) throw nodeError;

  const nodeIds = (nodes || []).map(n => n.id);
  if (nodeIds.length === 0) return { nodes: [], edges: [] };

  const { data: sourceEdges, error: sourceError } = await supabase
    .from('memory_edges')
    .select('*')
    .eq('user_id', userId)
    .in('source_node_id', nodeIds);
  if (sourceError) throw sourceError;

  const { data: targetEdges, error: targetError } = await supabase
    .from('memory_edges')
    .select('*')
    .eq('user_id', userId)
    .in('target_node_id', nodeIds);
  if (targetError) throw targetError;

  const edgeMap = new Map();
  for (const e of [...(sourceEdges || []), ...(targetEdges || [])]) {
    edgeMap.set(e.id, e);
  }

  return {
    nodes: (nodes || []).map(r => ({ ...r, metadata: r.metadata ? JSON.parse(r.metadata) : {} })),
    edges: [...edgeMap.values()],
  };
};
