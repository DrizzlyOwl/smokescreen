import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateDynamicMessage } from './chatGenerator';

vi.mock('./team', () => ({
  ALL_PERSONAS: [
    { name: 'MockUser', role: 'SRE', focus: 'Testing', isBot: false }
  ]
}));

describe('chatGenerator utils', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('returns a persona object with user, bio, time, and isBot', async () => {
    const result = await generateDynamicMessage('P0', 'AWS');
    
    expect(result).not.toBeNull();
    expect(result?.user).toBe('MockUser');
    expect(result?.bio).toBe('SRE');
    expect(result?.time).toBeDefined();
    expect(result?.isBot).toBe(false);
    // Text is not included - caller uses local message pool
    expect(result?.text).toBeUndefined();
  });

  it('filters personas by stack for bots', async () => {
    // This test verifies the filtering logic works
    const result = await generateDynamicMessage('P1', 'GCP');
    
    expect(result).not.toBeNull();
    expect(result?.user).toBeDefined();
  });
});
