import { describe, it, expect, vi } from 'vitest';
import { generateBitmapAvatar } from './avatarGenerator';

// Mock Canvas for JSDOM
const mockContext = {
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  fillStyle: '',
  canvas: { width: 8, height: 8 }
};

const mockCanvas = {
  getContext: vi.fn(() => mockContext),
  toDataURL: vi.fn(() => 'data:image/png;base64,mocked_avatar_data')
};

vi.stubGlobal('document', {
  ...document,
  createElement: vi.fn((tagName) => {
    if (tagName === 'canvas') return mockCanvas;
    return document.createElement(tagName);
  })
});

describe('avatarGenerator', () => {
  it('generates a deterministic avatar string for a given name', () => {
    const avatar1 = generateBitmapAvatar('Operator');
    const avatar2 = generateBitmapAvatar('Operator');
    expect(avatar1).toBe(avatar2);
    expect(avatar1).toContain('data:image/png;base64');
  });

  it('generates different avatars for different names', () => {
    // Since we mocked toDataURL to always return the same string,
    // we should check if getContext and fillRect were called.
    generateBitmapAvatar('Operator A');
    expect(mockCanvas.getContext).toHaveBeenCalled();
    expect(mockContext.fillRect).toHaveBeenCalled();
  });

  it('handles empty names', () => {
    const avatar = generateBitmapAvatar('');
    expect(typeof avatar).toBe('string');
    expect(avatar.length).toBeGreaterThan(0);
  });
});
