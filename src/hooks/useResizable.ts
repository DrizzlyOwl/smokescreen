import { useState, useCallback, useEffect } from 'react';

export const useResizable = (initialSize = { width: 400, height: 300 }, storageKey?: string) => {
  const [size, setSize] = useState(() => {
    if (storageKey) {
      const saved = localStorage.getItem(`smokescreen_size_${storageKey}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to load size from storage', e);
        }
      }
    }
    return initialSize;
  });

  const [isResizing, setIsResizing] = useState(false);

  const onResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
  }, []);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (isResizing) {
      const newSize = {
        width: Math.max(200, size.width + e.movementX),
        height: Math.max(100, size.height + e.movementY)
      };
      setSize(newSize);
      if (storageKey) {
        localStorage.setItem(`smokescreen_size_${storageKey}`, JSON.stringify(newSize));
      }
    }
  }, [isResizing, size.width, size.height, storageKey]);

  const onMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
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
  }, [isResizing, onMouseMove, onMouseUp]);

  return { size, onResizeMouseDown, isResizing };
};
