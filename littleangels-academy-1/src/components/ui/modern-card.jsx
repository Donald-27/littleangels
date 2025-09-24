import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { cn } from '@/lib/utils';

/**
 * Modern Card Component with Teal→Violet→Coral Gradient Theme
 * Features enhanced glassmorphism, micro-interactions, and colorful gradients
 */
const ModernCard = React.forwardRef(({ 
  children, 
  className = '', 
  variant = 'glass',
  gradient = 'primary',
  hover = true,
  glow = false,
  floating = false,
  onClick,
  ...props 
}, ref) => {
  
  const variantStyles = {
    glass: 'bg-white/15 backdrop-blur-[24px] border border-white/25',
    solid: 'bg-white border border-gray-200',
    gradient: 'border-0',
    outline: 'bg-transparent border-2'
  };

  const gradientStyles = {
    primary: 'bg-gradient-to-br from-teal-500 via-violet-500 to-orange-500',
    teal: 'bg-gradient-to-br from-teal-600 to-teal-400',
    violet: 'bg-gradient-to-br from-violet-600 to-violet-400', 
    coral: 'bg-gradient-to-br from-orange-600 to-orange-400',
    'teal-violet': 'bg-gradient-to-br from-teal-500 to-violet-500',
    'violet-coral': 'bg-gradient-to-br from-violet-500 to-orange-500',
    'teal-coral': 'bg-gradient-to-br from-teal-500 to-orange-500'
  };

  const glowStyles = {
    primary: 'shadow-[0_8px_32px_rgba(139,92,246,0.2)]',
    teal: 'shadow-[0_8px_32px_rgba(20,184,166,0.2)]',
    violet: 'shadow-[0_8px_32px_rgba(139,92,246,0.2)]',
    coral: 'shadow-[0_8px_32px_rgba(249,115,22,0.2)]',
    'teal-violet': 'shadow-[0_8px_32px_rgba(20,184,166,0.15),0_8px_32px_rgba(139,92,246,0.15)]',
    'violet-coral': 'shadow-[0_8px_32px_rgba(139,92,246,0.15),0_8px_32px_rgba(249,115,22,0.15)]',
    'teal-coral': 'shadow-[0_8px_32px_rgba(20,184,166,0.15),0_8px_32px_rgba(249,115,22,0.15)]'
  };

  const baseClasses = cn(
    // Base styles
    'rounded-[20px] p-6 transition-all duration-300 ease-out',
    
    // Variant styles
    variant === 'gradient' 
      ? gradientStyles[gradient] || gradientStyles.primary
      : variantStyles[variant],
    
    // Hover effects
    hover && [
      'hover:transform hover:-translate-y-2 hover:scale-[1.02]',
      'hover:shadow-[0_20px_60px_rgba(0,0,0,0.1)]',
      variant === 'glass' && 'hover:bg-white/20 hover:border-white/30'
    ],
    
    // Glow effects
    glow && (glowStyles[gradient] || glowStyles.primary),
    
    // Floating animation
    floating && 'animate-pulse',
    
    // Interactive cursor
    onClick && 'cursor-pointer',
    
    className
  );

  return (
    <Card 
      ref={ref}
      className={baseClasses}
      onClick={onClick}
      {...props}
    >
      {children}
    </Card>
  );
});

ModernCard.displayName = 'ModernCard';

/**
 * Modern Card Header with enhanced styling
 */
const ModernCardHeader = React.forwardRef(({ 
  children, 
  className = '', 
  gradient = false,
  ...props 
}, ref) => (
  <CardHeader 
    ref={ref}
    className={cn(
      'pb-4',
      gradient && 'bg-gradient-to-r from-teal-500/10 via-violet-500/10 to-orange-500/10 rounded-t-[16px] -m-6 mb-4 p-6',
      className
    )} 
    {...props}
  >
    {children}
  </CardHeader>
));

ModernCardHeader.displayName = 'ModernCardHeader';

/**
 * Modern Card Title with gradient text option
 */
const ModernCardTitle = React.forwardRef(({ 
  children, 
  className = '', 
  gradient = false,
  gradientType = 'primary',
  ...props 
}, ref) => {
  
  const gradientTextStyles = {
    primary: 'bg-gradient-to-r from-teal-500 via-violet-500 to-orange-500 bg-clip-text text-transparent',
    teal: 'bg-gradient-to-r from-teal-600 to-teal-400 bg-clip-text text-transparent',
    violet: 'bg-gradient-to-r from-violet-600 to-violet-400 bg-clip-text text-transparent',
    coral: 'bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent'
  };

  return (
    <CardTitle 
      ref={ref}
      className={cn(
        'text-xl font-bold',
        gradient 
          ? gradientTextStyles[gradientType] || gradientTextStyles.primary
          : 'text-gray-900',
        className
      )} 
      {...props}
    >
      {children}
    </CardTitle>
  );
});

ModernCardTitle.displayName = 'ModernCardTitle';

/**
 * Modern Card Content with enhanced spacing
 */
const ModernCardContent = React.forwardRef(({ 
  children, 
  className = '', 
  ...props 
}, ref) => (
  <CardContent 
    ref={ref}
    className={cn('pt-0 text-gray-700', className)} 
    {...props}
  >
    {children}
  </CardContent>
));

ModernCardContent.displayName = 'ModernCardContent';

/**
 * Stats Card with modern gradient design
 */
const ModernStatsCard = React.forwardRef(({
  title,
  value,
  subtitle,
  icon,
  trend,
  gradient = 'primary',
  className = '',
  ...props
}, ref) => {
  
  const trendColor = trend && trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600';
  
  return (
    <ModernCard
      ref={ref}
      variant="glass"
      gradient={gradient}
      hover={true}
      glow={true}
      className={cn('relative overflow-hidden', className)}
      {...props}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500 via-violet-500 to-orange-500" />
      </div>
      
      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <ModernCardTitle gradient={true} gradientType={gradient} className="text-lg mb-2">
              {title}
            </ModernCardTitle>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {value}
            </div>
            {subtitle && (
              <p className="text-sm text-gray-600">{subtitle}</p>
            )}
            {trend !== undefined && (
              <div className={cn('text-sm font-medium mt-2', trendColor)}>
                {trend > 0 ? '↗' : trend < 0 ? '↘' : '→'} {Math.abs(trend)}%
              </div>
            )}
          </div>
          {icon && (
            <div className="ml-4 text-2xl opacity-70">
              {icon}
            </div>
          )}
        </div>
      </div>
    </ModernCard>
  );
});

ModernStatsCard.displayName = 'ModernStatsCard';

export { 
  ModernCard, 
  ModernCardHeader, 
  ModernCardTitle, 
  ModernCardContent,
  ModernStatsCard
};