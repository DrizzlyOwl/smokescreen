import React from 'react';
import '../styles/StatReadout.scss';

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
    <div className={`stat-readout ${className}`} style={style}>
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
