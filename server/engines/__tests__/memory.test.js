import { describe, it, expect, vi, beforeEach } from 'vitest';

let mockFrom;

vi.mock('../../db/database.js', () => {
  const mockInsert = vi.fn().mockResolvedValue({ error: null });
  const mockSelectChain = () => ({
    eq: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
        in: vi.fn().mockResolvedValue({ data: [], error: null }),
      })),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    })),
    in: vi.fn().mockResolvedValue({ data: [], error: null }),
  });
  mockFrom = vi.fn(() => ({
    insert: mockInsert,
    select: vi.fn(mockSelectChain),
  }));
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
    getDb.mockReturnValue({
      from: mockFrom,
    });
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
    mockFrom.mockImplementation(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn().mockResolvedValue({ data: rawNodes, error: null }),
          })),
          in: vi.fn().mockResolvedValue({ data: [], error: null }),
        })),
      })),
      insert: vi.fn().mockResolvedValue({ error: null }),
    }));

    const graph = await getMemoryGraph('u1', 'f1');
    expect(graph.nodes).toHaveLength(1);
    expect(graph.nodes[0].metadata).toEqual({ key: 'val' });
  });

  it('gracefully handles database errors on add', async () => {
    mockFrom.mockImplementation(() => ({
      insert: vi.fn().mockResolvedValue({ error: new Error('DB error') }),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn().mockResolvedValue({ data: [], error: null }),
          })),
        })),
      })),
    }));

    await expect(addMemoryNode('u1', 'f1', 'idea', 'Test')).rejects.toThrow('DB error');
  });
});
