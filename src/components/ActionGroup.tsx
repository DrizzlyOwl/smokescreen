import React from 'react';

interface ActionGroupProps {
  label: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const ActionGroup = ({ label, children, className = '', style = {} }: ActionGroupProps) => {
  return (
    <div className={`action-group ${className}`} style={style}>
      <label className="action-label">{label}</label>
      <div className="action-buttons">
        {children}
      </div>
    </div>
  );
};
