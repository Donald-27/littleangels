# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Little Angels Transport System is a comprehensive React-based web application designed for managing school transportation. The application uses Supabase (Postgres, Auth, Realtime, Storage) as its backend platform and Vite as the development build tool.

## Common Development Commands

### Installation and Setup
```bash
# Install dependencies (handles legacy peer deps automatically)
./start-dev.bat

# Or manually:
npm install --legacy-peer-deps
```

### Development
```bash
# Start development server (runs on port 3000)
npm run dev

# Configure Supabase
Create `.env.local` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

# Seed the database with sample data
npm run seed
```

### Build and Preview
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Code Quality
```bash
# Run ESLint
npm run lint

# Deploy to production
Deploy the web app (e.g., Netlify, Vercel) and set env vars.
```

## Architecture Overview

### Tech Stack
- **Frontend**: React 18 with Vite
- **Backend**: Supabase (Postgres + Auth + Realtime + Storage)
- **State Management**: Zustand + React Context
- **Styling**: Tailwind CSS with custom theme
- **Routing**: React Router v6
- **UI Components**: Custom components with Lucide React icons
- **Maps**: React Leaflet for GPS tracking
- **Charts**: Recharts for analytics
- **Notifications**: Sonner for toast notifications

### Project Structure
- `src/components/` - Reusable UI components organized by feature
- `src/pages/` - Page components organized by user role (admin, parent, teacher, driver, accounts)
- `src/contexts/` - React contexts for global state management
- `src/hooks/` - Custom React hooks
- `src/lib/` - Utility functions and configurations
- `src/services/` - External API integrations
- `database/` - Postgres schema for Supabase

### Key Architectural Patterns

#### Role-Based Access Control (RBAC)
The application implements strict role-based routing and component access:
- **Admin**: Full system management access
- **Parent**: Student tracking and communication
- **Teacher**: Student management and attendance
- **Driver**: Route management and real-time tracking
- **Accounts**: Financial management and reporting

User roles are enforced at both the routing level (`ProtectedRoute` component) and within individual components.

#### Real-Time Data Architecture
- The system relies on Supabase Realtime for live updates:
- Live GPS tracking of vehicles
- Real-time attendance updates
- Instant notifications across user roles
- Live dashboard updates

#### Multi-Entity Data Model
The database schema supports complex relationships:
- Schools → Users → Students → Routes → Vehicles
- Real-time tracking and attendance logging
- Comprehensive notification system
- Payment and financial tracking

### Component Organization

#### Layout Components (`src/components/layout/`)
- Navigation and sidebar components
- Role-specific layout wrappers
- Responsive design patterns

#### Feature Components (`src/components/`)
- `auth/` - Authentication components
- `shared/` - Reusable UI components
- `ui/` - Base UI components (buttons, forms, etc.)
- Role-specific components organized by user type

#### Page Structure (`src/pages/`)
Each user role has its own directory with:
- Dashboard with role-specific widgets
- Feature-specific pages (routes, students, payments)
- Real-time tracking interfaces

### State Management Strategy

#### Global State (Context)
- Authentication state managed via `AuthContext`
- User session persistence in localStorage
- Error handling and loading states

#### Server State (Supabase)
- All data fetching through Supabase client queries
- Real-time subscriptions for live updates
- Optimistic updates for better UX

#### Local State (Zustand + useState)
- Component-level state for UI interactions
- Form state management
- Temporary UI state (modals, tabs, etc.)

### Custom Styling System

The application uses a comprehensive Tailwind CSS configuration with:
- Custom color palette themed for Little Angels School
- Role-specific gradients and branding
- Custom animations and transitions
- Responsive design tokens

Brand colors include primary (blue), secondary (green), accent (amber), and specialized gradients for each user role.

### Development Workflow

#### Environment Setup
The project includes a Windows batch file (`start-dev.bat`) that:
1. Sets up Node.js path
2. Installs dependencies with legacy peer deps handling
3. Starts the development server

#### Path Aliases
Configured in `vite.config.js`:
- `@/` maps to `src/`
- `@/components` maps to `src/components`
- `@/pages` maps to `src/pages`
- Additional aliases for common directories

#### Development Server
- Vite dev server runs on port 3000
- Hot module replacement enabled
- Source maps disabled in production builds

### Key Features to Understand

#### QR Code Integration
Students have unique QR codes for attendance tracking. The system includes:
- QR code generation for each student
- Scanner integration for drivers/conductors
- Attendance logging with GPS coordinates

#### GPS Tracking System
Real-time vehicle tracking with:
- Live location updates
- Speed and heading monitoring
- Route deviation detection
- Parent notifications

#### Multi-Channel Notification System
Supports SMS, email, WhatsApp, and push notifications with:
- Role-based message routing
- Delivery confirmation tracking
- Emergency notification protocols

#### Payment Management
Integrated financial tracking with:
- Multiple payment methods (M-Pesa, bank transfer, cash)
- Fee calculation and billing
- Payment status tracking
- Financial reporting

### Common Development Patterns

#### Error Handling
- Toast notifications for user feedback
- Graceful error boundaries
- Loading states for async operations

#### Form Management
- Controlled components pattern
- Client-side validation
- Optimistic updates with Supabase mutations

#### Mobile-First Design
- Responsive layouts using Tailwind breakpoints
- Touch-friendly interfaces
- Progressive enhancement

### Database Schema Understanding

The database includes these key entities:
- `schools` - Multi-tenant school information
- `users` - All system users with role-based access
- `students` - Student profiles with transport and medical info
- `vehicles` - Fleet management with GPS integration
- `routes` - Transport routes with stops and schedules
- `attendance` - Daily attendance tracking
- `liveTracking` - Real-time GPS data
- `notifications` - Multi-channel messaging system
- `payments` - Financial transactions

### Testing Approach

Currently, the project doesn't include a formal testing framework setup. When adding tests, consider:
- Unit tests for utility functions
- Component testing for UI interactions
- Integration tests for data operations
- E2E tests for critical user workflows

### Performance Considerations

#### Optimizations in Place
- React Query caching with 5-minute stale time
- Image optimization for avatars and photos
- Lazy loading for route-based code splitting
- Efficient re-renders with React.memo where needed

#### Real-Time Data Optimization
- Selective subscriptions to reduce bandwidth
- Pagination for large datasets
- Background sync for offline capability

### Security Considerations

#### Authentication
- Session-based authentication with localStorage persistence
- Role validation at multiple levels
- Protected route enforcement

#### Data Access
- User-scoped data queries
- Role-based data filtering
- Secure data access through Supabase RLS policies

This codebase represents a production-ready school transport management system with real-time capabilities, comprehensive user management, and mobile-responsive design.
