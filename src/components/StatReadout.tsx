import React from 'react';

interface StatReadoutProps {
  label: string;
  value: string | number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const StatReadout = ({ 
  label, 
  value, 
  color,
  className = '', 
  style = {} 
}: StatReadoutProps) => {
  return (
    <div className={className} style={{ ...style, display: 'inline-block' }}>
      <span className="stat-label">{label}:</span>{' '}
      <span className="stat-value" style={{ color: color || 'var(--terminal-green)', fontWeight: 'bold' }}>
        {value}
      </span>
    </div>
  );
};
