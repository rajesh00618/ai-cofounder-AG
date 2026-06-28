import { getDb } from '../db/database.js';
import { v4 as uuidv4 } from 'uuid';

const VALID_NODE_TYPES = new Set(['idea', 'task', 'customer', 'document', 'milestone', 'revenue', 'goal', 'project']);
const VALID_RELATIONSHIPS = new Set(['related_to', 'depends_on', 'part_of', 'influences', 'blocks', 'enables', 'contradicts']);

export const addMemoryNode = async (userId, founderId, type, label, metadata = {}) => {
  if (!VALID_NODE_TYPES.has(type)) throw new Error(`Invalid node type: ${type}. Valid types: ${[...VALID_NODE_TYPES].join(', ')}`);
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

export const getMemoryNodes = async (userId, founderId, limit = 100, offset = 0) => {
  const supabase = getDb();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('memory_nodes')
    .select('*')
    .eq('user_id', userId)
    .eq('founder_id', founderId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return (data || []).map(r => ({
    ...r,
    metadata: r.metadata ? JSON.parse(r.metadata) : {}
  }));
};

export const getMemoryTimeline = async (userId, founderId, limit = 200, offset = 0) => {
  const supabase = getDb();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('memory_nodes')
    .select('id, type, label, created_at')
    .eq('user_id', userId)
    .eq('founder_id', founderId)
    .order('created_at', { ascending: true })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return data || [];
};

export const addMemoryEdge = async (userId, sourceNodeId, targetNodeId, relationship) => {
  if (sourceNodeId === targetNodeId) throw new Error('Self-loops are not allowed');
  if (!VALID_RELATIONSHIPS.has(relationship)) throw new Error(`Invalid relationship: ${relationship}. Valid: ${[...VALID_RELATIONSHIPS].join(', ')}`);
  const supabase = getDb();
  if (!supabase) return null;

  // Validate both source and target nodes belong to the same user
  const { data: sourceNode } = await supabase.from('memory_nodes').select('user_id').eq('id', sourceNodeId).maybeSingle();
  if (!sourceNode || sourceNode.user_id !== userId) throw new Error('Source node not found or access denied');

  const { data: targetNode } = await supabase.from('memory_nodes').select('user_id').eq('id', targetNodeId).maybeSingle();
  if (!targetNode || targetNode.user_id !== userId) throw new Error('Target node not found or access denied');

  // Check for duplicate edges
  const { data: existing } = await supabase.from('memory_edges')
    .select('id').eq('user_id', userId).eq('source_node_id', sourceNodeId)
    .eq('target_node_id', targetNodeId).eq('relationship', relationship).maybeSingle();
  if (existing) throw new Error('Edge already exists');

  const id = uuidv4();
  const { error } = await supabase.from('memory_edges').insert({
    id, user_id: userId, source_node_id: sourceNodeId,
    target_node_id: targetNodeId, relationship,
  });
  if (error) throw error;
  return id;
};

export const getMemoryGraph = async (userId, founderId, limit = 100, offset = 0) => {
  const supabase = getDb();
  if (!supabase) return { nodes: [], edges: [] };

  const { data: nodes, error: nodeError } = await supabase
    .from('memory_nodes')
    .select('*')
    .eq('user_id', userId)
    .eq('founder_id', founderId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (nodeError) throw nodeError;

  const nodeIds = (nodes || []).map(n => n.id);
  if (nodeIds.length === 0) return { nodes: [], edges: [] };

  const { data: sourceEdges, error: sourceError } = await supabase
    .from('memory_edges')
    .select('*')
    .eq('user_id', userId)
    .in('source_node_id', nodeIds);
  if (sourceError) throw sourceError;

  const nodeIdSet = new Set(nodeIds);
  const edgeMap = new Map();
  for (const e of (sourceEdges || [])) {
    if (nodeIdSet.has(e.source_node_id) && nodeIdSet.has(e.target_node_id)) {
      edgeMap.set(e.id, e);
    }
  }

  return {
    nodes: (nodes || []).map(r => ({ ...r, metadata: r.metadata ? JSON.parse(r.metadata) : {} })),
    edges: [...edgeMap.values()],
  };
};
