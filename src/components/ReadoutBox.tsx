import React from 'react';

interface ReadoutBoxProps {
  label?: string;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const ReadoutBox = ({ 
  label, 
  children, 
  headerRight, 
  footer,
  className = '', 
  style = {} 
}: ReadoutBoxProps) => {
  return (
    <div className={`excuse-box ${className}`} style={style}>
      {(label || headerRight) && (
        <div className="excuse-header">
          {label && <span className="excuse-label">{label}</span>}
          {headerRight}
        </div>
      )}
      <div className="excuse-content">
        {children}
      </div>
      {footer && (
        <div className="excuse-footer" style={{ marginTop: '15px' }}>
          {footer}
        </div>
      )}
    </div>
  );
};
