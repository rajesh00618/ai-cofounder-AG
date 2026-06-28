import { describe, it, expect } from 'vitest';
import { logger } from '../logger.js';

describe('logger', () => {
  it('has all log level methods', () => {
    expect(typeof logger.debug).toBe('function');
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.request).toBe('function');
  });

  it('debug does not throw', () => {
    expect(() => logger.debug('test debug')).not.toThrow();
  });

  it('info does not throw', () => {
    expect(() => logger.info('test info')).not.toThrow();
  });

  it('warn does not throw', () => {
    expect(() => logger.warn('test warn')).not.toThrow();
  });

  it('error does not throw', () => {
    expect(() => logger.error('test error')).not.toThrow();
  });
});
