import React, { useState } from 'react';
import { Button } from './Button';
import { useDraggable } from '../hooks/useDraggable';
import { useResizable } from '../hooks/useResizable';
import { MinimizeIcon, MaximizeIcon, CloseIcon } from './Icons';
import type { PaneId } from '../hooks/useWindowManager';
import '../styles/Pane.scss';

interface PaneProps {
  id: PaneId;
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
  id,
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

  const { position, onMouseDown: onDragMouseDown, isDragging } = useDraggable(initialPos, id);
  const { size, onResizeMouseDown, isResizing } = useResizable(initialSize, id);

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
      className={`pane ${isActive ? 'active' : ''} ${isMinimized ? 'minimized' : ''} ${isDragging ? 'dragging' : ''}`}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        zIndex,
        borderColor: severityColor || undefined,
        transition: isResizing ? 'none' : undefined,
        opacity: isDragging ? 0.7 : 1
      }}
    >
      {/* Header / Drag Handle */}
      <div 
        onMouseDown={onDragMouseDown}
        className={`drag-handle pane__header ${isDragging ? 'dragging' : ''}`}
      >
        <div className="drag-handle pane__title">
          {icon && (
            <div className="drag-handle pane__icon" style={{ color: iconColor || 'var(--terminal-green)' }}>
                {icon}
            </div>
          )}
          {isMinimized ? title.split('_').pop() : title}
        </div>
        <div className="pane__actions">
          <Button 
            onClick={toggleMinimize}
            size="x-small"
            className="pane__action-button"
          >
            {isMinimized ? <MaximizeIcon /> : <MinimizeIcon />}
          </Button>
          {onClose && (
            <Button 
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                variant="danger"
                size="x-small"
                className="pane__action-button"
            >
                <CloseIcon />
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
            className="pane__resize-handle"
          />
        </div>
      )}
    </div>
  );
};
