import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Modern Button Component with Teal→Violet→Coral Gradient Theme
 * Features enhanced micro-interactions, glassmorphism effects, and shimmer animations
 */
const modernButtonVariants = cva(
  'relative inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-semibold transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 overflow-hidden group',
  {
    variants: {
      variant: {
        // Gradient variants with teal→violet→coral theme
        primary: [
          'bg-gradient-to-r from-teal-500 via-violet-500 to-orange-500 text-white',
          'hover:shadow-[0_8px_32px_rgba(139,92,246,0.25)] hover:-translate-y-1',
          'active:translate-y-0 active:scale-[0.98]'
        ],
        teal: [
          'bg-gradient-to-r from-teal-600 to-teal-400 text-white',
          'hover:shadow-[0_8px_32px_rgba(20,184,166,0.25)] hover:-translate-y-1',
          'active:translate-y-0 active:scale-[0.98]'
        ],
        violet: [
          'bg-gradient-to-r from-violet-600 to-violet-400 text-white',
          'hover:shadow-[0_8px_32px_rgba(139,92,246,0.25)] hover:-translate-y-1',
          'active:translate-y-0 active:scale-[0.98]'
        ],
        coral: [
          'bg-gradient-to-r from-orange-600 to-orange-400 text-white',
          'hover:shadow-[0_8px_32px_rgba(249,115,22,0.25)] hover:-translate-y-1',
          'active:translate-y-0 active:scale-[0.98]'
        ],
        
        // Glass morphism variants
        glass: [
          'bg-white/15 backdrop-blur-[24px] border border-white/25 text-gray-900',
          'hover:bg-white/25 hover:border-white/40 hover:-translate-y-1',
          'hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)]'
        ],
        'glass-teal': [
          'bg-teal-500/10 backdrop-blur-[24px] border border-teal-500/30 text-teal-700',
          'hover:bg-teal-500/20 hover:border-teal-500/50 hover:-translate-y-1',
          'hover:shadow-[0_8px_32px_rgba(20,184,166,0.15)]'
        ],
        'glass-violet': [
          'bg-violet-500/10 backdrop-blur-[24px] border border-violet-500/30 text-violet-700',
          'hover:bg-violet-500/20 hover:border-violet-500/50 hover:-translate-y-1',
          'hover:shadow-[0_8px_32px_rgba(139,92,246,0.15)]'
        ],
        'glass-coral': [
          'bg-orange-500/10 backdrop-blur-[24px] border border-orange-500/30 text-orange-700',
          'hover:bg-orange-500/20 hover:border-orange-500/50 hover:-translate-y-1',
          'hover:shadow-[0_8px_32px_rgba(249,115,22,0.15)]'
        ],
        
        // Outline variants
        outline: [
          'border-2 border-gray-300 bg-transparent text-gray-700',
          'hover:bg-gray-50 hover:border-gray-400'
        ],
        'outline-teal': [
          'border-2 border-teal-500 bg-transparent text-teal-600',
          'hover:bg-teal-50 hover:border-teal-600'
        ],
        'outline-violet': [
          'border-2 border-violet-500 bg-transparent text-violet-600',
          'hover:bg-violet-50 hover:border-violet-600'
        ],
        'outline-coral': [
          'border-2 border-orange-500 bg-transparent text-orange-600',
          'hover:bg-orange-50 hover:border-orange-600'
        ],
        
        // Soft variants
        'soft-teal': [
          'bg-teal-100 text-teal-700 border border-teal-200',
          'hover:bg-teal-200 hover:border-teal-300'
        ],
        'soft-violet': [
          'bg-violet-100 text-violet-700 border border-violet-200',
          'hover:bg-violet-200 hover:border-violet-300'
        ],
        'soft-coral': [
          'bg-orange-100 text-orange-700 border border-orange-200',
          'hover:bg-orange-200 hover:border-orange-300'
        ],
        
        // Ghost variant
        ghost: [
          'bg-transparent text-gray-700',
          'hover:bg-gray-100'
        ],
        
        // Danger variant
        destructive: [
          'bg-gradient-to-r from-red-600 to-red-400 text-white',
          'hover:shadow-[0_8px_32px_rgba(239,68,68,0.25)] hover:-translate-y-1'
        ]
      },
      size: {
        sm: 'h-9 px-4 py-2 text-xs rounded-xl',
        default: 'h-11 px-6 py-3 text-sm',
        lg: 'h-12 px-8 py-4 text-base rounded-3xl',
        xl: 'h-14 px-10 py-5 text-lg rounded-3xl',
        icon: 'h-11 w-11'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default'
    }
  }
);

const ModernButton = React.forwardRef(({ 
  className, 
  variant, 
  size, 
  asChild = false, 
  loading = false,
  shimmer = false,
  children,
  ...props 
}, ref) => {
  const Comp = asChild ? Slot : 'button';
  
  return (
    <Comp
      className={cn(modernButtonVariants({ variant, size, className }))}
      ref={ref}
      disabled={loading || props.disabled}
      {...props}
    >
      {/* Shimmer effect overlay */}
      {shimmer && (
        <div className="absolute inset-0 -top-[2px] -bottom-[2px] bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out" />
      )}
      
      {/* Loading spinner */}
      {loading && (
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      
      {children}
    </Comp>
  );
});

ModernButton.displayName = 'ModernButton';

/**
 * Icon Button with modern styling
 */
const ModernIconButton = React.forwardRef(({
  icon,
  variant = 'glass',
  size = 'default',
  className,
  ...props
}, ref) => {
  return (
    <ModernButton
      ref={ref}
      variant={variant}
      size="icon"
      className={cn('rounded-full', className)}
      {...props}
    >
      {icon}
    </ModernButton>
  );
});

ModernIconButton.displayName = 'ModernIconButton';

/**
 * Button Group with modern styling
 */
const ModernButtonGroup = React.forwardRef(({
  children,
  className,
  orientation = 'horizontal',
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'inline-flex',
        orientation === 'horizontal' 
          ? 'flex-row [&>*:not(:first-child)]:ml-[-1px] [&>*:not(:first-child)]:rounded-l-none [&>*:not(:last-child)]:rounded-r-none'
          : 'flex-col [&>*:not(:first-child)]:mt-[-1px] [&>*:not(:first-child)]:rounded-t-none [&>*:not(:last-child)]:rounded-b-none',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

ModernButtonGroup.displayName = 'ModernButtonGroup';

export { 
  ModernButton, 
  ModernIconButton, 
  ModernButtonGroup,
  modernButtonVariants 
};