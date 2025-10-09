import React from 'react';
import { cn } from '@/lib/utils';

const Progress = React.forwardRef(({ className, value = 0, max = 100, indicatorClassName, ...props }, ref) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  return (
    <div
      ref={ref}
      className={cn(
        'relative h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'h-full bg-primary transition-all duration-300 ease-in-out',
          indicatorClassName
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
});

Progress.displayName = 'Progress';

export { Progress };
