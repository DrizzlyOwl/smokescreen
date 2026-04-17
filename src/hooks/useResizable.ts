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
        const potentialWidth = initialSizeRef.current.width + deltaX;
        // Clamp to min 200 and max based on window width
        newWidth = Math.max(200, Math.min(potentialWidth, window.innerWidth - initialPosRef.current.x));
      } else if (resizeDir.includes('w')) {
        const potentialWidth = initialSizeRef.current.width - deltaX;
        const potentialX = initialPosRef.current.x + deltaX;
        
        if (potentialX < 0) {
          // If trying to resize beyond left edge, clamp X to 0 and calculate width from there
          newX = 0;
          newWidth = initialSizeRef.current.width + initialPosRef.current.x;
        } else if (potentialWidth < 200) {
          // Clamp to min width
          newWidth = 200;
          newX = initialPosRef.current.x + (initialSizeRef.current.width - 200);
        } else {
          newWidth = potentialWidth;
          newX = potentialX;
        }
      }

      // Handle vertical
      if (resizeDir.includes('s')) {
        const potentialHeight = initialSizeRef.current.height + deltaY;
        // Clamp to min 100 and max based on window height
        newHeight = Math.max(100, Math.min(potentialHeight, window.innerHeight - initialPosRef.current.y));
      } else if (resizeDir.includes('n')) {
        const potentialHeight = initialSizeRef.current.height - deltaY;
        const potentialY = initialPosRef.current.y + deltaY;

        if (potentialY < 0) {
          // If trying to resize beyond top edge, clamp Y to 0 and calculate height from there
          newY = 0;
          newHeight = initialSizeRef.current.height + initialPosRef.current.y;
        } else if (potentialHeight < 100) {
          // Clamp to min height
          newHeight = 100;
          newY = initialPosRef.current.y + (initialSizeRef.current.height - 100);
        } else {
          newHeight = potentialHeight;
          newY = potentialY;
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
