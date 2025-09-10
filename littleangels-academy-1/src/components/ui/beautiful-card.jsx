import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';

const BeautifulCard = ({ 
  children, 
  className = '', 
  gradient = 'primary',
  hover = true,
  glow = false,
  floating = false,
  ...props 
}) => {
  const gradientClasses = {
    primary: 'gradient-primary',
    secondary: 'gradient-secondary',
    success: 'gradient-success',
    warning: 'gradient-warning',
    danger: 'gradient-danger',
    info: 'gradient-info',
    purple: 'gradient-purple',
    blue: 'gradient-blue',
    green: 'gradient-green',
    orange: 'gradient-orange',
    pink: 'gradient-pink'
  };

  const baseClasses = `
    stats-card
    ${hover ? 'card-hover' : ''}
    ${glow ? 'pulse-glow' : ''}
    ${floating ? 'float' : ''}
    ${gradientClasses[gradient] || gradientClasses.primary}
    ${className}
  `.trim();

  return (
    <Card className={baseClasses} {...props}>
      {children}
    </Card>
  );
};

const BeautifulCardHeader = ({ children, className = '', ...props }) => (
  <CardHeader className={`${className}`} {...props}>
    {children}
  </CardHeader>
);

const BeautifulCardTitle = ({ children, className = '', ...props }) => (
  <CardTitle className={`text-xl font-bold text-white ${className}`} {...props}>
    {children}
  </CardTitle>
);

const BeautifulCardContent = ({ children, className = '', ...props }) => (
  <CardContent className={`text-white ${className}`} {...props}>
    {children}
  </CardContent>
);

export { BeautifulCard, BeautifulCardHeader, BeautifulCardTitle, BeautifulCardContent };
