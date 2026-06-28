import { describe, it, expect } from 'vitest';
import { generateDocument } from '../documents.js';

describe('generateDocument', () => {
  it('is a function', () => {
    expect(typeof generateDocument).toBe('function');
  });

  it('expects apiKey, docType, and businessContext parameters', () => {
    expect(generateDocument.length).toBe(3);
  });
});
