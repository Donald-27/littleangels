import React from 'react';
import { Input } from './input';

const BeautifulInput = ({ 
  className = '',
  beautiful = true,
  ...props 
}) => {
  const baseClasses = beautiful ? 'input-beautiful' : '';
  
  return (
    <Input 
      className={`${baseClasses} ${className}`} 
      {...props} 
    />
  );
};

export default BeautifulInput;
