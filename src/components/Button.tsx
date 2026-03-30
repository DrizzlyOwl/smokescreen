import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'terminal' | 'primary' | 'danger' | 'ghost' | 'mobile' | 'mobile-outline';
  active?: boolean;
  size?: 'x-small' | 'small-inline' | 'medium-inline' | 'small' | 'large';
  fullWidth?: boolean;
}

export const Button = ({ 
  children, 
  variant = 'terminal', 
  active = false, 
  size = 'small',
  fullWidth = false,
  className = '',
  style = {},
  ...props 
}: ButtonProps) => {
  const baseClass = 'button';
  const variantClass = `${baseClass}--${variant}`;
  const sizeClass = `${baseClass}--${size.replace(' ', '-')}`;
  const activeClass = active ? `${baseClass}--active` : '';
  const fullWidthClass = fullWidth ? `${baseClass}--full-width` : '';

  return (
    <button 
      style={style}
      className={`${baseClass} ${variantClass} ${sizeClass} ${activeClass} ${fullWidthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
