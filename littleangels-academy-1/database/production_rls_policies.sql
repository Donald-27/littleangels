-- PRODUCTION RLS POLICIES FOR LITTLE ANGELS ACADEMY
-- These policies are designed for Supabase production deployment
-- For development environment, we use permissive policies for testing

-- =================================================================
-- PRODUCTION RLS POLICIES (For Supabase deployment)
-- =================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE boarding_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_drivers ENABLE ROW LEVEL SECURITY;

-- =================================================================
-- USERS TABLE POLICIES
-- =================================================================

-- Users can view their own profile
CREATE POLICY "users_select_own" ON users FOR SELECT 
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "users_update_own" ON users FOR UPDATE 
USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Admins can manage all users
CREATE POLICY "admin_users_all" ON users FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  )
);

-- =================================================================
-- STUDENTS TABLE POLICIES  
-- =================================================================

-- Parents can view their children
CREATE POLICY "parents_view_children" ON students FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM student_guardians sg 
    WHERE sg.student_id = students.id AND sg.guardian_id = auth.uid()
  )
);

-- Teachers can view students in their class/school
CREATE POLICY "teachers_view_students" ON students FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role IN ('teacher', 'admin') 
    AND school_id = students.school_id
  )
);

-- Drivers can view students on their routes
CREATE POLICY "drivers_view_route_students" ON students FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN vehicle_drivers vd ON u.id = vd.driver_id
    JOIN trips t ON vd.vehicle_id = t.vehicle_id
    WHERE u.id = auth.uid() AND u.role = 'driver'
    AND students.id = ANY(t.students_transported)
  )
);

-- =================================================================
-- PAYMENTS TABLE POLICIES
-- =================================================================

-- Parents can view their children's payments
CREATE POLICY "parents_view_payments" ON payments FOR SELECT 
USING (parent_id = auth.uid());

-- Parents can create payments for their children
CREATE POLICY "parents_create_payments" ON payments FOR INSERT 
WITH CHECK (parent_id = auth.uid());

-- Accounts staff can manage all payments
CREATE POLICY "accounts_manage_payments" ON payments FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role IN ('accounts', 'admin')
  )
);

-- =================================================================
-- LIVE TRACKING POLICIES
-- =================================================================

-- Drivers can update tracking for their vehicles
CREATE POLICY "drivers_update_tracking" ON live_tracking FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN vehicle_drivers vd ON u.id = vd.driver_id
    WHERE u.id = auth.uid() AND u.role = 'driver'
    AND vd.vehicle_id = live_tracking.vehicle_id
  )
);

-- Parents can view tracking for their children's vehicles
CREATE POLICY "parents_view_tracking" ON live_tracking FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM student_guardians sg
    JOIN students s ON sg.student_id = s.id
    JOIN trips t ON s.route_id = t.route_id
    WHERE sg.guardian_id = auth.uid()
    AND t.vehicle_id = live_tracking.vehicle_id
  )
);

-- Admins and teachers can view all tracking
CREATE POLICY "staff_view_tracking" ON live_tracking FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role IN ('admin', 'teacher')
    AND school_id = live_tracking.school_id
  )
);

-- =================================================================
-- BOARDING LOGS POLICIES
-- =================================================================

-- Drivers can create boarding logs
CREATE POLICY "drivers_create_boarding_logs" ON boarding_logs FOR INSERT 
WITH CHECK (driver_id = auth.uid());

-- Parents can view logs for their children
CREATE POLICY "parents_view_boarding_logs" ON boarding_logs FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM student_guardians sg
    WHERE sg.student_id = boarding_logs.student_id 
    AND sg.guardian_id = auth.uid()
  )
);

-- Staff can view all logs in their school
CREATE POLICY "staff_view_boarding_logs" ON boarding_logs FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role IN ('admin', 'teacher')
    AND school_id = boarding_logs.school_id
  )
);

-- =================================================================
-- NOTIFICATIONS POLICIES
-- =================================================================

-- Users can view notifications sent to them
CREATE POLICY "users_view_notifications" ON notifications FOR SELECT 
USING (auth.uid() = ANY(recipients));

-- Staff can create notifications
CREATE POLICY "staff_create_notifications" ON notifications FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role IN ('admin', 'teacher', 'driver')
  )
);

-- =================================================================
-- SERVICE ROLE POLICIES (For server-side operations)
-- =================================================================

-- Service role has full access for server operations
CREATE POLICY "service_role_all" ON users FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON students FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON payments FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON live_tracking FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON boarding_logs FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON notifications FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =================================================================
-- DEVELOPMENT ENVIRONMENT NOTE
-- =================================================================

-- The above policies are for PRODUCTION Supabase deployment
-- For development environment without auth schema, we use:
-- CREATE POLICY "Allow all access for development" ON [table] FOR ALL TO public USING (true) WITH CHECK (true);

-- In production deployment:
-- 1. Replace development policies with the above production policies
-- 2. Ensure auth.uid() function is available (Supabase provides this)
-- 3. Test each role's access patterns thoroughly
-- 4. Consider additional policies for edge cases and admin overrides