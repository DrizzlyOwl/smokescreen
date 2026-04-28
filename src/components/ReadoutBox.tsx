import React from 'react';
import { Pane } from './Pane';
import { LogsIcon } from './Icons';
import '../styles/ReadoutBox.scss';

interface ReadoutBoxProps {
  title: string;
  label?: string;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
  metadata?: {
    version?: string;
    source?: string;
    authority?: string;
  };
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
  metadata,
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
        <footer className="technical-pane__footer">
          <div className="technical-pane__footer-col">
            <span className="technical-pane__footer-label">DOC_VER</span>
            <span className="technical-pane__footer-value">{metadata?.version || '2026.04.17'}</span>
          </div>
          <div className="technical-pane__footer-col">
            <span className="technical-pane__footer-label">SOURCE</span>
            <span className="technical-pane__footer-value">{metadata?.source || 'SYSTEM_CORE'}</span>
          </div>
          <div className="technical-pane__footer-col">
            <span className="technical-pane__footer-label">AUTHORITY</span>
            <span className="technical-pane__footer-value">{metadata?.authority || 'SRE_COMMAND'}</span>
          </div>
        </footer>
      </div>
    </Pane>
  );
};
