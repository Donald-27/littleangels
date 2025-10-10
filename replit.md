# Little Angels Academy School Management System

## Overview

Little Angels Academy is a comprehensive school management system designed to handle all aspects of school operations for Little Angels School in Eldoret, Kenya. The system provides role-based dashboards for administrators, teachers, students, parents, and drivers, enabling complete management of academic records, transport, fees, attendance, and communication.

The application is built as a modern React SPA with a focus on real-time data updates, secure authentication, and comprehensive CRUD operations across all entities. The system eliminates hardcoded data and provides a fully functional, production-ready platform for school administration.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (October 10, 2025)

### Comprehensive Features Update - Version 2.0

#### Enhanced GPS & Location Features
- **Enhanced Maps with Satellite Imagery**: Student registration now uses dual-layer maps (street + satellite) at zoom level 17 for precise building-level location selection
- **Driver Route Activation**: Real-time GPS tracking with automatic parent proximity alerts when bus is within 800m of student homes
- **Location-Based Attendance**: Teachers and staff can check-in/out with 30-meter GPS accuracy verification
- **Pickup/Dropoff Modes**: Drivers select trip type before route activation for targeted parent notifications

#### Academic & Analytics
- **Student Results Posting**: Teachers can post results with automatic grade calculation and analytics generation
- **Performance Analytics**: Auto-generated graphs showing term-by-term comparison, trends (improving/declining/stable), and subject performance
- **Result Slip Generation**: Automated PDF report card generation for parent distribution
- **Historical Comparison**: Visual charts comparing current vs previous term performance

#### Communication & Messaging
- **WhatsApp-Like Chat System**: Real-time messaging with direct messages and group chats
- **Class Group Chats**: Automatic class-based groups with teacher and parent admins
- **Driver-Parent Messaging**: Direct communication from driver dashboard to parents
- **Enhanced Notifications**: Role-based bulk messaging and delivery tracking

#### Admin Controls
- **School Settings Manager**: Admin can set GPS location, motto, vision, mission, flag, and logo
- **Attendance Radius Configuration**: Set verification radius for teacher/staff check-in (default 30m)
- **Bus Alert Radius**: Configure proximity alert distance for parent notifications (default 800m)
- **Interactive Route Mapping**: Create and edit bus routes with waypoints, bus, and driver assignments
- **All-Dashboard Visibility**: School branding (logo, motto, colors) displayed across all user dashboards

#### Staff Management
- **Comprehensive Staff Dashboard**: Dedicated dashboard for non-teaching staff (cooks, watchmen, cleaners, etc.)
- **Staff Type Differentiation**: Support for multiple staff types with role-specific features
- **Staff Attendance Tracking**: Location-based check-in/out with attendance statistics
- **Department Management**: Staff grouped by department with relevant information display

#### Parent Experience
- **Bus Proximity Alerts**: Receive real-time notifications when bus approaches (800m) and arrives
- **Results with Analytics**: View student performance with visual graphs and trend analysis
- **Multi-Child Support**: Manage and view results for multiple children from one account
- **Performance Trends**: See if child is improving, declining, or stable with percentage changes

#### Security & Configuration
- **Environment Variables**: Moved Supabase credentials from hardcoded to secure .env file
- **Database Migration**: Comprehensive SQL migration adding 10+ new tables for enhanced features
- **Location Services**: GPS verification using Haversine formula for accurate distance calculation
- **Real-time Updates**: Supabase realtime subscriptions for live data across all dashboards

### Test Accounts Available (Verified Working)
- **Admin:** kipropdonald27@gmail.com / admin123
- **Parent:** weldonkorir305@gmail.com / parent123
- **Teacher:** teacher1@school.com / teacher123  
- **Driver:** driver1@school.com / driver123
- **Accounts:** accounts@school.com / accounts123
- **Staff:** (Role accessible after running database migration)

**Note:** All passwords follow the pattern `[role]123`. See QUICK_START.md and COMPREHENSIVE_FEATURES_GUIDE.md for complete details.

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
- **Multi-role System**: Separate dashboard experiences for each user type (admin, teacher, parent, driver, accounts)
- **Secure App Metadata**: Role and school_id stored in server-controlled app_metadata to prevent privilege escalation
- **Permission-based Access**: Database-level security policies ensure users only access authorized data
- **Session Management**: Persistent sessions with automatic token refresh and secure role validation
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