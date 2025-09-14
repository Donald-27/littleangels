-- Comprehensive Seed Data for Little Angels Academy
-- This creates realistic data for testing all application features

-- Sample notifications  
INSERT INTO notifications (id, title, message, type, recipients, sent_by, school_id) VALUES
('dddd1111-eeee-ffff-aaaa-bbbbbbbb1111', 'Welcome to Little Angels Academy', 'Welcome to our school management system! You can now track your child''s transport, view academic progress, and stay connected with teachers.', 'info', ARRAY['967a12e4-8652-485f-94c4-e69d0c32131c'], '967a12e4-8652-485f-94c4-e69d0c32131c', '1fd55bdb-517a-4213-a914-8ff59dbfe3ed'),
('dddd2222-eeee-ffff-aaaa-bbbbbbbb2222', 'Transport Schedule Update', 'Bus routes have been updated for this term. Please check the new pickup times and locations.', 'warning', ARRAY['967a12e4-8652-485f-94c4-e69d0c32131c'], '967a12e4-8652-485f-94c4-e69d0c32131c', '1fd55bdb-517a-4213-a914-8ff59dbfe3ed'),
('dddd3333-eeee-ffff-aaaa-bbbbbbbb3333', 'Fee Payment Reminder', 'Transport fees for Term 1 are due on 15th March. You can pay via M-Pesa or bank transfer.', 'info', ARRAY['967a12e4-8652-485f-94c4-e69d0c32131c'], '967a12e4-8652-485f-94c4-e69d0c32131c', '1fd55bdb-517a-4213-a914-8ff59dbfe3ed')
ON CONFLICT (id) DO NOTHING;

-- Sample students with detailed information
INSERT INTO students (id, student_id, name, date_of_birth, grade, class, gender, parent_id, teacher_id, route_id, address, medical_info, emergency_contacts, transport_info, qr_code, school_id) VALUES
('ssss1111-tttt-uuuu-vvvv-wwwwwwww1111', 'LA2024001', 'Amina Wanjiku', '2015-03-15', 'Grade 3', '3A', 'female', '967a12e4-8652-485f-94c4-e69d0c32131c', '967a12e4-8652-485f-94c4-e69d0c32131c', 'aaaa1111-bbbb-cccc-dddd-eeeeeeee1111', '{"street": "Kenyatta Avenue", "city": "Eldoret", "county": "Uasin Gishu", "postal_code": "30100"}', '{"allergies": ["Nuts"], "medications": [], "conditions": [], "bloodType": "O+", "doctorContact": "+254712345678"}', '[{"name": "Grace Wanjiku", "phone": "+254723456789", "relationship": "Mother"}, {"name": "John Wanjiku", "phone": "+254734567890", "relationship": "Father"}]', '{"needsTransport": true, "pickupPoint": "Kenyatta Avenue", "dropoffPoint": "Kenyatta Avenue", "specialInstructions": "Pick up at 7:00 AM"}', 'QR_LA2024001', '1fd55bdb-517a-4213-a914-8ff59dbfe3ed'),

('ssss2222-tttt-uuuu-vvvv-wwwwwwww2222', 'LA2024002', 'Kevin Kiprop', '2014-08-22', 'Grade 4', '4B', 'male', '967a12e4-8652-485f-94c4-e69d0c32131c', '967a12e4-8652-485f-94c4-e69d0c32131c', 'aaaa2222-bbbb-cccc-dddd-eeeeeeee2222', '{"street": "Langas Estate", "city": "Eldoret", "county": "Uasin Gishu", "postal_code": "30100"}', '{"allergies": [], "medications": ["Inhaler for asthma"], "conditions": ["Mild asthma"], "bloodType": "A+", "doctorContact": "+254712345678"}', '[{"name": "Mary Kiprop", "phone": "+254745678901", "relationship": "Mother"}, {"name": "David Kiprop", "phone": "+254756789012", "relationship": "Father"}]', '{"needsTransport": true, "pickupPoint": "Langas Shopping Center", "dropoffPoint": "Langas Shopping Center", "specialInstructions": "Ensure inhaler is available"}', 'QR_LA2024002', '1fd55bdb-517a-4213-a914-8ff59dbfe3ed'),

('ssss3333-tttt-uuuu-vvvv-wwwwwwww3333', 'LA2024003', 'Fatuma Ali', '2016-01-10', 'Grade 2', '2C', 'female', '967a12e4-8652-485f-94c4-e69d0c32131c', '967a12e4-8652-485f-94c4-e69d0c32131c', 'aaaa3333-bbbb-cccc-dddd-eeeeeeee3333', '{"street": "Kapseret Road", "city": "Eldoret", "county": "Uasin Gishu", "postal_code": "30100"}', '{"allergies": ["Dairy"], "medications": [], "conditions": [], "bloodType": "B+", "doctorContact": "+254712345678"}', '[{"name": "Aisha Ali", "phone": "+254767890123", "relationship": "Mother"}, {"name": "Hassan Ali", "phone": "+254778901234", "relationship": "Father"}]', '{"needsTransport": true, "pickupPoint": "Kapseret Junction", "dropoffPoint": "Kapseret Junction", "specialInstructions": "No dairy products"}', 'QR_LA2024003', '1fd55bdb-517a-4213-a914-8ff59dbfe3ed'),

('ssss4444-tttt-uuuu-vvvv-wwwwwwww4444', 'LA2024004', 'Brian Mutai', '2015-11-05', 'Grade 3', '3B', 'male', '967a12e4-8652-485f-94c4-e69d0c32131c', '967a12e4-8652-485f-94c4-e69d0c32131c', 'aaaa1111-bbbb-cccc-dddd-eeeeeeee1111', '{"street": "Uganda Road", "city": "Eldoret", "county": "Uasin Gishu", "postal_code": "30100"}', '{"allergies": [], "medications": [], "conditions": [], "bloodType": "O-", "doctorContact": "+254712345678"}', '[{"name": "Ruth Mutai", "phone": "+254789012345", "relationship": "Mother"}, {"name": "Peter Mutai", "phone": "+254790123456", "relationship": "Father"}]', '{"needsTransport": true, "pickupPoint": "Uganda Road", "dropoffPoint": "Uganda Road", "specialInstructions": null}', 'QR_LA2024004', '1fd55bdb-517a-4213-a914-8ff59dbfe3ed'),

('ssss5555-tttt-uuuu-vvvv-wwwwwwww5555', 'LA2024005', 'Mercy Chebet', '2014-06-18', 'Grade 4', '4A', 'female', '967a12e4-8652-485f-94c4-e69d0c32131c', '967a12e4-8652-485f-94c4-e69d0c32131c', 'aaaa2222-bbbb-cccc-dddd-eeeeeeee2222', '{"street": "Pioneer Estate", "city": "Eldoret", "county": "Uasin Gishu", "postal_code": "30100"}', '{"allergies": [], "medications": [], "conditions": [], "bloodType": "AB+", "doctorContact": "+254712345678"}', '[{"name": "Susan Chebet", "phone": "+254701234567", "relationship": "Mother"}, {"name": "Joseph Chebet", "phone": "+254712345678", "relationship": "Father"}]', '{"needsTransport": true, "pickupPoint": "Pioneer Estate Gate", "dropoffPoint": "Pioneer Estate Gate", "specialInstructions": null}', 'QR_LA2024005', '1fd55bdb-517a-4213-a914-8ff59dbfe3ed')
ON CONFLICT (id) DO NOTHING;

-- Sample attendance records
INSERT INTO attendance (student_id, route_id, vehicle_id, driver_id, date, pickup_time, dropoff_time, status, school_id) VALUES
('ssss1111-tttt-uuuu-vvvv-wwwwwwww1111', 'aaaa1111-bbbb-cccc-dddd-eeeeeeee1111', '11111111-1111-1111-1111-111111111111', '967a12e4-8652-485f-94c4-e69d0c32131c', CURRENT_DATE - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '1 day 1 hour', CURRENT_TIMESTAMP - INTERVAL '1 day 30 minutes', 'present', '1fd55bdb-517a-4213-a914-8ff59dbfe3ed'),
('ssss2222-tttt-uuuu-vvvv-wwwwwwww2222', 'aaaa2222-bbbb-cccc-dddd-eeeeeeee2222', '22222222-2222-2222-2222-222222222222', '967a12e4-8652-485f-94c4-e69d0c32131c', CURRENT_DATE - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '1 day 1 hour', CURRENT_TIMESTAMP - INTERVAL '1 day 30 minutes', 'present', '1fd55bdb-517a-4213-a914-8ff59dbfe3ed'),
('ssss3333-tttt-uuuu-vvvv-wwwwwwww3333', 'aaaa3333-bbbb-cccc-dddd-eeeeeeee3333', '33333333-3333-3333-3333-333333333333', '967a12e4-8652-485f-94c4-e69d0c32131c', CURRENT_DATE - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '1 day 1 hour', CURRENT_TIMESTAMP - INTERVAL '1 day 30 minutes', 'late', '1fd55bdb-517a-4213-a914-8ff59dbfe3ed'),
('ssss1111-tttt-uuuu-vvvv-wwwwwwww1111', 'aaaa1111-bbbb-cccc-dddd-eeeeeeee1111', '11111111-1111-1111-1111-111111111111', '967a12e4-8652-485f-94c4-e69d0c32131c', CURRENT_DATE, CURRENT_TIMESTAMP - INTERVAL '1 hour', CURRENT_TIMESTAMP - INTERVAL '30 minutes', 'present', '1fd55bdb-517a-4213-a914-8ff59dbfe3ed'),
('ssss2222-tttt-uuuu-vvvv-wwwwwwww2222', 'aaaa2222-bbbb-cccc-dddd-eeeeeeee2222', '22222222-2222-2222-2222-222222222222', '967a12e4-8652-485f-94c4-e69d0c32131c', CURRENT_DATE, CURRENT_TIMESTAMP - INTERVAL '1 hour', CURRENT_TIMESTAMP - INTERVAL '30 minutes', 'present', '1fd55bdb-517a-4213-a914-8ff59dbfe3ed')
ON CONFLICT DO NOTHING;

-- Sample payments
INSERT INTO payments (transaction_id, student_id, parent_id, amount, currency, description, type, method, status, payment_details, due_date, paid_at, school_id) VALUES
('PAY2024001', 'ssss1111-tttt-uuuu-vvvv-wwwwwwww1111', '967a12e4-8652-485f-94c4-e69d0c32131c', 5000.00, 'KES', 'Term 1 Transport Fee', 'transport_fee', 'mpesa', 'completed', '{"mpesa_code": "QWE123RTY", "phone": "+254723456789"}', CURRENT_DATE + INTERVAL '30 days', CURRENT_TIMESTAMP - INTERVAL '5 days', '1fd55bdb-517a-4213-a914-8ff59dbfe3ed'),
('PAY2024002', 'ssss2222-tttt-uuuu-vvvv-wwwwwwww2222', '967a12e4-8652-485f-94c4-e69d0c32131c', 5000.00, 'KES', 'Term 1 Transport Fee', 'transport_fee', 'mpesa', 'completed', '{"mpesa_code": "ASD456FGH", "phone": "+254745678901"}', CURRENT_DATE + INTERVAL '30 days', CURRENT_TIMESTAMP - INTERVAL '3 days', '1fd55bdb-517a-4213-a914-8ff59dbfe3ed'),
('PAY2024003', 'ssss3333-tttt-uuuu-vvvv-wwwwwwww3333', '967a12e4-8652-485f-94c4-e69d0c32131c', 5000.00, 'KES', 'Term 1 Transport Fee', 'transport_fee', 'mpesa', 'pending', '{"phone": "+254767890123"}', CURRENT_DATE + INTERVAL '15 days', NULL, '1fd55bdb-517a-4213-a914-8ff59dbfe3ed'),
('PAY2024004', 'ssss4444-tttt-uuuu-vvvv-wwwwwwww4444', '967a12e4-8652-485f-94c4-e69d0c32131c', 500.00, 'KES', 'Late Fee - Late Pickup', 'late_fee', 'cash', 'completed', '{"receipt_number": "RF001"}', CURRENT_DATE - INTERVAL '5 days', CURRENT_TIMESTAMP - INTERVAL '2 days', '1fd55bdb-517a-4213-a914-8ff59dbfe3ed')
ON CONFLICT (transaction_id) DO NOTHING;

-- Sample trips
INSERT INTO trips (route_id, vehicle_id, driver_id, date, start_time, end_time, start_mileage, end_mileage, fuel_used, students_transported, status, school_id) VALUES
('aaaa1111-bbbb-cccc-dddd-eeeeeeee1111', '11111111-1111-1111-1111-111111111111', '967a12e4-8652-485f-94c4-e69d0c32131c', CURRENT_DATE - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '1 day 2 hours', CURRENT_TIMESTAMP - INTERVAL '1 day 1 hour', 12500.5, 12525.8, 15.5, ARRAY['ssss1111-tttt-uuuu-vvvv-wwwwwwww1111', 'ssss4444-tttt-uuuu-vvvv-wwwwwwww4444'], 'completed', '1fd55bdb-517a-4213-a914-8ff59dbfe3ed'),
('aaaa2222-bbbb-cccc-dddd-eeeeeeee2222', '22222222-2222-2222-2222-222222222222', '967a12e4-8652-485f-94c4-e69d0c32131c', CURRENT_DATE - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '1 day 2 hours', CURRENT_TIMESTAMP - INTERVAL '1 day 1 hour', 8750.2, 8772.5, 18.2, ARRAY['ssss2222-tttt-uuuu-vvvv-wwwwwwww2222', 'ssss5555-tttt-uuuu-vvvv-wwwwwwww5555'], 'completed', '1fd55bdb-517a-4213-a914-8ff59dbfe3ed'),
('aaaa1111-bbbb-cccc-dddd-eeeeeeee1111', '11111111-1111-1111-1111-111111111111', '967a12e4-8652-485f-94c4-e69d0c32131c', CURRENT_DATE, CURRENT_TIMESTAMP - INTERVAL '2 hours', CURRENT_TIMESTAMP - INTERVAL '1 hour', 12525.8, 12551.1, 16.0, ARRAY['ssss1111-tttt-uuuu-vvvv-wwwwwwww1111', 'ssss4444-tttt-uuuu-vvvv-wwwwwwww4444'], 'completed', '1fd55bdb-517a-4213-a914-8ff59dbfe3ed')
ON CONFLICT DO NOTHING;

-- Sample live tracking data
INSERT INTO live_tracking (vehicle_id, location, speed, heading, timestamp, route_id, driver_id, status, students_on_board, next_stop, school_id) VALUES
('11111111-1111-1111-1111-111111111111', '{"lat": 0.5143, "lng": 35.2696, "address": "Eldoret Town Center"}', 35.5, 270.0, CURRENT_TIMESTAMP - INTERVAL '5 minutes', 'aaaa1111-bbbb-cccc-dddd-eeeeeeee1111', '967a12e4-8652-485f-94c4-e69d0c32131c', 'on_route', ARRAY['ssss1111-tttt-uuuu-vvvv-wwwwwwww1111'], 'Next: Uganda Road', '1fd55bdb-517a-4213-a914-8ff59dbfe3ed'),
('22222222-2222-2222-2222-222222222222', '{"lat": 0.5200, "lng": 35.2800, "address": "Langas Estate"}', 25.2, 180.0, CURRENT_TIMESTAMP - INTERVAL '3 minutes', 'aaaa2222-bbbb-cccc-dddd-eeeeeeee2222', '967a12e4-8652-485f-94c4-e69d0c32131c', 'at_stop', ARRAY['ssss2222-tttt-uuuu-vvvv-wwwwwwww2222'], 'At: Langas Shopping Center', '1fd55bdb-517a-4213-a914-8ff59dbfe3ed'),
('33333333-3333-3333-3333-333333333333', '{"lat": 0.5000, "lng": 35.2900, "address": "Kapseret Road"}', 0.0, 90.0, CURRENT_TIMESTAMP - INTERVAL '1 minute', 'aaaa3333-bbbb-cccc-dddd-eeeeeeee3333', '967a12e4-8652-485f-94c4-e69d0c32131c', 'at_stop', ARRAY['ssss3333-tttt-uuuu-vvvv-wwwwwwww3333'], 'At: Kapseret Junction', '1fd55bdb-517a-4213-a914-8ff59dbfe3ed')
ON CONFLICT DO NOTHING;

-- Sample chats
INSERT INTO chats (id, name, description, type, created_by, school_id) VALUES
('cccc1111-dddd-eeee-ffff-aaaaaaa11111', 'School Announcements', 'Official school announcements and updates', 'channel', '967a12e4-8652-485f-94c4-e69d0c32131c', '1fd55bdb-517a-4213-a914-8ff59dbfe3ed'),
('cccc2222-dddd-eeee-ffff-aaaaaaa22222', 'Grade 3 Parents', 'Communication group for Grade 3 parents', 'group', '967a12e4-8652-485f-94c4-e69d0c32131c', '1fd55bdb-517a-4213-a914-8ff59dbfe3ed'),
('cccc3333-dddd-eeee-ffff-aaaaaaa33333', 'Transport Updates', 'Live updates about school transport', 'channel', '967a12e4-8652-485f-94c4-e69d0c32131c', '1fd55bdb-517a-4213-a914-8ff59dbfe3ed')
ON CONFLICT (id) DO NOTHING;

-- Sample chat participants
INSERT INTO chat_participants (chat_id, user_id, role) VALUES
('cccc1111-dddd-eeee-ffff-aaaaaaa11111', '967a12e4-8652-485f-94c4-e69d0c32131c', 'admin'),
('cccc2222-dddd-eeee-ffff-aaaaaaa22222', '967a12e4-8652-485f-94c4-e69d0c32131c', 'member'),
('cccc3333-dddd-eeee-ffff-aaaaaaa33333', '967a12e4-8652-485f-94c4-e69d0c32131c', 'admin')
ON CONFLICT (chat_id, user_id) DO NOTHING;

-- Sample messages
INSERT INTO messages (chat_id, sender_id, content, message_type, school_id) VALUES
('cccc1111-dddd-eeee-ffff-aaaaaaa11111', '967a12e4-8652-485f-94c4-e69d0c32131c', 'Welcome to the new school term! We are excited to have all our students back.', 'text', '1fd55bdb-517a-4213-a914-8ff59dbfe3ed'),
('cccc3333-dddd-eeee-ffff-aaaaaaa33333', '967a12e4-8652-485f-94c4-e69d0c32131c', 'All buses are running on schedule today. Current locations available in the live tracking.', 'text', '1fd55bdb-517a-4213-a914-8ff59dbfe3ed'),
('cccc2222-dddd-eeee-ffff-aaaaaaa22222', '967a12e4-8652-485f-94c4-e69d0c32131c', 'Parent-teacher meetings for Grade 3 will be held next Friday. Please confirm attendance.', 'text', '1fd55bdb-517a-4213-a914-8ff59dbfe3ed')
ON CONFLICT DO NOTHING;

-- Sample settings
INSERT INTO settings (key, value, category, description, school_id) VALUES
('school_hours_start', '"07:00"', 'general', 'School starting time', '1fd55bdb-517a-4213-a914-8ff59dbfe3ed'),
('school_hours_end', '"15:30"', 'general', 'School ending time', '1fd55bdb-517a-4213-a914-8ff59dbfe3ed'),
('transport_fee_per_term', '5000', 'finance', 'Transport fee amount per term in KES', '1fd55bdb-517a-4213-a914-8ff59dbfe3ed'),
('late_pickup_fee', '500', 'finance', 'Late pickup fee in KES', '1fd55bdb-517a-4213-a914-8ff59dbfe3ed'),
('emergency_contact', '"+254712345678"', 'emergency', 'School emergency contact number', '1fd55bdb-517a-4213-a914-8ff59dbfe3ed'),
('mpesa_paybill', '"123456"', 'finance', 'M-Pesa paybill number for payments', '1fd55bdb-517a-4213-a914-8ff59dbfe3ed'),
('notification_sms_enabled', 'true', 'notifications', 'Enable SMS notifications', '1fd55bdb-517a-4213-a914-8ff59dbfe3ed'),
('gps_tracking_enabled', 'true', 'transport', 'Enable GPS tracking for vehicles', '1fd55bdb-517a-4213-a914-8ff59dbfe3ed')
ON CONFLICT (key, school_id) DO NOTHING;