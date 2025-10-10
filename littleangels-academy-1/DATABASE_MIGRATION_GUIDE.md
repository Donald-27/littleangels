# Database Migration Guide

## Running the Comprehensive Features Migration

This guide explains how to run the database migration that adds all the new features to your Little Angels Academy system.

### Step 1: Access Supabase Dashboard

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Log in to your account
3. Select your project: **zvkfuljxidxtuqrmquso**

### Step 2: Run the Migration

1. Click on **SQL Editor** in the left sidebar
2. Click **New Query**
3. Open the file `database/comprehensive-features-migration.sql` in this project
4. Copy the entire contents of the file
5. Paste it into the SQL Editor
6. Click **Run** (or press Ctrl/Cmd + Enter)

### Step 3: Verify Migration

After running the migration, verify that the following tables were created:

✅ **New Tables:**
- `school_settings` - School configuration (location, motto, vision, flag)
- `staff_info` - Detailed staff management
- `location_attendance` - Teacher/staff location-based attendance
- `route_alerts` - Driver route activation and tracking
- `parent_alerts` - Proximity notifications for parents
- `student_results` - Academic performance tracking
- `result_analytics` - Performance comparisons and trends
- `result_slips` - Generated report cards
- `route_mapping` - Detailed route information
- `driver_messages` - Automated parent communications

### Features Added

**1. Location-Based Attendance**
- Teachers and staff can check in/out with GPS verification (30m accuracy)
- Automatic verification against school location
- Admin can view all attendance records

**2. Route Alerts & Proximity Notifications**
- Drivers can activate routes when heading out
- Parents receive alerts when bus is within 800m of their location
- Automatic tracking of pickup/dropoff status

**3. School Settings Management**
- Admin can set school location for verification
- Update motto, vision, mission, and flag
- Changes reflect across all dashboards

**4. Comprehensive Results System**
- Teachers can post student results
- Automatic analytics and performance trends
- Comparative graphs showing improvement
- Result slip generation

**5. Staff Management**
- Separate dashboard for different staff types
- Location-based attendance like teachers
- Role differentiation (cook, watchman, etc.)

**6. Enhanced Chat System**
- WhatsApp-like messaging
- Class-based groups with admin privileges
- Direct messages between users

### Important Notes

⚠️ **Row Level Security (RLS) is enabled on all tables** - This ensures data security based on user roles

🔄 **Automatic Analytics** - The system automatically generates performance analytics when results are posted

📍 **Location Services** - The app uses the Haversine formula for accurate distance calculations

### Troubleshooting

If you encounter any errors:

1. Make sure all prerequisite tables exist (schools, users, students, etc.)
2. Check that the enum types are created correctly
3. Verify that RLS policies don't conflict with existing ones

For support, contact your system administrator.
