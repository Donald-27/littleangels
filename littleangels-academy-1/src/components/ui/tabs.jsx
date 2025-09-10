import React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

// Custom Dashboard Tabs for Little Angels School
const DashboardTabs = React.forwardRef(({ className, variant = 'default', ...props }, ref) => {
  const variants = {
    default: 'bg-white/50 backdrop-blur-sm border border-white/20',
    admin: 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200',
    parent: 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200',
    teacher: 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200',
    driver: 'bg-gradient-to-r from-red-50 to-rose-50 border border-red-200',
    accounts: 'bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200',
  };

  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        'inline-flex h-12 items-center justify-center rounded-lg p-1 text-muted-foreground shadow-sm',
        variants[variant],
        className
      )}
      {...props}
    />
  );
});
DashboardTabs.displayName = 'DashboardTabs';

const DashboardTabsTrigger = React.forwardRef(({ className, variant = 'default', active = false, ...props }, ref) => {
  const variants = {
    default: active ? 'bg-white text-foreground shadow-sm' : 'hover:bg-white/50',
    admin: active ? 'bg-white text-blue-700 shadow-sm' : 'hover:bg-white/50',
    parent: active ? 'bg-white text-green-700 shadow-sm' : 'hover:bg-white/50',
    teacher: active ? 'bg-white text-orange-700 shadow-sm' : 'hover:bg-white/50',
    driver: active ? 'bg-white text-red-700 shadow-sm' : 'hover:bg-white/50',
    accounts: active ? 'bg-white text-purple-700 shadow-sm' : 'hover:bg-white/50',
  };

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        className
      )}
      {...props}
    />
  );
});
DashboardTabsTrigger.displayName = 'DashboardTabsTrigger';

export { Tabs, TabsList, TabsTrigger, TabsContent, DashboardTabs, DashboardTabsTrigger };
