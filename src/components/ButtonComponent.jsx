

import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  isDisabled = false,
  fullWidth = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  // Base styles
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    borderRadius: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
    outline: 'none',
    gap: '8px',
  };

  // Size variants
  const sizeStyles = {
    small: {
      padding: '8px 16px',
      fontSize: '13px',
    },
    medium: {
      padding: '12px 24px',
      fontSize: '14px',
    },
    large: {
      padding: '16px 32px',
      fontSize: '16px',
    },
    xlarge: {
      padding: '14px',
      fontSize: '16px',
    },
  };

  // Color variants
  const variantStyles = {
    primary: {
      backgroundColor: '#10b981',
      color: 'white',
    },
    secondary: {
      backgroundColor: '#f3f4f6',
      color: '#374151',
    },
    outline: {
      backgroundColor: 'transparent',
      color: '#374151',
      border: '1px solid #d1d5db',
    },
    danger: {
      backgroundColor: '#ef4444',
      color: 'white',
    },
    success: {
      backgroundColor: '#10b981',
      color: 'white',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: '#374151',
    },
  };

  // Width
  const widthStyle = fullWidth ? { width: '100%' } : {};

  // Disabled / loading
  const disabledStyle =
    isDisabled || isLoading
      ? { opacity: 0.6, cursor: 'not-allowed' }
      : {};

  // Merge styles
  const buttonStyles = {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...widthStyle,
    ...disabledStyle,
  };

  return (
    <button
      style={buttonStyles}
      onClick={onClick}
      disabled={isDisabled || isLoading}
      type={type}
      className={`button ${className}`}
      {...props}
    >
      {isLoading ? (
        <CircularProgress
          size={18}
          thickness={5}
          sx={{
            color:
              variant === 'primary' ||
              variant === 'danger' ||
              variant === 'success'
                ? 'white'
                : '#374151',
          }}
        />
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
