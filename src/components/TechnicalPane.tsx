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
  footerText?: React.ReactNode;
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
  footerText,
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

        {footerText && (
          <footer className="technical-pane__footer">
            {footerText}
          </footer>
        )}
      </div>
    </Pane>
  );
};
