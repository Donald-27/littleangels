# Overview

Smart School Transport is a comprehensive school transportation management system designed to provide real-time tracking, safety monitoring, and communication between parents, drivers, administrators, and students. The application offers role-based dashboards for different user types (parents, drivers, admins) with features including live bus tracking, student check-in via QR codes, environmental impact monitoring, achievement systems, and comprehensive notification management.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The application is built using React 19 with TypeScript, implementing a single-page application (SPA) architecture. The frontend uses Vite as the build tool and development server, providing fast hot module replacement and optimized builds. The routing is handled by React Router DOM v7, enabling client-side navigation between different role-based dashboards.

## UI Framework and Styling
The application leverages shadcn/ui components built on top of Radix UI primitives for accessible, customizable components. Styling is implemented using Tailwind CSS v4 with custom CSS variables for theming support. The design system includes dark/light mode support via next-themes, with custom color schemes and responsive breakpoints. Component variants are managed using class-variance-authority for type-safe styling.

## State Management
State management is handled through multiple approaches:
- Convex for server state and real-time data synchronization
- React Query (TanStack Query) for additional client-side caching and data fetching
- React Hook Form for form state management with Zod validation
- React Context for global UI state (theme, sidebar, auth)

## Authentication System
Authentication is implemented using OpenID Connect (OIDC) with react-oidc-context, integrating with Hercules authentication service. The system supports automatic token refresh and provides hooks for user authentication state management. User sessions are managed client-side with automatic redirect handling.

## Real-time Data Layer
Convex serves as the primary backend-as-a-service, providing:
- Real-time database with live queries and subscriptions
- Serverless functions for business logic
- Built-in authentication integration
- WebSocket connections for instant data updates

## Data Schema Design
The database schema includes core entities:
- **branches**: School branch locations with geographic coordinates
- **vehicles**: Bus/van fleet management with capacity, status, and assignment tracking
- **users**: Multi-role user system (parents, admins, drivers, conductors)
- **students**: Student profiles with branch and vehicle assignments
- **routes**: Transportation routes with stop sequences and timing
- **tracking**: Real-time location data for vehicles
- **notifications**: User-targeted messaging system
- **attendance**: Student boarding/alighting records

## Component Architecture
The application follows a hierarchical component structure:
- **Pages**: Route-level components for different user dashboards
- **Feature Components**: Specialized components for specific functionality (LiveBusTracker, DigitalID, etc.)
- **UI Components**: Reusable design system components
- **Provider Components**: Context providers for global state management

## Mobile-First Design
The application implements responsive design patterns with mobile-first considerations, using Tailwind's responsive utilities and custom hooks for device detection. The interface adapts to different screen sizes while maintaining functionality across devices.

# External Dependencies

## Core Framework Dependencies
- **React 19**: Frontend framework with latest concurrent features
- **TypeScript**: Type safety and enhanced developer experience
- **Vite**: Build tool and development server with hot reload
- **Tailwind CSS v4**: Utility-first CSS framework for styling

## Backend Services
- **Convex**: Backend-as-a-service for real-time database, serverless functions, and authentication
- **Hercules Platform**: Development platform providing OIDC authentication and deployment infrastructure

## Authentication & Identity
- **react-oidc-context**: OpenID Connect client for authentication flows
- **oidc-client-ts**: Core OIDC functionality and token management

## UI Component Library
- **Radix UI**: Headless component primitives for accessibility
- **shadcn/ui**: Pre-built component library with customizable design system
- **Lucide React**: Icon library for consistent iconography
- **next-themes**: Theme management for dark/light mode support

## Data Management
- **TanStack React Query**: Server state management and caching
- **React Hook Form**: Form state management with performance optimization
- **Zod**: Runtime type validation for form inputs and API responses

## Utility Libraries
- **date-fns**: Date manipulation and formatting
- **class-variance-authority**: Type-safe component variant management
- **clsx & tailwind-merge**: Conditional className utilities
- **motion**: Animation library for UI transitions

## Development Tools
- **ESLint**: Code linting with Convex and Hercules specific rules
- **Prettier**: Code formatting with import sorting
- **TypeScript ESLint**: TypeScript-specific linting rules

## Additional Features
- **qrcode**: QR code generation for digital student IDs
- **recharts**: Chart library for analytics and metrics visualization
- **embla-carousel**: Carousel component for image galleries
- **vaul**: Drawer component for mobile-optimized interfaces
- **sonner**: Toast notification system
- **use-debounce**: Input debouncing for search and real-time features