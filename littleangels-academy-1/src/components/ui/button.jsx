import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        admin: 'bg-admin-gradient text-white hover:opacity-90 shadow-lg hover:shadow-xl',
        parent: 'bg-parent-gradient text-white hover:opacity-90 shadow-lg hover:shadow-xl',
        teacher: 'bg-teacher-gradient text-white hover:opacity-90 shadow-lg hover:shadow-xl',
        driver: 'bg-driver-gradient text-white hover:opacity-90 shadow-lg hover:shadow-xl',
        accounts: 'bg-accounts-gradient text-white hover:opacity-90 shadow-lg hover:shadow-xl',
        success: 'bg-success text-white hover:bg-success/90 shadow-lg',
        warning: 'bg-warning text-white hover:bg-warning/90 shadow-lg',
        danger: 'bg-danger text-white hover:bg-danger/90 shadow-lg',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        xl: 'h-12 rounded-lg px-10 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, loading = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <div className="mr-2 h-4 w-4 loading-spinner" />
      )}
      {props.children}
    </Comp>
  );
});

Button.displayName = 'Button';

export { Button, buttonVariants };
