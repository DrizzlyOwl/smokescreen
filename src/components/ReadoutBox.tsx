import React from 'react';
import { Pane } from './Pane';
import { LogsIcon } from './Icons';
import '../styles/ReadoutBox.scss';

interface ReadoutBoxProps {
  title: string;
  label?: string;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  contentRef?: React.RefObject<HTMLDivElement | null>;
  // Window management props
  zIndex: number;
  onFocus: () => void;
  isActive: boolean;
  onClose: () => void;
  isMinimized: boolean;
  onMinimizeToggle: () => void;
  isPoppedOut?: boolean;
  onPopOutToggle?: () => void;
  isSnappedMain?: boolean;
  onSnapMainToggle?: () => void;
  initialPos?: { x: number, y: number };
  initialSize?: { width: number, height: number };
}

export const ReadoutBox = ({ 
  title,
  label, 
  children, 
  headerRight, 
  footer,
  className = '', 
  style = {},
  contentRef,
  zIndex,
  onFocus,
  isActive,
  onClose,
  isMinimized,
  onMinimizeToggle,
  isPoppedOut,
  onPopOutToggle,
  isSnappedMain,
  onSnapMainToggle,
  initialPos = { x: 450, y: 100 },
  initialSize = { width: 500, height: 450 }
}: ReadoutBoxProps) => {
  return (
    <Pane
      id="readout"
      title={title}
      icon={<LogsIcon />}
      zIndex={zIndex}
      onFocus={onFocus}
      isActive={isActive}
      isMinimized={isMinimized}
      onMinimizeToggle={onMinimizeToggle}
      isPoppedOut={isPoppedOut}
      onPopOutToggle={onPopOutToggle}
      isSnappedMain={isSnappedMain}
      onSnapMainToggle={onSnapMainToggle}
      onClose={onClose}
      initialPos={initialPos}
      initialSize={initialSize}
    >
      <div className={`readout-box ${className}`} style={{ ...style, height: '100%', border: 'none', marginTop: 0 }}>
        {(label || headerRight) && (
          <div className="readout-box__header">
            {label && <span className="readout-box__label">{label}</span>}
            {headerRight}
          </div>
        )}
        <div className="readout-box__content" ref={contentRef}>
          {children}
        </div>
        {footer && (
          <div className="readout-box__footer">
            {footer}
          </div>
        )}
      </div>
    </Pane>
  );
};
