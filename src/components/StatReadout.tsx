import React from 'react';
import '../styles/StatReadout.scss';

interface StatReadoutProps {
  label: string;
  value: string | number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  trend?: 'up' | 'down' | 'neutral';
}

export const StatReadout = ({ 
  label, 
  value, 
  color,
  className = '', 
  style = {},
  trend
}: StatReadoutProps) => {
  return (
    <div className={`stat-readout ${className} ${trend ? `stat-readout--trend-${trend}` : ''}`} style={style}>
      <span className="stat-readout__label">{label}:</span>{' '}
      <span 
        className="stat-readout__value" 
        style={color ? { color } : {}}
      >
        {value}
      </span>
    </div>
  );
};
