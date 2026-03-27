import React, { useState } from 'react';
import { Button } from './Button';
import { useDraggable } from '../hooks/useDraggable';
import { useResizable } from '../hooks/useResizable';

interface PaneProps {
  title: string;
  icon?: React.ReactNode;
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
  icon,
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
      className={`pane ${isActive ? 'active' : ''} ${isMinimized ? 'minimized' : ''}`}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        zIndex,
        borderColor: severityColor || undefined,
        transition: isResizing ? 'none' : undefined
      }}
    >
      {/* Header / Drag Handle */}
      <div 
        onMouseDown={onDragMouseDown}
        className={`drag-handle pane__header ${isDragging ? 'dragging' : ''}`}
      >
        <div className="drag-handle pane__title">
          {icon && (
            <div className="drag-handle" style={{ 
                color: iconColor || 'var(--terminal-green)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '20px',
                height: '20px',
                flexShrink: 0,
                marginRight: '8px'
            }}>
                {icon}
            </div>
          )}
          {isMinimized ? title.split('_').pop() : title}
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Button 
            onClick={toggleMinimize}
            size="small inline"
            style={{ width: '40px' }}
          >
            {isMinimized ? '+' : '−'}
          </Button>
          {onClose && (
            <Button 
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                variant="danger"
                size="small inline"
                style={{ width: '40px' }}
            >
                X
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div 
          className="pane__content"
          style={{ height: size.height }}
        >
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
