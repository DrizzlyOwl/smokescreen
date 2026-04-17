import { renderHook, act } from '@testing-library/react';
import { useDraggable } from './useDraggable';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('useDraggable', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('innerWidth', 1000);
    vi.stubGlobal('innerHeight', 800);
  });

  it('initializes with initial position', () => {
    const { result } = renderHook(() => useDraggable({ x: 100, y: 100 }));
    expect(result.current.position).toEqual({ x: 100, y: 100 });
  });

  it('constrains dragging to the viewport', () => {
    const { result } = renderHook(() => useDraggable({ x: 100, y: 100 }));

    // Mock MouseEvent for mousedown on a drag-handle
    const mouseDownEvent = {
      clientX: 150,
      clientY: 150,
      target: {
        closest: (selector: string) => (selector === '.drag-handle' ? {} : null),
      },
    } as unknown as React.MouseEvent;

    act(() => {
      result.current.onMouseDown(mouseDownEvent);
    });

    // Move mouse beyond boundaries (Right/Bottom)
    act(() => {
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 2000, // Way off screen
        clientY: 2000,
      });
      window.dispatchEvent(mouseMoveEvent);
    });

    // Clamped at innerWidth - 100 and innerHeight - 50
    expect(result.current.position.x).toBe(900);
    expect(result.current.position.y).toBe(750);

    // Move mouse beyond boundaries (Left/Top)
    act(() => {
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: -1000,
        clientY: -1000,
      });
      window.dispatchEvent(mouseMoveEvent);
    });

    expect(result.current.position.x).toBe(0);
    expect(result.current.position.y).toBe(0);
  });
});
