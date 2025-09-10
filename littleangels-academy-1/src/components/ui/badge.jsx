import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        success: 'border-transparent bg-green-100 text-green-800 hover:bg-green-200',
        warning: 'border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
        danger: 'border-transparent bg-red-100 text-red-800 hover:bg-red-200',
        info: 'border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200',
        // Status-specific variants
        active: 'border-transparent bg-green-100 text-green-800',
        inactive: 'border-transparent bg-gray-100 text-gray-800',
        pending: 'border-transparent bg-yellow-100 text-yellow-800',
        completed: 'border-transparent bg-green-100 text-green-800',
        failed: 'border-transparent bg-red-100 text-red-800',
        cancelled: 'border-transparent bg-gray-100 text-gray-800',
        // Vehicle status
        maintenance: 'border-transparent bg-orange-100 text-orange-800',
        out_of_service: 'border-transparent bg-red-100 text-red-800',
        // Student status
        present: 'border-transparent bg-green-100 text-green-800',
        absent: 'border-transparent bg-red-100 text-red-800',
        late: 'border-transparent bg-yellow-100 text-yellow-800',
        early_pickup: 'border-transparent bg-blue-100 text-blue-800',
        missed: 'border-transparent bg-red-100 text-red-800',
        // Payment status
        paid: 'border-transparent bg-green-100 text-green-800',
        unpaid: 'border-transparent bg-red-100 text-red-800',
        overdue: 'border-transparent bg-red-100 text-red-800',
        refunded: 'border-transparent bg-blue-100 text-blue-800',
      },
      size: {
        default: 'px-2.5 py-0.5 text-xs',
        sm: 'px-2 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

function Badge({ className, variant, size, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

// Status badge with pulse animation for live statuses
function StatusBadge({ status, type = 'default', animate = false, className, ...props }) {
  const pulseClass = animate ? 'animate-pulse-glow' : '';
  
  return (
    <Badge
      variant={status}
      className={cn(pulseClass, className)}
      {...props}
    >
      {status.replace('_', ' ').toUpperCase()}
    </Badge>
  );
}

// Online status indicator
function OnlineIndicator({ isOnline = false, className, ...props }) {
  return (
    <div
      className={cn(
        'inline-flex h-2 w-2 rounded-full',
        isOnline ? 'bg-green-500 animate-pulse-glow' : 'bg-gray-400',
        className
      )}
      {...props}
    />
  );
}

export { Badge, StatusBadge, OnlineIndicator, badgeVariants };
