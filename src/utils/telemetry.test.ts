import { describe, it, expect } from 'vitest';
import { getBurnRate, formatTime, formatTimeWithSeconds, getRandomItem } from './telemetry';

describe('telemetry utils', () => {
  describe('getBurnRate', () => {
    it('returns 0 for NOMINAL severity', () => {
      expect(getBurnRate('NOMINAL')).toBe(0);
    });

    it('returns correct rate for P3', () => {
      expect(getBurnRate('P3')).toBe(0.08);
    });

    it('returns correct rate for P1', () => {
      expect(getBurnRate('P1')).toBe(0.83);
    });

    it('returns correct rate for P0', () => {
      expect(getBurnRate('P0')).toBe(8.33);
    });
  });

  describe('formatTime', () => {
    it('formats date correctly in 24h format', () => {
      const date = new Date('2026-04-12T14:30:00');
      // toLocaleTimeString can be environment dependent, but 24h is usually stable
      const result = formatTime(date);
      expect(result).toMatch(/^\d{2}:\d{2}$/);
      expect(result).toBe('14:30');
    });
  });

  describe('formatTimeWithSeconds', () => {
    it('formats date with seconds in 24h format', () => {
      const date = new Date('2026-04-12T14:30:45');
      const result = formatTimeWithSeconds(date);
      expect(result).toBe('14:30:45');
    });
  });

  describe('getRandomItem', () => {
    it('returns an item from the array', () => {
      const items = ['a', 'b', 'c'];
      const result = getRandomItem(items);
      expect(items).toContain(result);
    });

    it('returns undefined for empty array', () => {
      expect(getRandomItem([])).toBeUndefined();
    });
  });
});
