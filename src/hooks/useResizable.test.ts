import { renderHook, act } from '@testing-library/react';
import { useResizable } from './useResizable';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('useResizable', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('innerWidth', 1000);
    vi.stubGlobal('innerHeight', 800);
  });

  it('initializes with initial size', () => {
    const { result } = renderHook(() => useResizable({ width: 400, height: 300 }));
    expect(result.current.size).toEqual({ width: 400, height: 300 });
  });

  it('constrains resizing to the viewport (East edge)', () => {
    const { result } = renderHook(() => useResizable({ width: 400, height: 300 }, 'test', { x: 500, y: 0 }));

    act(() => {
      result.current.onResizeMouseDown({
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        clientX: 900,
        clientY: 300,
      } as unknown as React.MouseEvent, 'e');
    });

    act(() => {
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 2000, // Move way off screen to the right
        clientY: 300,
      });
      window.dispatchEvent(mouseMoveEvent);
    });

    // maxWidth = 1000 - 500 (origin x) = 500
    expect(result.current.size.width).toBe(500);
  });

  it('constrains resizing to the viewport (West edge)', () => {
    // Start at x: 100
    const mockSetPosition = vi.fn();
    const { result } = renderHook(() => useResizable({ width: 400, height: 300 }, 'test', { x: 100, y: 0 }, mockSetPosition));

    act(() => {
      result.current.onResizeMouseDown({
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        clientX: 100,
        clientY: 300,
      } as unknown as React.MouseEvent, 'w');
    });

    act(() => {
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: -1000, // Move way off screen to the left
        clientY: 300,
      });
      window.dispatchEvent(mouseMoveEvent);
    });

    // If x reaches 0, width becomes width + initial_x = 400 + 100 = 500
    expect(mockSetPosition).toHaveBeenCalledWith({ x: 0, y: 0 });
    expect(result.current.size.width).toBe(500);
  });
});
