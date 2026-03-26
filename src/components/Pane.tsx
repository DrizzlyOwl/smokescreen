import React, { useState } from 'react';
import { useDraggable } from '../hooks/useDraggable';
import { useResizable } from '../hooks/useResizable';
import { PANE_STYLES } from '../styles/panes';

interface PaneProps {
  title: string;
  icon?: string;
  iconColor?: string;
  initialPos?: { x: number, y: number };
  initialSize?: { width: number, height: number };
  zIndex: number;
  onFocus: () => void;
  children: React.ReactNode;
  severityColor?: string;
  isMinimized?: boolean;
  isActive?: boolean;
  defaultMinimized?: boolean;
  onMinimizeToggle?: (minimized: boolean) => void;
  onClose?: () => void;
}

export const Pane = ({
  title,
  icon = '#',
  iconColor,
  initialPos = { x: 100, y: 100 },
  initialSize = { width: 450, height: 350 },
  zIndex,
  onFocus,
  children,
  severityColor,
  isMinimized: controlledMinimized,
  isActive = false,
  defaultMinimized = false,
  onMinimizeToggle,
  onClose
}: PaneProps) => {
  const [internalMinimized, setInternalMinimized] = useState(defaultMinimized);
  const isMinimized = controlledMinimized !== undefined ? controlledMinimized : internalMinimized;

  const { position, onMouseDown: onDragMouseDown, isDragging } = useDraggable(initialPos);
  const { size, onResizeMouseDown, isResizing } = useResizable(initialSize);

  const toggleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMinimizeToggle) {
      onMinimizeToggle(!isMinimized);
    } else {
      setInternalMinimized(!isMinimized);
    }
  };

  return (
    <div 
      onMouseDown={onFocus}
      style={{
        ...PANE_STYLES.container(isMinimized, `${size.width}px`, zIndex, isActive),
        left: position.x,
        top: position.y,
        border: severityColor ? `1px solid ${severityColor}` : (isActive ? '1px solid var(--terminal-green)' : '1px solid #35373b'),
        boxShadow: isDragging || isResizing ? '0 8px 32px rgba(0, 0, 0, 0.8)' : (isActive ? '0 0 20px rgba(24, 255, 98, 0.2)' : '0 4px 12px rgba(0, 0, 0, 0.4)'),
        opacity: isDragging ? 0.8 : 1,
        transition: isResizing ? 'none' : 'width 0.3s ease, opacity 0.2s ease, border-color 0.2s ease'
      }}
    >
      {/* Header / Drag Handle */}
      <div 
        onMouseDown={onDragMouseDown}
        className="drag-handle" 
        style={PANE_STYLES.header(isDragging, isActive)}
      >
        <div className="drag-handle" style={PANE_STYLES.headerTitle}>
          <span className="drag-handle" style={{ color: iconColor || 'var(--terminal-green)' }}>{icon}</span>
          {isMinimized ? title.split('_').pop() : title}
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button 
            onClick={toggleMinimize}
            style={PANE_STYLES.minimizeBtn}>
            {isMinimized ? '[+]' : '[−]'}
          </button>
          {onClose && (
            <button 
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                style={{ ...PANE_STYLES.minimizeBtn, color: 'var(--terminal-red)' }}>
                [X]
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div style={{
          ...PANE_STYLES.content(`${size.height}px`),
          position: 'relative'
        }}>
          {children}
          
          {/* Resize Handle */}
          <div 
            onMouseDown={onResizeMouseDown}
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: '15px',
              height: '15px',
              cursor: 'nwse-resize',
              background: 'linear-gradient(135deg, transparent 50%, #35373b 50%)',
              zIndex: 10
            }}
          />
        </div>
      )}
    </div>
  );
};
