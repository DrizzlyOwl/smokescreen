import { describe, it, expect, vi } from 'vitest';
import { generateBitmapAvatar } from './avatarGenerator';

describe('avatarGenerator utils', () => {
  it('generates a deterministic data URL string', () => {
    // Mock canvas because JSDOM doesn't implement it fully
    const mockToDataURL = vi.fn(() => 'data:image/png;base64,mocked');
    const mockGetContext = vi.fn(() => ({
      clearRect: vi.fn(),
      fillRect: vi.fn(),
    }));

    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: mockGetContext,
      toDataURL: mockToDataURL,
    };

    vi.stubGlobal('document', {
      createElement: vi.fn((tag) => {
        if (tag === 'canvas') return mockCanvas;
        return {};
      }),
    });

    const result1 = generateBitmapAvatar('user1');
    const result2 = generateBitmapAvatar('user1');

    expect(result1).toBe('data:image/png;base64,mocked');
    expect(result1).toBe(result2);
    expect(mockGetContext).toHaveBeenCalled();
    
    // Cleanup
    vi.unstubAllGlobals();
  });

  it('returns empty string if context creation fails', () => {
    vi.stubGlobal('document', {
      createElement: vi.fn(() => ({
        getContext: () => null,
      })),
    });

    const result = generateBitmapAvatar('fail');
    expect(result).toBe('');

    vi.unstubAllGlobals();
  });
});
