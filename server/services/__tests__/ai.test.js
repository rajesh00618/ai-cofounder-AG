import { describe, it, expect } from 'vitest';
import { extractJSON, PROMPTS } from '../ai.js';

describe('extractJSON', () => {
  it('parses plain JSON string', () => {
    expect(extractJSON('{"a": 1}')).toEqual({ a: 1 });
  });

  it('parses JSON inside code block with json language tag', () => {
    const input = '```json\n{"a": 1}\n```';
    expect(extractJSON(input)).toEqual({ a: 1 });
  });

  it('parses JSON inside code block without language tag', () => {
    const input = '```\n{"a": 1}\n```';
    expect(extractJSON(input)).toEqual({ a: 1 });
  });

  it('extracts JSON from text with surrounding content', () => {
    const input = 'Here is the result:\n{"score": 85, "verdict": "good"}\nEnd.';
    expect(extractJSON(input)).toEqual({ score: 85, verdict: 'good' });
  });

  it('extracts nested JSON from text', () => {
    const input = 'Some text { "key": { "inner": "value" } } more text';
    expect(extractJSON(input)).toEqual({ key: { inner: 'value' } });
  });

  it('throws on empty string', () => {
    expect(() => extractJSON('')).toThrow('Empty response from AI');
  });

  it('throws on null input', () => {
    expect(() => extractJSON(null)).toThrow('Empty response from AI');
  });

  it('throws on non-string input', () => {
    expect(() => extractJSON(42)).toThrow('Empty response from AI');
  });

  it('throws on invalid JSON without any JSON-like content', () => {
    expect(() => extractJSON('not json at all')).toThrow('Invalid JSON response from AI');
  });
});

describe('PROMPTS', () => {
  it('has all required prompt keys', () => {
    expect(PROMPTS).toHaveProperty('CEO');
    expect(PROMPTS).toHaveProperty('REALITY_ENGINE');
    expect(PROMPTS).toHaveProperty('NEGOTIATION_ENGINE');
    expect(PROMPTS).toHaveProperty('BOARD_MEETING');
  });

  it('REALITY_ENGINE prompt contains score and dimensions', () => {
    expect(PROMPTS.REALITY_ENGINE).toContain('"score"');
    expect(PROMPTS.REALITY_ENGINE).toContain('"dimensions"');
    expect(PROMPTS.REALITY_ENGINE).toContain('"risks"');
    expect(PROMPTS.REALITY_ENGINE).toContain('"verdict"');
  });

  it('NEGOTIATION_ENGINE prompt contains alternatives', () => {
    expect(PROMPTS.NEGOTIATION_ENGINE).toContain('"alternatives"');
  });
});
