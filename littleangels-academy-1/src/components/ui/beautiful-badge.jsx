import React from 'react';

const BeautifulBadge = ({ 
  children, 
  variant = 'primary',
  size = 'default',
  gradient = true,
  className = '',
  ...props 
}) => {
  const variantClasses = {
    primary: gradient ? 'badge-gradient' : 'bg-blue-100 text-blue-800',
    success: gradient ? 'badge-success' : 'bg-green-100 text-green-800',
    warning: gradient ? 'badge-warning' : 'bg-yellow-100 text-yellow-800',
    danger: gradient ? 'badge-danger' : 'bg-red-100 text-red-800',
    info: gradient ? 'badge-info' : 'bg-cyan-100 text-cyan-800',
    secondary: 'bg-gray-100 text-gray-800',
    outline: 'border border-gray-300 text-gray-700'
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    default: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const baseClasses = `
    inline-flex items-center rounded-full font-medium
    ${variantClasses[variant] || variantClasses.primary}
    ${sizeClasses[size] || sizeClasses.default}
    ${className}
  `.trim();

  return (
    <span className={baseClasses} {...props}>
      {children}
    </span>
  );
};

export { BeautifulBadge };
