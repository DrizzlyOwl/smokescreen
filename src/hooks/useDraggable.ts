import { useState, useCallback, useEffect } from 'react';
import { useDebugLogger } from './useDebugLogger';

export const useDraggable = (initialPos = { x: 20, y: 20 }, storageKey?: string) => {
  const { log } = useDebugLogger();
  const [position, setPosition] = useState(() => {
    if (storageKey) {
      const saved = localStorage.getItem(`smokescreen_pos_${storageKey}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to load position from storage', e);
        }
      }
    }
    return initialPos;
  });

  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    // Don't drag if clicking a button or other interactive element
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('select')) {
      return;
    }

    // Only drag from headers or specific drag handles
    if (target.closest('.drag-handle')) {
      setIsDragging(true);
      setOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  }, [position]);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - offset.x;
      const newY = e.clientY - offset.y;

      // Constrain to viewport (ensure a portion of the pane remains accessible)
      const boundedX = Math.max(0, Math.min(newX, window.innerWidth - 100));
      const boundedY = Math.max(0, Math.min(newY, window.innerHeight - 50));
      const newPos = { x: boundedX, y: boundedY };

      setPosition(newPos);
      if (storageKey) {
        localStorage.setItem(`smokescreen_pos_${storageKey}`, JSON.stringify(newPos));
      }
    }
  }, [isDragging, offset, storageKey]);

  const onMouseUp = useCallback(() => {
    if (isDragging) {
      log('WINDOW', `MOVE_${storageKey?.toUpperCase() || 'PANE'}`, position);
    }
    setIsDragging(false);
  }, [isDragging, log, storageKey, position]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    } else {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging, onMouseMove, onMouseUp]);

  return { position, setPosition, onMouseDown, isDragging };
};
