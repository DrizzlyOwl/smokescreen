import React from 'react';
import '../styles/Screen.scss';

interface ScreenProps {
  /** Screen title shown in header */
  title: string;
  /** Optional icon */
  icon?: React.ReactNode;
  /** Icon color (defaults to terminal green) */
  iconColor?: string;
  /** Screen content */
  children: React.ReactNode;
  /** Optional header right content */
  headerRight?: React.ReactNode;
}

/**
 * Screen is a simplified container for full-viewport screen content.
 * Unlike Pane, it has no drag/resize/minimize/popout functionality.
 * Used in the new screen-based navigation system.
 */
export const Screen: React.FC<ScreenProps> = ({
  title,
  icon,
  iconColor,
  children,
  headerRight,
}) => {
  return (
    <div className="screen">
      <div className="screen__header">
        <div className="screen__title">
          {icon && (
            <div className="screen__icon" style={{ color: iconColor || 'var(--terminal-green)' }}>
              {icon}
            </div>
          )}
          {title}
        </div>
        
        {headerRight && (
          <div className="screen__header-right">
            {headerRight}
          </div>
        )}
      </div>

      <div className="screen__content">
        {children}
      </div>
    </div>
  );
};
