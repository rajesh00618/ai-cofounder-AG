import { describe, it, expect, vi } from 'vitest';

let dbValue = { from: vi.fn() };

vi.mock('../../db/database.js', () => ({
  getDb: vi.fn(() => dbValue),
}));

const { registerWhatsAppPhone, getPhoneForEmail } = await import('../reminders.js');

describe('reminders', () => {
  it('handles null DB gracefully', async () => {
    dbValue = null;
    await registerWhatsAppPhone('no@db.com', '+1111111111');
    expect(await getPhoneForEmail('no@db.com')).toBeNull();
  });
});
