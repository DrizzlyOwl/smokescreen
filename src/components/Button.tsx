import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'terminal' | 'primary' | 'danger' | 'mobile' | 'mobile-outline';
  active?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
}

export const Button = ({ 
  children, 
  variant = 'terminal', 
  active = false, 
  size = 'md',
  fullWidth = false,
  className = '',
  style = {},
  ...props 
}: ButtonProps) => {
  const getBaseStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      fontFamily: 'inherit',
      cursor: props.disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s ease',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      outline: 'none',
      boxSizing: 'border-box',
      width: fullWidth ? '100%' : 'auto',
      opacity: props.disabled ? 0.5 : 1,
    };

    if (variant === 'terminal') {
      return {
        ...base,
        background: active ? 'var(--terminal-green)' : 'transparent',
        border: '2px solid var(--terminal-green)',
        color: active ? 'var(--terminal-bg)' : 'var(--terminal-green)',
        padding: size === 'sm' ? '5px 10px' : size === 'lg' ? '15px 30px' : '10px 20px',
        fontSize: size === 'sm' ? 'var(--text-l4)' : size === 'lg' ? 'var(--text-l3)' : 'var(--text-l4)',
        fontWeight: 'bold',
        textShadow: active ? 'none' : '0 0 5px var(--terminal-green)',
        textTransform: 'uppercase',
      };
    }

    if (variant === 'primary') {
      return {
        ...base,
        background: 'rgba(13, 17, 13, 0.9)',
        border: '4px solid var(--terminal-green)',
        color: 'var(--terminal-green)',
        padding: '20px 50px',
        fontSize: 'var(--text-l2)',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        boxShadow: '0 0 15px var(--terminal-green)',
      };
    }

    if (variant === 'danger') {
        return {
          ...base,
          background: active ? 'var(--terminal-red)' : 'transparent',
          border: '2px solid var(--terminal-red)',
          color: active ? 'white' : 'var(--terminal-red)',
          padding: '10px 20px',
          fontSize: 'var(--text-l4)',
          fontWeight: 'bold',
          textShadow: active ? 'none' : '0 0 5px var(--terminal-red)',
          textTransform: 'uppercase',
        };
      }

    if (variant === 'mobile') {
      return {
        ...base,
        background: 'var(--terminal-green)',
        border: 'none',
        color: '#000',
        padding: '15px',
        borderRadius: '8px',
        fontWeight: 'bold',
        fontSize: 'var(--text-l4)',
      };
    }

    if (variant === 'mobile-outline') {
        return {
          ...base,
          background: 'transparent',
          border: '1px solid #35373b',
          color: '#fff',
          padding: '15px',
          borderRadius: '8px',
          fontSize: 'var(--text-l4)',
          fontWeight: 'bold',
        };
      }

    return base;
  };

  return (
    <button 
      style={{ ...getBaseStyles(), ...style }}
      className={`${variant}-button ${active ? 'active' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
