import React from 'react';
import { Button } from './button';

const BeautifulButton = ({ 
  children, 
  variant = 'primary',
  size = 'default',
  gradient = true,
  glow = false,
  floating = false,
  className = '',
  ...props 
}) => {
  const variantClasses = {
    primary: gradient ? 'btn-gradient' : 'bg-blue-600 hover:bg-blue-700',
    secondary: 'bg-gray-600 hover:bg-gray-700',
    success: gradient ? 'gradient-success' : 'bg-green-600 hover:bg-green-700',
    warning: gradient ? 'gradient-warning' : 'bg-yellow-600 hover:bg-yellow-700',
    danger: gradient ? 'gradient-danger' : 'bg-red-600 hover:bg-red-700',
    info: gradient ? 'gradient-info' : 'bg-cyan-600 hover:bg-cyan-700',
    ghost: 'action-button-ghost',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    default: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl'
  };

  const baseClasses = `
    action-button
    ${variantClasses[variant] || variantClasses.primary}
    ${sizeClasses[size] || sizeClasses.default}
    ${glow ? 'pulse-glow' : ''}
    ${floating ? 'float' : ''}
    text-white font-semibold rounded-lg
    transition-all duration-300 ease-in-out
    ${className}
  `.trim();

  return (
    <Button className={baseClasses} {...props}>
      {children}
    </Button>
  );
};

export { BeautifulButton };
