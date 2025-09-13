# Little Angels Academy School Management System

## Overview

Little Angels Academy is a comprehensive school management system designed to handle all aspects of school operations for Little Angels School in Eldoret, Kenya. The system provides role-based dashboards for administrators, teachers, students, parents, and drivers, enabling complete management of academic records, transport, fees, attendance, and communication.

The application is built as a modern React SPA with a focus on real-time data updates, secure authentication, and comprehensive CRUD operations across all entities. The system eliminates hardcoded data and provides a fully functional, production-ready platform for school administration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with Vite as the build tool
- **Routing**: React Router DOM v6 for client-side navigation with role-based route protection
- **State Management**: Zustand for global state management, React Query for server state
- **UI Framework**: Tailwind CSS with custom design system and Radix UI components
- **Component Architecture**: Modular component structure with shared UI components and page-specific components
- **Real-time Updates**: Supabase realtime subscriptions for live data synchronization across dashboards

### Backend Architecture
- **Database**: PostgreSQL via Supabase with comprehensive relational schema
- **Authentication**: Supabase Auth with role-based access control (admin, teacher, student, parent, driver)
- **API Layer**: Supabase client-side SDK for database operations and real-time subscriptions
- **File Storage**: Supabase Storage for handling images, documents, report cards, and bus route maps
- **Security**: Row Level Security (RLS) policies for fine-grained data access control

### Data Model Design
- **Core Entities**: schools, users, students, teachers, parents, drivers, buses, routes, classes
- **Academic Data**: attendance, grades, subjects, terms, report_cards
- **Transport Management**: bus_assignments, route_stops, trip_logs
- **Financial**: fees, fee_payments, fee_categories
- **Communication**: announcements, notifications, messages
- **System**: activity_logs, settings, user_permissions

### Authentication & Authorization
- **Multi-role System**: Separate dashboard experiences for each user type
- **Permission-based Access**: Database-level security policies ensure users only access authorized data
- **Session Management**: Persistent sessions with automatic token refresh
- **Profile Management**: User metadata stored in profiles table with role assignments

### Real-time Features
- **Live Updates**: Automatic UI updates when data changes across all connected clients
- **Notification System**: Real-time announcements and alerts
- **Activity Tracking**: Live activity logs for administrative oversight
- **Status Updates**: Real-time bus tracking and attendance updates

### Data Visualization
- **Charts & Analytics**: Recharts library for attendance, fee, and performance analytics
- **Export Capabilities**: PDF generation with jsPDF and Excel export with XLSX
- **Interactive Maps**: Leaflet integration for bus route visualization
- **QR Code Integration**: Student and bus QR codes for quick identification

## External Dependencies

### Core Infrastructure
- **Supabase**: Complete backend-as-a-service providing PostgreSQL database, authentication, real-time subscriptions, and file storage
- **Vite**: Fast build tool and development server for modern web applications

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Radix UI**: Unstyled, accessible UI primitives (@radix-ui/react-slot, @radix-ui/react-tabs)
- **Lucide React**: Modern icon library for consistent iconography
- **Framer Motion**: Animation library for smooth UI transitions

### Data Management
- **TanStack React Query**: Server state management with caching and synchronization
- **Zustand**: Lightweight state management for client-side state
- **React Router DOM**: Client-side routing with nested layouts

### Maps & Location
- **Leaflet**: Open-source mapping library for interactive maps
- **React Leaflet**: React components for Leaflet integration

### Document Generation
- **jsPDF**: PDF generation for reports and documents
- **html2canvas**: HTML to canvas conversion for PDF generation
- **XLSX**: Excel file generation and parsing for data import/export
- **QRCode**: QR code generation for student and bus identification

### File Handling
- **React Dropzone**: File upload component with drag-and-drop support
- **html5-qrcode**: QR code scanning functionality

### Utilities
- **date-fns**: Date manipulation and formatting
- **bcryptjs**: Password hashing for additional security
- **clsx & tailwind-merge**: Conditional CSS class management
- **React Hot Toast & Sonner**: Toast notification systems

### Development Tools
- **ESLint**: Code linting and quality enforcement
- **PostCSS & Autoprefixer**: CSS processing and vendor prefixing
- **dotenv**: Environment variable management