# Little Angels Academy - Complete Setup Guide

## 🚀 Quick Start

### 1. Environment Setup

Create a `.env.local` file in the root directory with the following content:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://zvkfuljxidxtuqrmquso.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2a2Z1bGp4aWR4dHVxcm1xdXNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5NTQxMTgsImV4cCI6MjA3MTUzMDExOH0.aL72I0Ls2ziZs2EJaX_bpMkI9gj8AGHFModINaQVb_8

# Service Role Key (for server-side operations)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2a2Z1bGp4aWR4dHVxcm1xdXNvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTk1NDExOCwiZXhwIjoyMDcxNTMwMTE4fQ.VaBDMxzRGjrNnzkaABjL3nhOL37pfCYGo3gwew9piAk

# JWT Secret
SUPABASE_JWT_SECRET=c0F6fODkXb3tFizctX9hQ4rO4Rv/GIZhKNZOD+VIoE6kagzsHzRo3TemrSOjlc212gmRuPCmD4Vnz8LQ0OweLQ==

# App Configuration
VITE_APP_NAME=Little Angels Academy
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development

# Map Configuration (for GPS tracking)
VITE_MAPBOX_TOKEN=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw

# SMS Configuration (for notifications)
VITE_SMS_API_KEY=your_sms_api_key_here
VITE_SMS_SENDER_ID=LittleAngels

# M-Pesa Configuration (for payments)
VITE_MPESA_CONSUMER_KEY=your_mpesa_consumer_key
VITE_MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
VITE_MPESA_SHORTCODE=your_mpesa_shortcode
VITE_MPESA_PASSKEY=your_mpesa_passkey

# Email Configuration
VITE_EMAIL_FROM=noreply@littleangels.ac.ke
VITE_EMAIL_SERVICE=gmail

# School Configuration
VITE_SCHOOL_NAME=Little Angels Academy
VITE_SCHOOL_ADDRESS=Nairobi, Kenya
VITE_SCHOOL_PHONE=+254700000000
VITE_SCHOOL_EMAIL=info@littleangels.ac.ke
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Database Setup

1. Go to your Supabase dashboard: https://zvkfuljxidxtuqrmquso.supabase.co
2. Navigate to SQL Editor
3. Run the schema from `database/schema.sql`
4. Run the seed data from `scripts/seed.js`

### 4. Start Development Server

```bash
npm run dev
# or
yarn dev
```

## 🔑 Supabase Credentials

**Project URL:** https://zvkfuljxidxtuqrmquso.supabase.co

**Anon Public Key:** 
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2a2Z1bGp4aWR4dHVxcm1xdXNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5NTQxMTgsImV4cCI6MjA3MTUzMDExOH0.aL72I0Ls2ziZs2EJaX_bpMkI9gj8AGHFModINaQVb_8
```

**Service Role Key:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2a2Z1bGp4aWR4dHVxcm1xdXNvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTk1NDExOCwiZXhwIjoyMDcxNTMwMTE4fQ.VaBDMxzRGjrNnzkaABjL3nhOL37pfCYGo3gwew9piAk
```

**Legacy JWT Secret:**
```
c0F6fODkXb3tFizctX9hQ4rO4Rv/GIZhKNZOD+VIoE6kagzsHzRo3TemrSOjlc212gmRuPCmD4Vnz8LQ0OweLQ==
```

## 🏗️ Features Implemented

### Core Features
- ✅ User Authentication & Authorization
- ✅ Multi-role Dashboard System (Admin, Teacher, Parent, Driver, Accounts)
- ✅ Student Management
- ✅ Staff Management
- ✅ Vehicle Management
- ✅ Route Management
- ✅ Real-time GPS Tracking
- ✅ Attendance Tracking
- ✅ Payment Management (M-Pesa Integration)
- ✅ Notification System
- ✅ Reports & Analytics

### Kenya-Specific Features
- ✅ M-Pesa Payment Integration
- ✅ SMS Notifications
- ✅ Local Transport Routes
- ✅ Kenyan School System Integration
- ✅ Local Time Zone Support
- ✅ Swahili Language Support (Partial)

### Real-time Features
- ✅ Live Bus Tracking
- ✅ Real-time Notifications
- ✅ Live Attendance Updates
- ✅ Real-time Payment Status
- ✅ Live Route Updates

## 🚌 GPS Tracking Setup

The app includes real GPS tracking functionality:

1. **Driver App**: Drivers can update their location in real-time
2. **Parent App**: Parents can track their children's bus location
3. **Admin Dashboard**: Real-time monitoring of all vehicles
4. **Emergency Features**: Panic buttons and emergency notifications

## 💰 Payment Integration

### M-Pesa Integration
- STK Push for payments
- Payment confirmation
- Receipt generation
- Payment history tracking

### Payment Types
- Transport fees
- Late fees
- Registration fees
- Penalties
- Refunds

## 📱 Mobile Responsiveness

The app is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- Progressive Web App (PWA) support

## 🔒 Security Features

- Row Level Security (RLS) enabled
- JWT-based authentication
- Role-based access control
- Data encryption
- Secure API endpoints

## 📊 Analytics & Reporting

- Student attendance reports
- Transport efficiency reports
- Payment reports
- Route optimization analytics
- Driver performance metrics
- Vehicle maintenance tracking

## 🚨 Emergency Features

- Panic button for drivers
- Emergency notifications
- Real-time location sharing
- Emergency contact system
- Incident reporting

## 🌍 Localization

- English (Primary)
- Swahili (Partial)
- Kenyan time zone (EAT)
- Local currency (KES)
- Local phone number formats

## 📞 Support

For technical support or feature requests, contact:
- Email: info@littleangels.ac.ke
- Phone: +254700000000

## 🔄 Updates

This system is continuously updated with new features and improvements. Check the changelog for latest updates.

---

**Note**: This is a production-ready school transport management system specifically designed for Kenyan schools with real GPS tracking, M-Pesa payments, and comprehensive management features.
