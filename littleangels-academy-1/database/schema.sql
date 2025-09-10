-- Little Angels Transport System Database Schema
-- Run this SQL in your Supabase SQL editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'BCDOv6ifpmHGXdNCevzmyAVK5EDUwawrgxR0jh/mQi78GKGcb3sKG4NAhWoKewM52b/J7y10lbIcgX3j/qQ4mQ==';

-- Create enum types
CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'parent', 'driver', 'accounts');
CREATE TYPE vehicle_status AS ENUM ('active', 'maintenance', 'inactive', 'out_of_service');
CREATE TYPE vehicle_type AS ENUM ('bus', 'van', 'minibus');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'early_pickup', 'missed');
CREATE TYPE notification_type AS ENUM ('info', 'warning', 'success', 'error', 'emergency');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded', 'cancelled');
CREATE TYPE trip_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled', 'emergency_stop');

-- Schools table
CREATE TABLE schools (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    logo TEXT,
    website TEXT,
    established DATE,
    motto TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role user_role NOT NULL,
    avatar TEXT,
    address TEXT,
    national_id VARCHAR(50),
    emergency_contact JSONB,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    preferences JSONB DEFAULT '{"language": "en", "notifications": {"sms": true, "email": true, "whatsapp": false, "push": true}, "theme": "light"}',
    school_id UUID REFERENCES schools(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Students table
CREATE TABLE students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    grade VARCHAR(20) NOT NULL,
    class VARCHAR(20) NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female')) NOT NULL,
    photo TEXT,
    qr_code VARCHAR(255) UNIQUE NOT NULL,
    parent_id UUID REFERENCES users(id) NOT NULL,
    teacher_id UUID REFERENCES users(id),
    route_id UUID,
    address JSONB NOT NULL,
    medical_info JSONB DEFAULT '{"allergies": [], "medications": [], "conditions": [], "bloodType": null, "doctorContact": null}',
    emergency_contacts JSONB DEFAULT '[]',
    transport_info JSONB DEFAULT '{"needsTransport": true, "pickupPoint": null, "dropoffPoint": null, "specialInstructions": null}',
    academic_info JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    school_id UUID REFERENCES schools(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vehicles table
CREATE TABLE vehicles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plate_number VARCHAR(20) UNIQUE NOT NULL,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    capacity INTEGER NOT NULL,
    type vehicle_type NOT NULL,
    color VARCHAR(50) NOT NULL,
    driver_id UUID REFERENCES users(id),
    conductor_id UUID REFERENCES users(id),
    gps_device_id VARCHAR(100),
    current_location JSONB,
    status vehicle_status DEFAULT 'active',
    insurance JSONB NOT NULL,
    licenses JSONB NOT NULL,
    maintenance_info JSONB DEFAULT '{}',
    features TEXT[] DEFAULT '{}',
    school_id UUID REFERENCES schools(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Routes table
CREATE TABLE routes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    vehicle_id UUID REFERENCES vehicles(id),
    driver_id UUID REFERENCES users(id),
    conductor_id UUID REFERENCES users(id),
    stops JSONB DEFAULT '[]',
    distance DECIMAL(8,2),
    estimated_duration INTEGER,
    schedule JSONB DEFAULT '{"monday": true, "tuesday": true, "wednesday": true, "thursday": true, "friday": true, "saturday": false, "sunday": false}',
    fuel_consumption DECIMAL(8,2),
    toll_fees DECIMAL(8,2),
    is_active BOOLEAN DEFAULT true,
    school_id UUID REFERENCES schools(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint to students route_id
ALTER TABLE students ADD CONSTRAINT fk_students_route FOREIGN KEY (route_id) REFERENCES routes(id);

-- Attendance table
CREATE TABLE attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES students(id) NOT NULL,
    route_id UUID REFERENCES routes(id) NOT NULL,
    vehicle_id UUID REFERENCES vehicles(id) NOT NULL,
    driver_id UUID REFERENCES users(id) NOT NULL,
    date DATE NOT NULL,
    pickup_time TIMESTAMP WITH TIME ZONE,
    pickup_location JSONB,
    dropoff_time TIMESTAMP WITH TIME ZONE,
    dropoff_location JSONB,
    status attendance_status NOT NULL,
    scanned_by UUID REFERENCES users(id),
    notes TEXT,
    parent_notified BOOLEAN DEFAULT false,
    school_id UUID REFERENCES schools(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Live tracking table
CREATE TABLE live_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id UUID REFERENCES vehicles(id) NOT NULL,
    location JSONB NOT NULL,
    speed DECIMAL(5,2) NOT NULL,
    heading DECIMAL(5,2) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    route_id UUID REFERENCES routes(id),
    driver_id UUID REFERENCES users(id) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('on_route', 'at_stop', 'delayed', 'emergency', 'off_duty')) NOT NULL,
    students_on_board UUID[] DEFAULT '{}',
    next_stop TEXT,
    estimated_arrival TIMESTAMP WITH TIME ZONE,
    school_id UUID REFERENCES schools(id) NOT NULL
);

-- Notifications table
CREATE TABLE notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type notification_type NOT NULL,
    priority VARCHAR(10) CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    recipients UUID[] NOT NULL,
    channels TEXT[] DEFAULT '{}',
    sent_by UUID REFERENCES users(id) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pending', 'sent', 'failed', 'delivered')) DEFAULT 'pending',
    delivery_report JSONB,
    read_by JSONB DEFAULT '[]',
    related_entity JSONB,
    school_id UUID REFERENCES schools(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_id VARCHAR(255) UNIQUE NOT NULL,
    student_id UUID REFERENCES students(id) NOT NULL,
    parent_id UUID REFERENCES users(id) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    description TEXT NOT NULL,
    type VARCHAR(20) CHECK (type IN ('transport_fee', 'late_fee', 'registration_fee', 'penalty', 'refund')) NOT NULL,
    method VARCHAR(20) CHECK (method IN ('mpesa', 'bank_transfer', 'cash', 'cheque', 'card')) NOT NULL,
    status payment_status DEFAULT 'pending',
    payment_details JSONB DEFAULT '{}',
    due_date DATE,
    paid_at TIMESTAMP WITH TIME ZONE,
    receipt TEXT,
    school_id UUID REFERENCES schools(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trips table
CREATE TABLE trips (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    route_id UUID REFERENCES routes(id) NOT NULL,
    vehicle_id UUID REFERENCES vehicles(id) NOT NULL,
    driver_id UUID REFERENCES users(id) NOT NULL,
    date DATE NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    start_mileage DECIMAL(8,2) NOT NULL,
    end_mileage DECIMAL(8,2),
    fuel_used DECIMAL(6,2),
    students_transported UUID[] DEFAULT '{}',
    status trip_status DEFAULT 'scheduled',
    delays JSONB DEFAULT '[]',
    route_deviation JSONB,
    notes TEXT,
    school_id UUID REFERENCES schools(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings table
CREATE TABLE settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key VARCHAR(255) NOT NULL,
    value JSONB NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    school_id UUID REFERENCES schools(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(key, school_id)
);

-- Create indexes for better performance
CREATE INDEX idx_users_school ON users(school_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_students_school ON students(school_id);
CREATE INDEX idx_students_parent ON students(parent_id);
CREATE INDEX idx_students_route ON students(route_id);
CREATE INDEX idx_students_qr_code ON students(qr_code);
CREATE INDEX idx_vehicles_school ON vehicles(school_id);
CREATE INDEX idx_vehicles_driver ON vehicles(driver_id);
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_routes_school ON routes(school_id);
CREATE INDEX idx_routes_vehicle ON routes(vehicle_id);
CREATE INDEX idx_attendance_student_date ON attendance(student_id, date);
CREATE INDEX idx_attendance_school ON attendance(school_id);
CREATE INDEX idx_live_tracking_vehicle ON live_tracking(vehicle_id);
CREATE INDEX idx_live_tracking_timestamp ON live_tracking(timestamp);
CREATE INDEX idx_notifications_school ON notifications(school_id);
CREATE INDEX idx_payments_student ON payments(student_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_trips_route_date ON trips(route_id, date);
CREATE INDEX idx_settings_school ON settings(school_id);

-- Enable Row Level Security
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Row Level Security policies
-- Users can only access data from their school
CREATE POLICY "Users can only access their school data" ON schools FOR ALL USING (
    auth.uid() IN (SELECT id FROM users WHERE school_id = schools.id)
);

CREATE POLICY "Users can only access users from their school" ON users FOR ALL USING (
    school_id = (SELECT school_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "Users can only access students from their school" ON students FOR ALL USING (
    school_id = (SELECT school_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "Users can only access vehicles from their school" ON vehicles FOR ALL USING (
    school_id = (SELECT school_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "Users can only access routes from their school" ON routes FOR ALL USING (
    school_id = (SELECT school_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "Users can only access attendance from their school" ON attendance FOR ALL USING (
    school_id = (SELECT school_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "Users can only access tracking from their school" ON live_tracking FOR ALL USING (
    school_id = (SELECT school_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "Users can only access notifications from their school" ON notifications FOR ALL USING (
    school_id = (SELECT school_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "Users can only access payments from their school" ON payments FOR ALL USING (
    school_id = (SELECT school_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "Users can only access trips from their school" ON trips FOR ALL USING (
    school_id = (SELECT school_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "Users can only access settings from their school" ON settings FOR ALL USING (
    school_id = (SELECT school_id FROM users WHERE id = auth.uid())
);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at columns
CREATE TRIGGER update_schools_updated_at BEFORE UPDATE ON schools FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON routes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON trips FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();