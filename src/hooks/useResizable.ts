import { useState, useCallback, useEffect, useRef } from 'react';

type Direction = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

export const useResizable = (
  initialSize = { width: 400, height: 300 }, 
  storageKey?: string,
  position = { x: 0, y: 0 },
  setPosition?: (pos: { x: number, y: number }) => void
) => {
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
  const [resizeDir, setResizeDir] = useState<Direction | null>(null);
  
  const initialMouseRef = useRef({ x: 0, y: 0 });
  const initialSizeRef = useRef({ width: 0, height: 0 });
  const initialPosRef = useRef({ x: 0, y: 0 });

  const onResizeMouseDown = useCallback((e: React.MouseEvent, dir: Direction) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeDir(dir);
    initialMouseRef.current = { x: e.clientX, y: e.clientY };
    initialSizeRef.current = { ...size };
    initialPosRef.current = { ...position };
  }, [size, position]);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (isResizing && resizeDir) {
      const deltaX = e.clientX - initialMouseRef.current.x;
      const deltaY = e.clientY - initialMouseRef.current.y;
      
      let newWidth = initialSizeRef.current.width;
      let newHeight = initialSizeRef.current.height;
      let newX = initialPosRef.current.x;
      let newY = initialPosRef.current.y;

      // Handle horizontal
      if (resizeDir.includes('e')) {
        newWidth = Math.max(200, initialSizeRef.current.width + deltaX);
      } else if (resizeDir.includes('w')) {
        const potentialWidth = initialSizeRef.current.width - deltaX;
        if (potentialWidth >= 200) {
          newWidth = potentialWidth;
          newX = initialPosRef.current.x + deltaX;
        } else {
          newWidth = 200;
          newX = initialPosRef.current.x + (initialSizeRef.current.width - 200);
        }
      }

      // Handle vertical
      if (resizeDir.includes('s')) {
        newHeight = Math.max(100, initialSizeRef.current.height + deltaY);
      } else if (resizeDir.includes('n')) {
        const potentialHeight = initialSizeRef.current.height - deltaY;
        if (potentialHeight >= 100) {
          newHeight = potentialHeight;
          newY = initialPosRef.current.y + deltaY;
        } else {
          newHeight = 100;
          newY = initialPosRef.current.y + (initialSizeRef.current.height - 100);
        }
      }

      setSize({ width: newWidth, height: newHeight });
      if (setPosition) {
        setPosition({ x: newX, y: newY });
      }

      if (storageKey) {
        localStorage.setItem(`smokescreen_size_${storageKey}`, JSON.stringify({ width: newWidth, height: newHeight }));
        localStorage.setItem(`smokescreen_pos_${storageKey}`, JSON.stringify({ x: newX, y: newY }));
      }
    }
  }, [isResizing, resizeDir, setPosition, storageKey]);

  const onMouseUp = useCallback(() => {
    setIsResizing(false);
    setResizeDir(null);
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
