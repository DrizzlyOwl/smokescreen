import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateDynamicMessage } from './chatGenerator';

// Mock dependencies
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(function() {
    return {
      getGenerativeModel: vi.fn().mockImplementation(() => ({
        generateContent: vi.fn().mockResolvedValue({
          response: {
            text: () => 'Mocked AI message'
          }
        })
      }))
    };
  })
}));

vi.mock('@faker-js/faker', () => ({
  faker: {
    person: {
      firstName: () => 'MockUser'
    }
  }
}));

describe('chatGenerator utils', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('returns a local fallback message when no API key is present', async () => {
    const result = await generateDynamicMessage('P0', 'AWS', 'Operator');
    
    expect(result).not.toBeNull();
    expect(result?.user).toContain('MockUser');
    expect(result?.text).toBeUndefined(); // Local fallback in chatGenerator returns object without text if no key
    expect(result?.isBot).toBeDefined();
  });

  it('calls Gemini AI when API key is present', async () => {
    localStorage.setItem('gemini_api_key', 'mock-key');
    
    const result = await generateDynamicMessage('P0', 'GCP', 'Operator');
    
    expect(result).not.toBeNull();
    expect(result?.text).toBe('Mocked AI message');
    expect(result?.user).toContain('MockUser');
  });

  it('handles Gemini API errors gracefully', async () => {
    localStorage.setItem('gemini_api_key', 'mock-key');
    
    // Force error in mock
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    (GoogleGenerativeAI as any).mockImplementationOnce(() => {
        throw new Error('API Fail');
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const result = await generateDynamicMessage('P1', 'AZURE', 'Operator');
    
    expect(consoleSpy).toHaveBeenCalledWith('Gemini Chat Error:', expect.any(Error));
    expect(result).not.toBeNull();
    expect(result?.text).toBeUndefined(); // Falls back to local object
    
    consoleSpy.mockRestore();
  });
});
