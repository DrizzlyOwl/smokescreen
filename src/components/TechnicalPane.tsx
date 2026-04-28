import React from 'react';
import { Pane } from './Pane';
import type { PaneId } from '../hooks/useWindowManager';
import '../styles/TechnicalPane.scss';

interface TechnicalPaneProps {
  id: PaneId;
  title: string;
  paneTitle: string;
  classification?: string;
  icon?: React.ReactNode;
  iconColor?: string;
  initialPos?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  zIndex: number;
  onFocus: () => void;
  isActive?: boolean;
  onClose?: () => void;
  isMinimized: boolean;
  onMinimizeToggle: () => void;
  isPoppedOut?: boolean;
  onPopOutToggle?: () => void;
  isSnappedMain?: boolean;
  onSnapMainToggle?: () => void;
  metadata?: {
    version?: string;
    source?: string;
    authority?: string;
  };
  children: React.ReactNode;
}

export const TechnicalPane = ({
  id,
  title,
  paneTitle,
  classification = 'INTERNAL_ONLY',
  icon,
  iconColor,
  initialPos,
  initialSize = { width: 450, height: 500 },
  zIndex,
  onFocus,
  isActive,
  onClose,
  isMinimized,
  onMinimizeToggle,
  isPoppedOut = false,
  onPopOutToggle,
  isSnappedMain = false,
  onSnapMainToggle,
  metadata,
  children,
}: TechnicalPaneProps) => {
  const themeColor = iconColor || 'var(--terminal-green)';

  return (
    <Pane
      id={id}
      title={title}
      icon={icon}
      iconColor={themeColor}
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
      <div className="technical-pane">
        <header 
          className="technical-pane__header"
          style={{ borderBottomColor: themeColor }}
        >
          <div className="technical-pane__label" style={{ color: themeColor }}>
            CLASSIFICATION: {classification}
          </div>
          <h1 className="technical-pane__title" style={{ color: themeColor }}>
            {paneTitle}
          </h1>
        </header>

        <div className="technical-pane__content">{children}</div>

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
