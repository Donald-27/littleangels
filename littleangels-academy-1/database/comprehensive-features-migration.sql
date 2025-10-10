-- Comprehensive Features Migration for Little Angels Academy
-- This migration adds: location-based attendance, route alerts, school settings, results system, staff management

-- Update user_role enum to include staff
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'staff';

-- Add staff_type enum for different staff categories
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'staff_type') THEN
        CREATE TYPE staff_type AS ENUM ('cook', 'watchman', 'cleaner', 'librarian', 'nurse', 'security', 'technician', 'administrator', 'other');
    END IF;
END $$;

-- Create school_settings table for comprehensive school configuration
CREATE TABLE IF NOT EXISTS school_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    school_id UUID REFERENCES schools(id) NOT NULL UNIQUE,
    school_location JSONB NOT NULL DEFAULT '{"latitude": 0.5143, "longitude": 35.2698, "address": "Eldoret, Kenya", "radius": 30}',
    motto TEXT,
    vision TEXT,
    mission TEXT,
    flag_url TEXT,
    logo_url TEXT,
    primary_color VARCHAR(7) DEFAULT '#6366f1',
    secondary_color VARCHAR(7) DEFAULT '#ec4899',
    attendance_radius INTEGER DEFAULT 30,
    bus_alert_radius INTEGER DEFAULT 800,
    academic_year VARCHAR(20),
    current_term VARCHAR(20),
    contact_info JSONB DEFAULT '{"phone": "", "email": "", "website": ""}',
    social_media JSONB DEFAULT '{"facebook": "", "twitter": "", "instagram": ""}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create staff_info table for detailed staff management
CREATE TABLE IF NOT EXISTS staff_info (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL UNIQUE,
    staff_type staff_type NOT NULL,
    department VARCHAR(100),
    position VARCHAR(100) NOT NULL,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    hire_date DATE NOT NULL,
    salary_info JSONB DEFAULT '{}',
    qualifications JSONB DEFAULT '[]',
    responsibilities TEXT[],
    shift_schedule JSONB DEFAULT '{}',
    contract_type VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    school_id UUID REFERENCES schools(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create location_attendance table for teachers and staff
CREATE TABLE IF NOT EXISTS location_attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,
    user_role user_role NOT NULL,
    check_in_time TIMESTAMP WITH TIME ZONE,
    check_in_location JSONB,
    check_in_distance DECIMAL(8,2),
    check_in_verified BOOLEAN DEFAULT false,
    check_out_time TIMESTAMP WITH TIME ZONE,
    check_out_location JSONB,
    check_out_distance DECIMAL(8,2),
    date DATE NOT NULL,
    status VARCHAR(20) CHECK (status IN ('present', 'absent', 'late', 'half_day', 'on_leave')) DEFAULT 'absent',
    notes TEXT,
    verified_by UUID REFERENCES users(id),
    school_id UUID REFERENCES schools(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Create route_alerts table for proximity notifications
CREATE TABLE IF NOT EXISTS route_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    route_id UUID REFERENCES routes(id) NOT NULL,
    vehicle_id UUID REFERENCES vehicles(id) NOT NULL,
    driver_id UUID REFERENCES users(id) NOT NULL,
    trip_type VARCHAR(10) CHECK (trip_type IN ('pickup', 'dropoff')) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('active', 'completed', 'cancelled')) DEFAULT 'active',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    students_list UUID[] DEFAULT '{}',
    alerts_sent JSONB DEFAULT '[]',
    school_id UUID REFERENCES schools(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create parent_alerts table for tracking sent proximity alerts
CREATE TABLE IF NOT EXISTS parent_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    route_alert_id UUID REFERENCES route_alerts(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES users(id) NOT NULL,
    student_id UUID REFERENCES students(id) NOT NULL,
    alert_type VARCHAR(20) CHECK (alert_type IN ('approaching', 'arrived', 'departed', 'no_show')) NOT NULL,
    distance DECIMAL(8,2),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    location JSONB,
    school_id UUID REFERENCES schools(id) NOT NULL
);

-- Create student_results table for academic performance tracking
CREATE TABLE IF NOT EXISTS student_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES students(id) NOT NULL,
    teacher_id UUID REFERENCES users(id) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    term VARCHAR(20) NOT NULL,
    exam_type VARCHAR(50) NOT NULL,
    marks DECIMAL(5,2) NOT NULL,
    grade VARCHAR(5),
    max_marks DECIMAL(5,2) DEFAULT 100,
    remarks TEXT,
    posted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    school_id UUID REFERENCES schools(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create result_analytics table for performance comparisons
CREATE TABLE IF NOT EXISTS result_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES students(id) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    term VARCHAR(20) NOT NULL,
    total_marks DECIMAL(8,2),
    average_marks DECIMAL(5,2),
    grade VARCHAR(5),
    class_rank INTEGER,
    stream_rank INTEGER,
    subjects_count INTEGER,
    improvement_percentage DECIMAL(5,2),
    previous_average DECIMAL(5,2),
    trend VARCHAR(20) CHECK (trend IN ('improving', 'declining', 'stable')),
    analytics_data JSONB DEFAULT '{}',
    school_id UUID REFERENCES schools(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, academic_year, term)
);

-- Create result_slips table for generated report cards
CREATE TABLE IF NOT EXISTS result_slips (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES students(id) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    term VARCHAR(20) NOT NULL,
    slip_url TEXT,
    slip_data JSONB,
    generated_by UUID REFERENCES users(id) NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_to_parent BOOLEAN DEFAULT false,
    sent_at TIMESTAMP WITH TIME ZONE,
    school_id UUID REFERENCES schools(id) NOT NULL,
    UNIQUE(student_id, academic_year, term)
);

-- Create route_mapping table for detailed route information
CREATE TABLE IF NOT EXISTS route_mapping (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    route_id UUID REFERENCES routes(id) NOT NULL,
    route_path JSONB NOT NULL,
    waypoints JSONB DEFAULT '[]',
    created_by UUID REFERENCES users(id) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    school_id UUID REFERENCES schools(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create driver_messages table for automated parent communications
CREATE TABLE IF NOT EXISTS driver_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    driver_id UUID REFERENCES users(id) NOT NULL,
    parent_id UUID REFERENCES users(id) NOT NULL,
    student_id UUID REFERENCES students(id) NOT NULL,
    message_type VARCHAR(50) CHECK (message_type IN ('approaching', 'arrived', 'no_show', 'delay', 'emergency', 'custom')) NOT NULL,
    message_content TEXT NOT NULL,
    location JSONB,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    school_id UUID REFERENCES schools(id) NOT NULL
);

-- Enable RLS on all new tables
ALTER TABLE school_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE result_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE result_slips ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for school_settings
CREATE POLICY "Users can view school settings" ON school_settings FOR SELECT USING (
    school_id = (SELECT school_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "Admins can update school settings" ON school_settings FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin' AND school_id = school_settings.school_id)
);

-- RLS Policies for staff_info
CREATE POLICY "Users can view staff from their school" ON staff_info FOR SELECT USING (
    school_id = (SELECT school_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "Admins can manage staff info" ON staff_info FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin' AND school_id = staff_info.school_id)
);

-- RLS Policies for location_attendance
CREATE POLICY "Users can view their own attendance" ON location_attendance FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin' AND school_id = location_attendance.school_id)
);

CREATE POLICY "Users can mark their own attendance" ON location_attendance FOR INSERT WITH CHECK (
    user_id = auth.uid() AND school_id = (SELECT school_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "Users can update their own attendance" ON location_attendance FOR UPDATE USING (
    user_id = auth.uid() AND school_id = (SELECT school_id FROM users WHERE id = auth.uid())
);

-- RLS Policies for route_alerts
CREATE POLICY "School users can view route alerts" ON route_alerts FOR SELECT USING (
    school_id = (SELECT school_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "Drivers can create route alerts" ON route_alerts FOR INSERT WITH CHECK (
    driver_id = auth.uid() AND school_id = (SELECT school_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "Drivers and admins can update route alerts" ON route_alerts FOR UPDATE USING (
    driver_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin' AND school_id = route_alerts.school_id)
);

-- RLS Policies for parent_alerts
CREATE POLICY "Parents can view their alerts" ON parent_alerts FOR SELECT USING (
    parent_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'driver') AND school_id = parent_alerts.school_id)
);

CREATE POLICY "System can create parent alerts" ON parent_alerts FOR INSERT WITH CHECK (
    school_id = (SELECT school_id FROM users WHERE id = auth.uid())
);

-- RLS Policies for student_results
CREATE POLICY "Users can view relevant results" ON student_results FOR SELECT USING (
    school_id = (SELECT school_id FROM users WHERE id = auth.uid()) AND (
        teacher_id = auth.uid() OR
        EXISTS (SELECT 1 FROM students WHERE id = student_results.student_id AND parent_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    )
);

CREATE POLICY "Teachers can post results" ON student_results FOR INSERT WITH CHECK (
    teacher_id = auth.uid() AND school_id = (SELECT school_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "Teachers can update their posted results" ON student_results FOR UPDATE USING (
    teacher_id = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin' AND school_id = student_results.school_id)
);

-- RLS Policies for result_analytics
CREATE POLICY "Users can view relevant analytics" ON result_analytics FOR SELECT USING (
    school_id = (SELECT school_id FROM users WHERE id = auth.uid()) AND (
        EXISTS (SELECT 1 FROM students WHERE id = result_analytics.student_id AND parent_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'teacher'))
    )
);

-- RLS Policies for result_slips
CREATE POLICY "Users can view relevant result slips" ON result_slips FOR SELECT USING (
    school_id = (SELECT school_id FROM users WHERE id = auth.uid()) AND (
        EXISTS (SELECT 1 FROM students WHERE id = result_slips.student_id AND parent_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'teacher'))
    )
);

-- RLS Policies for route_mapping
CREATE POLICY "School users can view route mapping" ON route_mapping FOR SELECT USING (
    school_id = (SELECT school_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "Admins can manage route mapping" ON route_mapping FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin' AND school_id = route_mapping.school_id)
);

-- RLS Policies for driver_messages
CREATE POLICY "Users can view relevant messages" ON driver_messages FOR SELECT USING (
    driver_id = auth.uid() OR parent_id = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin' AND school_id = driver_messages.school_id)
);

CREATE POLICY "Drivers can send messages" ON driver_messages FOR INSERT WITH CHECK (
    driver_id = auth.uid() AND school_id = (SELECT school_id FROM users WHERE id = auth.uid())
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_school_settings_school ON school_settings(school_id);
CREATE INDEX IF NOT EXISTS idx_staff_info_user ON staff_info(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_info_school ON staff_info(school_id);
CREATE INDEX IF NOT EXISTS idx_location_attendance_user_date ON location_attendance(user_id, date);
CREATE INDEX IF NOT EXISTS idx_location_attendance_school ON location_attendance(school_id);
CREATE INDEX IF NOT EXISTS idx_route_alerts_route ON route_alerts(route_id);
CREATE INDEX IF NOT EXISTS idx_route_alerts_driver ON route_alerts(driver_id);
CREATE INDEX IF NOT EXISTS idx_parent_alerts_parent ON parent_alerts(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_alerts_student ON parent_alerts(student_id);
CREATE INDEX IF NOT EXISTS idx_student_results_student ON student_results(student_id);
CREATE INDEX IF NOT EXISTS idx_student_results_teacher ON student_results(teacher_id);
CREATE INDEX IF NOT EXISTS idx_result_analytics_student ON result_analytics(student_id);
CREATE INDEX IF NOT EXISTS idx_result_slips_student ON result_slips(student_id);
CREATE INDEX IF NOT EXISTS idx_route_mapping_route ON route_mapping(route_id);
CREATE INDEX IF NOT EXISTS idx_driver_messages_parent ON driver_messages(parent_id);
CREATE INDEX IF NOT EXISTS idx_driver_messages_driver ON driver_messages(driver_id);

-- Insert default school settings
INSERT INTO school_settings (school_id, school_location, motto, vision, mission)
SELECT 
    id,
    '{"latitude": 0.5143, "longitude": 35.2698, "address": "Eldoret, Kenya", "radius": 30}'::jsonb,
    'Nurturing Tomorrow''s Leaders',
    'To be the leading institution in holistic education',
    'Providing quality education with strong moral values'
FROM schools
WHERE id = '1fd55bdb-517a-4213-a914-8ff59dbfe3ed'
ON CONFLICT (school_id) DO NOTHING;

-- Create function to calculate distance between two points (Haversine formula)
CREATE OR REPLACE FUNCTION calculate_distance(
    lat1 DECIMAL,
    lon1 DECIMAL,
    lat2 DECIMAL,
    lon2 DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
    R DECIMAL := 6371000; -- Earth's radius in meters
    dLat DECIMAL;
    dLon DECIMAL;
    a DECIMAL;
    c DECIMAL;
BEGIN
    dLat := radians(lat2 - lat1);
    dLon := radians(lon2 - lon1);
    a := sin(dLat/2) * sin(dLat/2) +
         cos(radians(lat1)) * cos(radians(lat2)) *
         sin(dLon/2) * sin(dLon/2);
    c := 2 * atan2(sqrt(a), sqrt(1-a));
    RETURN R * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create function to auto-generate result analytics
CREATE OR REPLACE FUNCTION generate_result_analytics()
RETURNS TRIGGER AS $$
DECLARE
    v_total DECIMAL;
    v_average DECIMAL;
    v_count INTEGER;
    v_previous_avg DECIMAL;
    v_trend VARCHAR(20);
    v_improvement DECIMAL;
BEGIN
    -- Calculate current term statistics
    SELECT 
        SUM(marks),
        AVG(marks),
        COUNT(*)
    INTO v_total, v_average, v_count
    FROM student_results
    WHERE student_id = NEW.student_id
        AND academic_year = NEW.academic_year
        AND term = NEW.term;

    -- Get previous term average
    SELECT average_marks INTO v_previous_avg
    FROM result_analytics
    WHERE student_id = NEW.student_id
    ORDER BY created_at DESC
    LIMIT 1;

    -- Calculate trend and improvement
    IF v_previous_avg IS NOT NULL THEN
        v_improvement := ((v_average - v_previous_avg) / v_previous_avg) * 100;
        IF v_improvement > 5 THEN
            v_trend := 'improving';
        ELSIF v_improvement < -5 THEN
            v_trend := 'declining';
        ELSE
            v_trend := 'stable';
        END IF;
    ELSE
        v_improvement := 0;
        v_trend := 'stable';
    END IF;

    -- Insert or update analytics
    INSERT INTO result_analytics (
        student_id,
        academic_year,
        term,
        total_marks,
        average_marks,
        subjects_count,
        previous_average,
        improvement_percentage,
        trend,
        school_id
    ) VALUES (
        NEW.student_id,
        NEW.academic_year,
        NEW.term,
        v_total,
        v_average,
        v_count,
        v_previous_avg,
        v_improvement,
        v_trend,
        NEW.school_id
    )
    ON CONFLICT (student_id, academic_year, term) 
    DO UPDATE SET
        total_marks = v_total,
        average_marks = v_average,
        subjects_count = v_count,
        previous_average = v_previous_avg,
        improvement_percentage = v_improvement,
        trend = v_trend,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-generating analytics
DROP TRIGGER IF EXISTS trigger_generate_analytics ON student_results;
CREATE TRIGGER trigger_generate_analytics
    AFTER INSERT OR UPDATE ON student_results
    FOR EACH ROW
    EXECUTE FUNCTION generate_result_analytics();

-- Migration complete
SELECT 'Comprehensive features migration completed successfully!' AS status;
