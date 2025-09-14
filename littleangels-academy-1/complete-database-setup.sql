-- Complete Database Setup for Little Angels Academy
-- This script creates all missing tables, fixes RLS policies, and adds comprehensive seed data

-- First, fix the recursive RLS policies (in case they haven't been fixed)
DROP POLICY IF EXISTS "Users can only access users from their school" ON public.users;

-- Create safe user policies
CREATE POLICY "Users can select self" ON public.users FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update self" ON public.users FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "Service role full access" ON public.users FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Create missing enum types (if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'chat_type') THEN
        CREATE TYPE chat_type AS ENUM ('direct', 'group', 'channel');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_type') THEN
        CREATE TYPE message_type AS ENUM ('text', 'image', 'file', 'voice', 'video', 'location', 'contact');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'participant_role') THEN
        CREATE TYPE participant_role AS ENUM ('admin', 'moderator', 'member');
    END IF;
END $$;

-- Create Chat System Tables
CREATE TABLE IF NOT EXISTS chats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type chat_type NOT NULL DEFAULT 'group',
    avatar TEXT,
    created_by UUID REFERENCES users(id) NOT NULL,
    last_message_id UUID,
    is_active BOOLEAN DEFAULT true,
    is_archived BOOLEAN DEFAULT false,
    settings JSONB DEFAULT '{"allow_members_to_invite": true, "allow_file_sharing": true, "allow_voice_messages": true}',
    school_id UUID REFERENCES schools(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chat_id UUID REFERENCES chats(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    role participant_role DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_read_at TIMESTAMP WITH TIME ZONE,
    is_muted BOOLEAN DEFAULT false,
    is_pinned BOOLEAN DEFAULT false,
    UNIQUE(chat_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chat_id UUID REFERENCES chats(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES users(id) NOT NULL,
    content TEXT,
    message_type message_type DEFAULT 'text',
    reply_to_id UUID REFERENCES messages(id),
    forwarded_from_id UUID REFERENCES messages(id),
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMP WITH TIME ZONE,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    school_id UUID REFERENCES schools(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create other missing tables
CREATE TABLE IF NOT EXISTS live_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id UUID REFERENCES vehicles(id) NOT NULL,
    location JSONB NOT NULL,
    speed DECIMAL(5,2) NOT NULL DEFAULT 0,
    heading DECIMAL(5,2) NOT NULL DEFAULT 0,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    route_id UUID REFERENCES routes(id),
    driver_id UUID REFERENCES users(id) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('on_route', 'at_stop', 'delayed', 'emergency', 'off_duty')) NOT NULL DEFAULT 'off_duty',
    students_on_board UUID[] DEFAULT '{}',
    next_stop TEXT,
    estimated_arrival TIMESTAMP WITH TIME ZONE,
    school_id UUID REFERENCES schools(id) NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_id VARCHAR(255) UNIQUE NOT NULL,
    student_id UUID REFERENCES students(id) NOT NULL,
    parent_id UUID REFERENCES users(id) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'KES',
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

CREATE TABLE IF NOT EXISTS settings (
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

-- Enable RLS on new tables
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for new tables
CREATE POLICY "Users can access their chats" ON chats FOR ALL USING (
    school_id = (SELECT school_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "Users can access chat participants" ON chat_participants FOR ALL USING (
    chat_id IN (SELECT id FROM chats WHERE school_id = (SELECT school_id FROM users WHERE id = auth.uid()))
);

CREATE POLICY "Users can access messages in their chats" ON messages FOR ALL USING (
    school_id = (SELECT school_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "Users can access tracking from their school" ON live_tracking FOR ALL USING (
    school_id = (SELECT school_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "Users can access payments from their school" ON payments FOR ALL USING (
    school_id = (SELECT school_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "Users can access settings from their school" ON settings FOR ALL USING (
    school_id = (SELECT school_id FROM users WHERE id = auth.uid())
);

-- Fix notifications table foreign key constraint name
ALTER TABLE notifications ADD CONSTRAINT notifications_sender_id_fkey 
FOREIGN KEY (sent_by) REFERENCES users(id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chats_school ON chats(school_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_chat ON chat_participants(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_live_tracking_vehicle ON live_tracking(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_payments_student ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_settings_school ON settings(school_id);

-- Insert initial school data
INSERT INTO schools (id, name, address, phone, email, website, motto, settings) 
VALUES (
    '1fd55bdb-517a-4213-a914-8ff59dbfe3ed',
    'Little Angels Academy',
    'Eldoret-Nakuru Highway, Eldoret, Kenya',
    '+254712345678',
    'info@littleangels.ac.ke',
    'https://littleangels.ac.ke',
    'Nurturing Tomorrow''s Leaders',
    '{"timeZone": "Africa/Nairobi", "defaultCurrency": "KES", "academicYear": "2024", "term": "Term 1"}'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    address = EXCLUDED.address,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email,
    website = EXCLUDED.website,
    motto = EXCLUDED.motto,
    settings = EXCLUDED.settings;

-- Insert comprehensive sample data
-- Sample vehicles
INSERT INTO vehicles (id, plate_number, make, model, year, capacity, type, color, insurance, licenses, school_id) VALUES
('11111111-1111-1111-1111-111111111111', 'KCA 123A', 'Toyota', 'Hiace', 2020, 14, 'van', 'White', '{"provider": "Jubilee Insurance", "policy": "JUB123456", "expiry": "2024-12-31"}', '{"driving": "DL123456", "commercial": "COM789", "expiry": "2025-06-30"}', '1fd55bdb-517a-4213-a914-8ff59dbfe3ed'),
('22222222-2222-2222-2222-222222222222', 'KCB 456B', 'Nissan', 'Civilian', 2019, 29, 'bus', 'Blue', '{"provider": "UAP Insurance", "policy": "UAP987654", "expiry": "2024-11-30"}', '{"driving": "DL789012", "commercial": "COM345", "expiry": "2025-08-15"}', '1fd55bdb-517a-4213-a914-8ff59dbfe3ed'),
('33333333-3333-3333-3333-333333333333', 'KCC 789C', 'Isuzu', 'NPR', 2021, 25, 'bus', 'Yellow', '{"provider": "CIC Insurance", "policy": "CIC456789", "expiry": "2024-10-31"}', '{"driving": "DL345678", "commercial": "COM901", "expiry": "2025-09-20"}', '1fd55bdb-517a-4213-a914-8ff59dbfe3ed')
ON CONFLICT (id) DO NOTHING;

-- Sample routes
INSERT INTO routes (id, name, description, vehicle_id, distance, estimated_duration, school_id) VALUES
('aaaa1111-bbbb-cccc-dddd-eeeeeeee1111', 'Eldoret Central Route', 'Main route through Eldoret town center', '11111111-1111-1111-1111-111111111111', 15.50, 45, '1fd55bdb-517a-4213-a914-8ff59dbfe3ed'),
('aaaa2222-bbbb-cccc-dddd-eeeeeeee2222', 'Langas Estate Route', 'Route covering Langas and surrounding estates', '22222222-2222-2222-2222-222222222222', 22.30, 60, '1fd55bdb-517a-4213-a914-8ff59dbfe3ed'),
('aaaa3333-bbbb-cccc-dddd-eeeeeeee3333', 'Kapseret Route', 'Route to Kapseret and nearby areas', '33333333-3333-3333-3333-333333333333', 18.80, 50, '1fd55bdb-517a-4213-a914-8ff59dbfe3ed')
ON CONFLICT (id) DO NOTHING;