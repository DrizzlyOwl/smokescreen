import { useState, useCallback, useEffect } from 'react';

export const useResizable = (initialSize = { width: 400, height: 300 }) => {
  const [size, setSize] = useState(initialSize);
  const [isResizing, setIsResizing] = useState(false);

  const onResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
  }, []);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (isResizing) {
      // Find the parent element to get its position for relative sizing
      // But for absolute positioned windows, we can just use the movement
      setSize(prev => ({
        width: Math.max(200, prev.width + e.movementX),
        height: Math.max(100, prev.height + e.movementY)
      }));
    }
  }, [isResizing]);

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
