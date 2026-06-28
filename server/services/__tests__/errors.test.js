import { describe, it, expect } from 'vitest';
import { sanitizeError } from '../errors.js';

describe('sanitizeError', () => {
  it('returns 401 for JWT errors', () => {
    const result = sanitizeError({ name: 'JsonWebTokenError', message: 'jwt malformed' });
    expect(result.status).toBe(401);
    expect(result.message).toBe('Authentication failed. Please sign in again.');
  });

  it('returns 409 for duplicate key errors', () => {
    const result = sanitizeError({ code: '23505', message: 'duplicate key value' });
    expect(result.status).toBe(409);
  });

  it('returns 400 for invalid input syntax', () => {
    const result = sanitizeError({ code: '22P02', message: 'invalid input syntax' });
    expect(result.status).toBe(400);
  });

  it('returns 500 with status in dev mode surfaces raw message', () => {
    const result = sanitizeError({ message: 'something broke' }, 'Default message');
    expect(result.status).toBe(500);
    expect(result.message).toBe('something broke');
  });

  it('handles null/undefined error gracefully', () => {
    const result = sanitizeError(null, 'Fallback message');
    expect(result.status).toBe(500);
    expect(result.message).toBe('Fallback message');
  });
});
