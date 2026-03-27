import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'terminal' | 'primary' | 'danger' | 'mobile' | 'mobile-outline';
  active?: boolean;
  size?: 'small inline' | 'medium inline' | 'small' | 'large';
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
  const getPaddingAndFontSize = () => {
    switch (size) {
        case 'small inline': return { padding: '6px 12px', fontSize: 'var(--text-l4)' };
        case 'medium inline': return { padding: '10px 18px', fontSize: 'var(--text-l3)' };
        case 'small': return { padding: '14px 28px', fontSize: 'var(--text-l3)' };
        case 'large': return { padding: '20px 45px', fontSize: 'var(--text-l2)' };
        default: return { padding: '14px 28px', fontSize: 'var(--text-l3)' };
    }
  };

  const dims = getPaddingAndFontSize();

  const combinedStyle: React.CSSProperties = {
    ...dims,
    width: fullWidth ? '100%' : 'auto',
    ...style
  };

  return (
    <button 
      style={combinedStyle}
      className={`${variant}-button ${active ? 'active' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
