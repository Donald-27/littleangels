import React from 'react';
import { cn } from '@/lib/utils';

const Card = React.forwardRef(({ className, variant = 'default', ...props }, ref) => {
  const variants = {
    default: 'bg-card text-card-foreground shadow-lg hover:shadow-xl transition-all duration-300 border border-border',
    gradient: 'bg-gradient-to-br from-white to-gray-50 shadow-lg hover:shadow-xl transition-all duration-300 border border-border',
    admin: 'bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300',
    parent: 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 shadow-lg hover:shadow-xl transition-all duration-300',
    teacher: 'bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 shadow-lg hover:shadow-xl transition-all duration-300',
    driver: 'bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 shadow-lg hover:shadow-xl transition-all duration-300',
    accounts: 'bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300',
    interactive: 'bg-card text-card-foreground shadow-lg hover:shadow-xl transition-all duration-300 border border-border hover:scale-105 cursor-pointer',
    glass: 'bg-white/70 backdrop-blur-md border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'rounded-xl overflow-hidden',
        variants[variant],
        className
      )}
      {...props}
    />
  );
});
Card.displayName = 'Card';

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-2xl font-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

// Specialized cards for the transport system
const StatsCard = React.forwardRef(({ 
  title, 
  value, 
  description, 
  icon, 
  trend, 
  trendValue,
  variant = 'default',
  className,
  ...props 
}, ref) => (
  <Card ref={ref} variant={variant} className={cn('p-6', className)} {...props}>
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </p>
        <div className="flex items-baseline space-x-2">
          <p className="text-3xl font-bold text-foreground">
            {value}
          </p>
          {trend && trendValue && (
            <span className={cn(
              'text-xs font-medium px-2 py-1 rounded-full',
              trend === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            )}>
              {trend === 'up' ? '↑' : '↓'} {trendValue}
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </div>
      {icon && (
        <div className="flex-shrink-0 ml-4">
          <div className={cn(
            'w-12 h-12 rounded-lg flex items-center justify-center',
            'bg-gradient-to-br from-primary/10 to-primary/20'
          )}>
            {icon}
          </div>
        </div>
      )}
    </div>
  </Card>
));
StatsCard.displayName = 'StatsCard';

const DashboardCard = React.forwardRef(({
  title,
  description,
  children,
  headerAction,
  variant = 'default',
  className,
  ...props
}, ref) => (
  <Card ref={ref} variant={variant} className={className} {...props}>
    <CardHeader className="pb-4">
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="text-lg">{title}</CardTitle>
          {description && (
            <CardDescription>{description}</CardDescription>
          )}
        </div>
        {headerAction && (
          <div className="flex-shrink-0">
            {headerAction}
          </div>
        )}
      </div>
    </CardHeader>
    <CardContent>
      {children}
    </CardContent>
  </Card>
));
DashboardCard.displayName = 'DashboardCard';

export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent,
  StatsCard,
  DashboardCard
};
