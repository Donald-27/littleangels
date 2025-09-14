# Little Angels Academy - Complete School Transport Management System

A comprehensive, production-ready school transport management system specifically designed for Kenyan schools with real GPS tracking, M-Pesa payments, and multi-role dashboards.

## 🌟 Features

### Core Features
- ✅ **Multi-Role Authentication** - Admin, Teacher, Parent, Driver, Accounts
- ✅ **Real-time GPS Tracking** - Live bus location tracking with maps
- ✅ **Student Management** - Complete student profiles with medical info
- ✅ **Vehicle Management** - Fleet management with maintenance tracking
- ✅ **Route Management** - Dynamic routes with stops and schedules
- ✅ **Attendance Tracking** - Real-time attendance with QR codes
- ✅ **Payment Management** - M-Pesa integration for transport fees
- ✅ **Notification System** - SMS, Email, Push notifications
- ✅ **Reports & Analytics** - Comprehensive reporting dashboard

### Kenya-Specific Features
- ✅ **M-Pesa Payment Integration** - STK Push for seamless payments
- ✅ **SMS Notifications** - Africa's Talking SMS integration
- ✅ **Local Transport Routes** - Kenyan school system integration
- ✅ **Local Time Zone Support** - Africa/Nairobi timezone
- ✅ **Swahili Language Support** - Partial localization
- ✅ **Kenyan Phone Number Formats** - Automatic validation

### Real-time Features
- ✅ **Live Bus Tracking** - Real-time GPS location updates
- ✅ **Real-time Notifications** - Instant alerts for parents
- ✅ **Live Attendance Updates** - Real-time attendance status
- ✅ **Real-time Payment Status** - Instant payment confirmations
- ✅ **Live Route Updates** - Dynamic route adjustments

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (credentials provided)

### 1. Clone and Install
```bash
git clone <repository-url>
cd littleangels-academy-1
npm install
```

### 2. Environment Setup
Create a `.env.local` file in the root directory:

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

### 3. Database Setup
```bash
# Run the complete setup (database + seed data)
npm run setup

# Or run individually:
npm run setup-db  # Setup database schema and seed data
npm run dev       # Start development server
```

### 4. Access the Application
Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🔑 Login Credentials

After running the setup, you can login with these credentials:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@littleangels.ac.ke | admin123 |
| **Parent** | weldonkorir305@gmail.com | parent123 |
| **Teacher** | sarah.mutai@littleangels.ac.ke | teacher123 |
| **Driver** | john.mwangi@littleangels.ac.ke | driver123 |
| **Accounts** | grace.wanjiku@littleangels.ac.ke | accounts123 |

## 📱 User Roles & Features

### 👨‍💼 Admin Dashboard
- Complete system overview and analytics
- Manage all users, students, vehicles, and routes
- View real-time tracking of all vehicles
- Generate comprehensive reports
- Manage school settings and configurations
- Monitor payment status and financial reports

### 👨‍👩‍👧‍👦 Parent Dashboard
- Track children's bus location in real-time
- View attendance history and status
- Receive notifications for bus arrivals
- Make M-Pesa payments for transport fees
- View children's academic and transport information
- Emergency contact and communication

### 👨‍🏫 Teacher Dashboard
- View assigned students and their information
- Track student attendance and transport status
- Access student medical information for emergencies
- Communicate with parents and administration
- View class schedules and transport routes

### 🚌 Driver Dashboard
- Real-time GPS tracking and location sharing
- Mark student attendance with QR code scanning
- Emergency alert system with panic button
- View assigned routes and student information
- Update vehicle status and maintenance information
- Receive notifications and route updates

### 💰 Accounts Dashboard
- Manage all financial transactions
- Process M-Pesa payments and refunds
- Generate payment reports and receipts
- Monitor outstanding payments
- Manage transport fee structures
- Financial analytics and reporting

## 🗺️ GPS Tracking Features

### Real-time Location Tracking
- **Driver App**: Drivers can share their location in real-time
- **Parent App**: Parents can track their children's bus location
- **Admin Dashboard**: Real-time monitoring of all vehicles
- **Emergency Features**: Panic buttons and emergency notifications

### Map Integration
- Interactive maps with route visualization
- Real-time vehicle markers with status indicators
- Route stops and pickup points
- Estimated arrival times
- Traffic-aware route optimization

## 💳 M-Pesa Payment Integration

### Payment Features
- **STK Push**: Seamless payment initiation
- **Payment Confirmation**: Automatic payment verification
- **Receipt Generation**: Digital payment receipts
- **Payment History**: Complete transaction history
- **Refund Processing**: Automated refund handling

### Payment Types
- Transport fees (monthly/termly)
- Late fees and penalties
- Registration fees
- Emergency payments
- Refunds and adjustments

## 📊 Analytics & Reporting

### Comprehensive Reports
- Student attendance reports
- Transport efficiency analytics
- Payment and financial reports
- Route optimization metrics
- Driver performance tracking
- Vehicle maintenance schedules

### Real-time Analytics
- Live dashboard with key metrics
- Interactive charts and graphs
- Exportable reports (PDF, Excel)
- Custom date range filtering
- Automated report scheduling

## 🔔 Notification System

### Multi-channel Notifications
- **SMS**: Africa's Talking SMS integration
- **Email**: Automated email notifications
- **Push**: Real-time push notifications
- **WhatsApp**: WhatsApp Business API (optional)

### Notification Types
- Bus arrival and departure alerts
- Payment confirmations and reminders
- Emergency alerts and safety notifications
- Attendance updates and reports
- Route changes and schedule updates

## 🛡️ Security Features

### Data Protection
- Row Level Security (RLS) enabled
- JWT-based authentication
- Role-based access control
- Data encryption in transit and at rest
- Secure API endpoints

### Privacy Compliance
- GDPR-compliant data handling
- User consent management
- Data retention policies
- Secure data deletion
- Audit logging

## 🌍 Localization

### Language Support
- **English** (Primary)
- **Swahili** (Partial)
- **Localization Ready** for additional languages

### Regional Features
- **Kenyan Time Zone** (EAT)
- **Local Currency** (KES)
- **Kenyan Phone Formats** (+254)
- **Local Address Formats**
- **Cultural Considerations**

## 📱 Mobile Responsiveness

The application is fully responsive and optimized for:
- **Desktop Computers** (Full feature access)
- **Tablets** (Touch-optimized interface)
- **Mobile Phones** (Progressive Web App)
- **Offline Capability** (Service worker support)

## 🚨 Emergency Features

### Safety Systems
- **Panic Button**: Instant emergency alerts
- **Emergency Location Sharing**: Real-time location broadcasting
- **Emergency Contacts**: Automated notification system
- **Incident Reporting**: Comprehensive incident management
- **Safety Protocols**: Automated safety procedures

## 🔧 Development

### Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Maps**: Leaflet, OpenStreetMap
- **Payments**: M-Pesa API
- **Notifications**: Africa's Talking SMS
- **State Management**: Zustand
- **UI Components**: Radix UI, Lucide Icons

### Development Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run setup-db     # Setup database
npm run seed         # Seed database with sample data
```

### Project Structure
```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts (Auth, Notifications)
├── hooks/              # Custom React hooks
├── layouts/            # Page layouts
├── lib/                # Utility libraries
├── pages/              # Page components
├── services/           # API services (GPS, M-Pesa, Notifications)
└── styles/             # Global styles
```

## 🚀 Deployment

### Production Deployment
1. **Environment Setup**: Configure production environment variables
2. **Database Migration**: Run database migrations
3. **Build Application**: `npm run build`
4. **Deploy**: Deploy to your preferred hosting platform
5. **Domain Setup**: Configure custom domain and SSL

### Recommended Hosting
- **Vercel** (Recommended for React apps)
- **Netlify** (Great for static sites)
- **AWS Amplify** (Full-stack deployment)
- **DigitalOcean App Platform** (Simple deployment)

## 📞 Support & Contact

### Technical Support
- **Email**: info@littleangels.ac.ke
- **Phone**: +254700000000
- **Documentation**: [SETUP.md](./SETUP.md)

### Feature Requests
We welcome feature requests and contributions. Please create an issue or contact us directly.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Supabase** for the backend infrastructure
- **React** team for the amazing framework
- **Tailwind CSS** for the utility-first CSS framework
- **Leaflet** for the mapping functionality
- **Africa's Talking** for SMS services
- **M-Pesa** for payment integration

---

**Built with ❤️ for Kenyan schools**

*This is a production-ready school transport management system with real GPS tracking, M-Pesa payments, and comprehensive management features specifically designed for the Kenyan education system.*
