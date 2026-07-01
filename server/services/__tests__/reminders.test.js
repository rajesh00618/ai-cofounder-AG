import { describe, it, expect, vi } from 'vitest';

let dbValue = { from: vi.fn() };

vi.mock('../../db/database.js', () => ({
  getDb: vi.fn(() => dbValue),
}));

const { registerTelegramChatId, getTelegramChatIdForEmail } = await import('../reminders.js');

describe('reminders', () => {
  it('handles null DB gracefully', async () => {
    dbValue = null;
    await registerTelegramChatId('no@db.com', '123456789');
    expect(await getTelegramChatIdForEmail('no@db.com')).toBeNull();
  });
});
