import React from 'react';

interface ActionGroupProps {
  label: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  variant?: 'default' | 'grid';
}

export const ActionGroup = ({ label, children, className = '', style = {}, variant = 'default' }: ActionGroupProps) => {
  const baseClass = 'action-group';
  const variantClass = variant === 'grid' ? `${baseClass}__buttons--grid` : `${baseClass}__buttons`;

  return (
    <div className={`${baseClass} ${className}`} style={style}>
      <label className={`${baseClass}__label`}>{label}</label>
      <div className={variantClass}>
        {children}
      </div>
    </div>
  );
};
