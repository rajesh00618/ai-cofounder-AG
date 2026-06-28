import { describe, it, expect, vi, beforeEach } from 'vitest';

function createChain(finalResult = { data: [], error: null }) {
  const thenable = Promise.resolve(finalResult);
  const chain = {
    eq: vi.fn(() => chain),
    order: vi.fn(() => chain),
    range: vi.fn(() => thenable),
    in: vi.fn(() => thenable),
    maybeSingle: vi.fn(() => thenable),
    insert: vi.fn(() => thenable),
    select: vi.fn(() => chain),
  };
  return chain;
}

let mockFrom;
const defaultCreateChain = () => createChain();

vi.mock('../../db/database.js', () => {
  mockFrom = vi.fn(defaultCreateChain);
  return {
    getDb: vi.fn(() => ({ from: mockFrom })),
  };
});

vi.mock('uuid', () => ({
  v4: () => 'test-uuid-123',
}));

const { addMemoryNode, getMemoryNodes, getMemoryTimeline, addMemoryEdge, getMemoryGraph } = await import('../memory.js');
const { getDb } = await import('../../db/database.js');

describe('memory engine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockImplementation(defaultCreateChain);
    getDb.mockReturnValue({ from: mockFrom });
  });

  it('addMemoryNode returns uuid when database is available', async () => {
    const id = await addMemoryNode('user-1', 'founder-1', 'idea', 'Test idea', { description: 'test' });
    expect(id).toBe('test-uuid-123');
  });

  it('addMemoryNode returns null when db is null', async () => {
    getDb.mockReturnValue(null);
    const id = await addMemoryNode('user-1', 'founder-1', 'idea', 'Test');
    expect(id).toBeNull();
  });

  it('getMemoryNodes returns empty array when no nodes', async () => {
    const nodes = await getMemoryNodes('user-1', 'founder-1');
    expect(nodes).toEqual([]);
  });

  it('getMemoryTimeline returns chronological list', async () => {
    const timeline = await getMemoryTimeline('user-1', 'founder-1');
    expect(timeline).toEqual([]);
  });

  it('addMemoryEdge stores with correct fields', async () => {
    const validResult = Promise.resolve({ data: { id: 'n1', user_id: 'user-1' }, error: null });
    const chain = createChain();
    chain.maybeSingle = vi.fn(() => validResult);
    chain.insert = vi.fn(() => Promise.resolve({ error: null }));
    mockFrom.mockReturnValue(chain);

    const id = await addMemoryEdge('user-1', 'node-1', 'node-2', 'depends_on');
    expect(id).toBe('test-uuid-123');
  });

  it('getMemoryGraph returns nodes and edges structure', async () => {
    const graph = await getMemoryGraph('user-1', 'founder-1');
    expect(graph).toHaveProperty('nodes');
    expect(graph).toHaveProperty('edges');
    expect(graph.nodes).toEqual([]);
    expect(graph.edges).toEqual([]);
  });

  it('getMemoryGraph parses node metadata as JSON', async () => {
    const rawNodes = [
      { id: 'n1', user_id: 'u1', founder_id: 'f1', type: 'idea', label: 'Test', metadata: '{"key":"val"}', created_at: '2024-01-01' },
    ];
    const nodeResult = Promise.resolve({ data: rawNodes, error: null });
    const emptyResult = Promise.resolve({ data: [], error: null });

    const chain = createChain();
    chain.range = vi.fn(() => nodeResult);
    chain.in = vi.fn(() => emptyResult);
    mockFrom.mockReturnValue(chain);

    const graph = await getMemoryGraph('u1', 'f1');
    expect(graph.nodes).toHaveLength(1);
    expect(graph.nodes[0].metadata).toEqual({ key: 'val' });
  });

  it('gracefully handles database errors on add', async () => {
    const errResult = Promise.resolve({ error: new Error('DB error') });
    const chain = createChain();
    chain.insert = vi.fn(() => errResult);
    mockFrom.mockReturnValue(chain);

    await expect(addMemoryNode('u1', 'f1', 'idea', 'Test')).rejects.toThrow('DB error');
  });
});
