import { describe, it, expect } from 'vitest';
import { registerWhatsAppPhone, getPhoneForEmail } from '../reminders.js';

describe('reminders', () => {
  it('registers and retrieves phone by email', () => {
    registerWhatsAppPhone('test@example.com', '+1234567890');
    expect(getPhoneForEmail('test@example.com')).toBe('+1234567890');
  });

  it('handles case-insensitive email lookup', () => {
    registerWhatsAppPhone('Case@Test.com', '+9999999999');
    expect(getPhoneForEmail('case@test.com')).toBe('+9999999999');
  });

  it('returns null for unregistered email', () => {
    expect(getPhoneForEmail('nonexistent@test.com')).toBeNull();
  });

  it('overwrites existing phone for same email', () => {
    registerWhatsAppPhone('overwrite@test.com', '+1111111111');
    registerWhatsAppPhone('overwrite@test.com', '+2222222222');
    expect(getPhoneForEmail('overwrite@test.com')).toBe('+2222222222');
  });
});
