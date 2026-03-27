import React from 'react';
import { Pane } from './Pane';
import { TechnicalTypography as Ty } from '../styles/Typography';

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
          padding: '20px',
          boxSizing: 'border-box',
          fontFamily: 'monospace',
          color: '#adbac7',
          lineHeight: '1.5',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          fontSize: '16px',
        }}
      >
        <header
          style={{
            marginBottom: '20px',
            borderBottom: `2px solid ${themeColor}`,
            paddingBottom: '12px',
            flexShrink: 0,
          }}
        >
          <div style={Ty.label(themeColor)}>
            CLASSIFICATION: {classification}
          </div>
          <h1 style={Ty.title(themeColor)}>
            {paneTitle}
          </h1>
        </header>

        <div style={{ flex: 1 }}>{children}</div>

        {footerText && (
          <footer
            style={{
              marginTop: '40px',
              textAlign: Ty.footer.textAlign,
              opacity: Ty.footer.opacity,
              fontSize: Ty.footer.fontSize,
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
