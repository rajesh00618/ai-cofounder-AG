import { describe, it, expect } from 'vitest';
import { extractJSON, PROMPTS } from '../../services/ai.js';

describe('extractJSON', () => {
  it('parses valid JSON string', () => {
    const result = extractJSON('{"score": 42}');
    expect(result).toEqual({ score: 42 });
  });

  it('parses JSON from markdown code block', () => {
    const input = '```json\n{"score": 85, "verdict": "promising"}\n```';
    expect(extractJSON(input)).toEqual({ score: 85, verdict: 'promising' });
  });

  it('extracts JSON from text with surrounding content', () => {
    const input = 'Analysis complete.\n{"dimensions": {"market": 70}}\nConfidence: high.';
    expect(extractJSON(input)).toEqual({ dimensions: { market: 70 } });
  });

  it('throws on empty input', () => {
    expect(() => extractJSON('')).toThrow('Empty response from AI');
  });

  it('throws on null input', () => {
    expect(() => extractJSON(null)).toThrow('Empty response from AI');
  });

  it('throws on malformed JSON', () => {
    expect(() => extractJSON('{broken json')).toThrow('Invalid JSON');
  });

  it('handles JSON with line breaks', () => {
    const input = '{\n  "a": 1,\n  "b": 2\n}';
    expect(extractJSON(input)).toEqual({ a: 1, b: 2 });
  });

  it('handles code block without language specifier', () => {
    const input = '```\n{"key": "value"}\n```';
    expect(extractJSON(input)).toEqual({ key: 'value' });
  });

  it('picks the first JSON block when multiple exist', () => {
    const input = '```json\n{"first": true}\n```\n```json\n{"second": true}\n```';
    expect(extractJSON(input)).toEqual({ first: true });
  });
});

describe('PROMPTS constants', () => {
  it('exports all required prompt templates', () => {
    const keys = ['CEO', 'REALITY_ENGINE', 'NEGOTIATION_ENGINE', 'BOARD_MEETING'];
    keys.forEach(key => {
      expect(PROMPTS).toHaveProperty(key);
      expect(typeof PROMPTS[key]).toBe('string');
      expect(PROMPTS[key].length).toBeGreaterThan(50);
    });
  });
});
