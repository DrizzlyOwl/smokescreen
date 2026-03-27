import React from 'react';
import { Pane } from './Pane';

interface TechnicalPaneProps {
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
  footerText?: React.ReactNode;
  children: React.ReactNode;
}

export const TechnicalPane = ({
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
  footerText,
  children,
}: TechnicalPaneProps) => {
  const themeColor = iconColor || 'var(--terminal-green)';

  return (
    <Pane
      title={title}
      icon={icon}
      iconColor={themeColor}
      zIndex={zIndex}
      onFocus={onFocus}
      isActive={isActive}
      onClose={onClose}
      initialPos={initialPos}
      initialSize={initialSize}
    >
      <div
        style={{
          height: '100%',
          background: '#0a0c0f',
          padding: '30px',
          boxSizing: 'border-box',
          fontFamily: 'monospace',
          color: '#adbac7',
          lineHeight: '1.5',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <header
          style={{
            marginBottom: '30px',
            borderBottom: `2px solid ${themeColor}`,
            paddingBottom: '15px',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontSize: '0.8rem',
              color: themeColor,
              opacity: 0.6,
              letterSpacing: '2px',
            }}
          >
            CLASSIFICATION: {classification}
          </div>
          <h1
            style={{
              color: themeColor,
              fontSize: '1.5rem',
              margin: '5px 0 0 0',
              fontWeight: '900',
              textTransform: 'uppercase',
            }}
          >
            {paneTitle}
          </h1>
        </header>

        <div style={{ flex: 1 }}>{children}</div>

        {footerText && (
          <footer
            style={{
              marginTop: '40px',
              textAlign: 'center',
              opacity: 0.3,
              fontSize: '0.8rem',
              borderTop: '1px solid #1c2128',
              paddingTop: '20px',
              flexShrink: 0,
            }}
          >
            {footerText}
          </footer>
        )}
      </div>
    </Pane>
  );
};
