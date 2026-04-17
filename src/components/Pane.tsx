import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { useDraggable } from '../hooks/useDraggable';
import { useResizable } from '../hooks/useResizable';
import { MinimizeIcon, MaximizeIcon, CloseIcon, PopOutIcon, PopInIcon, SnapLeftIcon, SnapRightIcon } from './Icons';
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
  isPoppedOut?: boolean;
  onPopOutToggle?: () => void;
  isSnappedMain?: boolean;
  onSnapMainToggle?: () => void;
  isActive?: boolean;
  defaultMinimized?: boolean;
  onMinimizeToggle?: (minimized: boolean) => void;
  onClose?: () => void;
  headerExtras?: React.ReactNode;
}

export const Pane = ({
  id,
  title,
  icon,
  iconColor,
  initialPos,
  initialSize,
  zIndex,
  onFocus,
  children,
  severityColor,
  isMinimized: controlledMinimized,
  isPoppedOut = false,
  onPopOutToggle,
  isSnappedMain = false,
  onSnapMainToggle,
  isActive = false,
  defaultMinimized = false,
  onMinimizeToggle,
  onClose,
  headerExtras
}: PaneProps) => {
  const [internalMinimized, setInternalMinimized] = useState(defaultMinimized);
  const isMinimized = controlledMinimized !== undefined ? controlledMinimized : internalMinimized;

  // Use the explicit isPoppedOut prop
  const isTiled = !isPoppedOut;
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const { position, setPosition, onMouseDown: onDragMouseDown, isDragging } = useDraggable(initialPos || { x: 50, y: 50 }, id);
  const { size, onResizeMouseDown } = useResizable(initialSize || { width: 600, height: 400 }, id, position, setPosition);

  const toggleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMinimizeToggle) {
      onMinimizeToggle(!isMinimized);
    } else {
      setInternalMinimized(!isMinimized);
    }
  };

  const paneStyle: React.CSSProperties = (isTiled && !isMobile) ? {
    position: 'relative',
    width: '100%',
    height: isMinimized ? 'auto' : '100%',
    zIndex: 1,
    flex: isMinimized ? '0 0 auto' : '1',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0
  } : isMobile ? {
    position: 'relative',
    width: '100%',
    height: isMinimized ? 'auto' : 'auto', // Stacked on mobile
    left: 0,
    top: 0,
    zIndex: isActive ? 100 : 1,
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '10px'
  } : {
    position: 'absolute',
    left: position.x,
    top: position.y,
    width: size.width,
    height: isMinimized ? 'auto' : size.height,
    zIndex,
    opacity: isDragging ? 0.7 : 1,
    display: 'flex',
    flexDirection: 'column'
  };

  if (severityColor) paneStyle.borderColor = severityColor;

  return (
    <div 
      onMouseDown={onFocus}
      className={`pane ${isActive ? 'active' : ''} ${isMinimized ? 'minimized' : ''} ${isDragging ? 'dragging' : ''} ${isTiled ? 'pane--tiled' : ''} ${isMobile ? 'pane--mobile' : ''}`}
      style={paneStyle}
    >
      {/* Header */}
      <div 
        onMouseDown={(!isTiled && !isMobile) ? onDragMouseDown : undefined}
        className={`pane__header ${isDragging ? 'dragging' : ''} ${(!isTiled && !isMobile) ? 'drag-handle' : ''}`}
      >
        <div className="pane__title">
          {icon && (
            <div className="pane__icon" style={{ color: iconColor || 'var(--terminal-green)' }}>
                {icon}
            </div>
          )}
          {title}
        </div>
        
        {headerExtras && (
          <div className="pane__header-extras">
            {headerExtras}
          </div>
        )}

        <div className="pane__actions">
          {onSnapMainToggle && !isPoppedOut && (
            <Button 
                onClick={(e) => { e.stopPropagation(); onSnapMainToggle(); }}
                size="x-small"
                className="pane__action-button"
                title={isSnappedMain ? "Snap to sidebar" : "Snap to main area"}
            >
                {isSnappedMain ? <SnapRightIcon /> : <SnapLeftIcon />}
            </Button>
          )}
          {onPopOutToggle && (
            <Button 
                onClick={(e) => { e.stopPropagation(); onPopOutToggle(); }}
                size="x-small"
                className="pane__action-button"
                title={isPoppedOut ? "Snap into grid" : "Pop out to window"}
            >
                {isPoppedOut ? <PopInIcon /> : <PopOutIcon />}
            </Button>
          )}
          <Button 
              onClick={toggleMinimize}
              size="x-small"
              className="pane__action-button"
              title={isMinimized ? "Maximize" : "Minimize"}
          >
              {isMinimized ? <MaximizeIcon /> : <MinimizeIcon />}
          </Button>
          {onClose && id !== 'terminal' && (
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
          style={{ flex: 1, minHeight: 0 }}
        >
          {children}
          
          {!isTiled && (
            <>
              <div onMouseDown={(e) => onResizeMouseDown(e, 'n')} className="pane__resize-handle pane__resize-handle--n" />
              <div onMouseDown={(e) => onResizeMouseDown(e, 's')} className="pane__resize-handle pane__resize-handle--s" />
              <div onMouseDown={(e) => onResizeMouseDown(e, 'e')} className="pane__resize-handle pane__resize-handle--e" />
              <div onMouseDown={(e) => onResizeMouseDown(e, 'w')} className="pane__resize-handle pane__resize-handle--w" />
              <div onMouseDown={(e) => onResizeMouseDown(e, 'nw')} className="pane__resize-handle pane__resize-handle--nw" />
              <div onMouseDown={(e) => onResizeMouseDown(e, 'ne')} className="pane__resize-handle pane__resize-handle--ne" />
              <div onMouseDown={(event) => onResizeMouseDown(event, 'sw')} className="pane__resize-handle pane__resize-handle--sw" />
              <div onMouseDown={(event) => onResizeMouseDown(event, 'se')} className="pane__resize-handle pane__resize-handle--se" />
            </>
          )}
        </div>
      )}
    </div>
  );
};
