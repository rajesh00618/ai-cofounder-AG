import { describe, it, expect } from 'vitest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

describe('Auth Utilities', () => {
  describe('bcrypt password hashing', () => {
    it('hashes a password and compares correctly', async () => {
      const password = 'mySecurePassword123!';
      const hash = await bcrypt.hash(password, 10);
      expect(hash).not.toBe(password);
      expect(hash).toMatch(/^\$2[ab]\$/);
      const valid = await bcrypt.compare(password, hash);
      expect(valid).toBe(true);
    });

    it('rejects incorrect password', async () => {
      const hash = await bcrypt.hash('correctPassword', 10);
      const valid = await bcrypt.compare('wrongPassword', hash);
      expect(valid).toBe(false);
    });

    it('produces different hashes for the same password', async () => {
      const password = 'samePassword';
      const hash1 = await bcrypt.hash(password, 10);
      const hash2 = await bcrypt.hash(password, 10);
      expect(hash1).not.toBe(hash2);
      const valid1 = await bcrypt.compare(password, hash1);
      const valid2 = await bcrypt.compare(password, hash2);
      expect(valid1).toBe(true);
      expect(valid2).toBe(true);
    });
  });

  describe('JWT token generation and verification', () => {
    const secret = 'test-secret-for-jwt';

    it('signs and verifies a valid token', () => {
      const payload = { userId: 'abc-123', email: 'founder@test.com' };
      const token = jwt.sign(payload, secret, { expiresIn: '7d' });
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);

      const decoded = jwt.verify(token, secret);
      expect(decoded.userId).toBe('abc-123');
      expect(decoded.email).toBe('founder@test.com');
    });

    it('rejects token signed with different secret', () => {
      const token = jwt.sign({ userId: '1' }, 'secret-a', { expiresIn: '7d' });
      expect(() => jwt.verify(token, 'secret-b')).toThrow('invalid signature');
    });

    it('rejects tampered token', () => {
      const token = jwt.sign({ userId: '1' }, secret, { expiresIn: '7d' });
      const tampered = token.slice(0, -5) + 'XXXXX';
      expect(() => jwt.verify(tampered, secret)).toThrow();
    });

    it('rejects expired token', () => {
      const token = jwt.sign({ userId: '1' }, secret, { expiresIn: '0s' });
      expect(() => jwt.verify(token, secret)).toThrow('expired');
    });

    it('decodes token payload without verification', () => {
      const token = jwt.sign({ userId: '1', email: 'test@test.com' }, secret, { expiresIn: '7d' });
      const decoded = jwt.decode(token);
      expect(decoded.userId).toBe('1');
      expect(decoded.email).toBe('test@test.com');
    });
  });
});
