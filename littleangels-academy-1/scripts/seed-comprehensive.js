#!/usr/bin/env node
/**
 * Comprehensive Seed Script for Little Angels Transport System
 * 
 * This script populates the Supabase database with realistic, production-like data:
 * - 1 school
 * - 40 students (across grades 1-12)
 * - 20 parents
 * - 10 staff members (5 teachers, 3 drivers, 2 admin/accounts)
 * - 5 vehicles
 * - 10 routes
 * - Attendance records
 * - Payment records
 * - Notifications
 * - Live tracking data
 * 
 * Usage: node scripts/seed-comprehensive.js
 */

import { createClient } from '@supabase/supabase-js';
import { faker } from '@faker-js/faker';

// Supabase configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://zvkfuljxidxtuqrmquso.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2a2Z1bGp4aWR4dHVxcm1xdXNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5NTQxMTgsImV4cCI6MjA3MTUzMDExOH0.aL72I0Ls2ziZs2EJaX_bpMkI9gj8AGHFModINaQVb_8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper functions
const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Grade configurations
const GRADES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const CLASSES = ['A', 'B', 'C'];
const VEHICLE_TYPES = ['bus', 'van', 'minibus'];
const VEHICLE_MAKES = ['Toyota', 'Mercedes-Benz', 'Volvo', 'Tata', 'Ashok Leyland'];
const COLORS = ['White', 'Yellow', 'Blue', 'Red', 'Green', 'Orange'];

// Indian cities for realistic data
const CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 
  'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'
];

// Clear existing data (optional)
async function clearData() {
  console.log('🗑️  Clearing existing data...');
  
  const tables = [
    'attendance', 'live_tracking', 'notifications', 'payments',
    'students', 'routes', 'vehicles', 'users', 'schools'
  ];
  
  for (const table of tables) {
    try {
      await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
      console.log(`  ✓ Cleared ${table}`);
    } catch (error) {
      console.log(`  ⚠️  Could not clear ${table}: ${error.message}`);
    }
  }
}

// Check if schema exists
async function checkSchema() {
  console.log('🔍 Checking database schema...');
  
  try {
    const { data, error } = await supabase.from('schools').select('id').limit(1);
    
    if (error && error.message.includes('does not exist')) {
      console.log('❌ Schema not found. Please run the schema.sql file in Supabase SQL Editor first.');
      console.log('   File location: database/schema.sql');
      process.exit(1);
    }
    
    console.log('✅ Schema exists!');
    return true;
  } catch (error) {
    console.error('❌ Schema check failed:', error.message);
    process.exit(1);
  }
}

// Seed school
async function seedSchool() {
  console.log('\n🏫 Seeding school...');
  
  const school = {
    name: 'Little Angels Academy',
    address: '123 Education Lane, ' + randomElement(CITIES) + ', India 400001',
    phone: '+91 ' + faker.phone.number('#### ### ###'),
    email: 'info@littleangels.edu.in',
    website: 'https://littleangels.edu.in',
    established: '2010-04-01',
    motto: 'Excellence in Education, Care in Transport',
    settings: {
      timezone: 'Asia/Kolkata',
      currency: 'INR',
      academicYear: '2024-2025',
      transportFee: 5000,
      latePickupFee: 500
    }
  };
  
  const { data, error } = await supabase.from('schools').insert(school).select().single();
  
  if (error) throw error;
  console.log('  ✓ School created:', data.name);
  return data;
}

// Seed users (parents, teachers, drivers, admin)
async function seedUsers(schoolId) {
  console.log('\n👥 Seeding users...');
  
  const users = [];
  
  // Admin users (2)
  for (let i = 0; i < 2; i++) {
    users.push({
      email: `admin${i + 1}@littleangels.edu.in`,
      name: faker.person.fullName(),
      phone: '+91 ' + faker.phone.number('#### ### ###'),
      role: i === 0 ? 'admin' : 'accounts',
      address: faker.location.streetAddress() + ', ' + randomElement(CITIES),
      national_id: 'ADMIN' + faker.string.alphanumeric(8).toUpperCase(),
      emergency_contact: {
        name: faker.person.fullName(),
        phone: '+91 ' + faker.phone.number('#### ### ###'),
        relationship: 'spouse'
      },
      is_active: true,
      school_id: schoolId
    });
  }
  
  // Teachers (5)
  for (let i = 0; i < 5; i++) {
    users.push({
      email: `teacher${i + 1}@littleangels.edu.in`,
      name: faker.person.fullName(),
      phone: '+91 ' + faker.phone.number('#### ### ###'),
      role: 'teacher',
      address: faker.location.streetAddress() + ', ' + randomElement(CITIES),
      national_id: 'TCH' + faker.string.alphanumeric(8).toUpperCase(),
      emergency_contact: {
        name: faker.person.fullName(),
        phone: '+91 ' + faker.phone.number('#### ### ###'),
        relationship: randomElement(['spouse', 'parent', 'sibling'])
      },
      is_active: true,
      school_id: schoolId
    });
  }
  
  // Drivers (3)
  for (let i = 0; i < 3; i++) {
    users.push({
      email: `driver${i + 1}@littleangels.edu.in`,
      name: faker.person.fullName(),
      phone: '+91 ' + faker.phone.number('#### ### ###'),
      role: 'driver',
      address: faker.location.streetAddress() + ', ' + randomElement(CITIES),
      national_id: 'DRV' + faker.string.alphanumeric(8).toUpperCase(),
      emergency_contact: {
        name: faker.person.fullName(),
        phone: '+91 ' + faker.phone.number('#### ### ###'),
        relationship: randomElement(['spouse', 'parent', 'sibling'])
      },
      is_active: true,
      school_id: schoolId
    });
  }
  
  // Parents (20)
  for (let i = 0; i < 20; i++) {
    users.push({
      email: `parent${i + 1}@example.com`,
      name: faker.person.fullName(),
      phone: '+91 ' + faker.phone.number('#### ### ###'),
      role: 'parent',
      address: faker.location.streetAddress() + ', ' + randomElement(CITIES),
      national_id: 'PAR' + faker.string.alphanumeric(8).toUpperCase(),
      emergency_contact: {
        name: faker.person.fullName(),
        phone: '+91 ' + faker.phone.number('#### ### ###'),
        relationship: 'spouse'
      },
      is_active: true,
      school_id: schoolId
    });
  }
  
  const { data, error } = await supabase.from('users').insert(users).select();
  
  if (error) throw error;
  console.log(`  ✓ Created ${data.length} users`);
  return data;
}

// Seed vehicles
async function seedVehicles(schoolId, drivers) {
  console.log('\n🚌 Seeding vehicles...');
  
  const vehicles = [];
  
  for (let i = 0; i < 5; i++) {
    const driver = drivers[i % drivers.length];
    
    vehicles.push({
      plate_number: 'MH' + faker.string.numeric(2) + faker.string.alpha(2).toUpperCase() + faker.string.numeric(4),
      make: randomElement(VEHICLE_MAKES),
      model: faker.vehicle.model(),
      year: randomInt(2018, 2024),
      capacity: randomElement([20, 30, 40, 50]),
      type: randomElement(VEHICLE_TYPES),
      color: randomElement(COLORS),
      driver_id: driver.id,
      gps_device_id: 'GPS' + faker.string.alphanumeric(10).toUpperCase(),
      current_location: {
        lat: faker.location.latitude({ min: 18.9, max: 19.3 }),
        lng: faker.location.longitude({ min: 72.8, max: 73.0 }),
        address: faker.location.streetAddress() + ', Mumbai'
      },
      status: randomElement(['active', 'active', 'active', 'maintenance']),
      insurance: {
        provider: randomElement(['HDFC ERGO', 'ICICI Lombard', 'Bajaj Allianz']),
        policyNumber: 'INS' + faker.string.alphanumeric(12).toUpperCase(),
        expiryDate: faker.date.future({ years: 1 }).toISOString(),
        coverage: 'Comprehensive'
      },
      licenses: {
        registration: 'REG' + faker.string.alphanumeric(10).toUpperCase(),
        permit: 'PER' + faker.string.alphanumeric(10).toUpperCase(),
        fitness: 'FIT' + faker.string.alphanumeric(10).toUpperCase(),
        pollution: 'POL' + faker.string.alphanumeric(10).toUpperCase()
      },
      features: randomElement([
        ['GPS Tracking', 'CCTV', 'First Aid Kit'],
        ['GPS Tracking', 'Fire Extinguisher', 'Emergency Exit'],
        ['GPS Tracking', 'CCTV', 'Air Conditioning', 'First Aid Kit']
      ]),
      school_id: schoolId
    });
  }
  
  const { data, error } = await supabase.from('vehicles').insert(vehicles).select();
  
  if (error) throw error;
  console.log(`  ✓ Created ${data.length} vehicles`);
  return data;
}

// Seed routes
async function seedRoutes(schoolId, vehicles, drivers) {
  console.log('\n🛣️  Seeding routes...');
  
  const routes = [];
  const areas = [
    'Andheri', 'Bandra', 'Borivali', 'Dadar', 'Goregaon', 
    'Juhu', 'Malad', 'Powai', 'Santacruz', 'Vile Parle'
  ];
  
  for (let i = 0; i < 10; i++) {
    const vehicle = vehicles[i % vehicles.length];
    const driver = drivers[i % drivers.length];
    const area = areas[i];
    
    const stops = [];
    const numStops = randomInt(3, 6);
    
    for (let j = 0; j < numStops; j++) {
      stops.push({
        name: `${area} Stop ${j + 1}`,
        location: {
          lat: faker.location.latitude({ min: 18.9, max: 19.3 }),
          lng: faker.location.longitude({ min: 72.8, max: 73.0 })
        },
        time: `${7 + j}:${randomInt(0, 5) * 10}`,
        sequence: j + 1
      });
    }
    
    routes.push({
      name: `Route ${i + 1} - ${area}`,
      description: `Morning and evening route covering ${area} area`,
      vehicle_id: vehicle.id,
      driver_id: driver.id,
      stops: stops,
      distance: faker.number.float({ min: 10, max: 30, precision: 0.1 }),
      estimated_duration: randomInt(30, 90),
      schedule: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: i < 5,
        sunday: false
      },
      fuel_consumption: faker.number.float({ min: 8, max: 15, precision: 0.1 }),
      toll_fees: faker.number.float({ min: 50, max: 200, precision: 10 }),
      is_active: true,
      school_id: schoolId
    });
  }
  
  const { data, error } = await supabase.from('routes').insert(routes).select();
  
  if (error) throw error;
  console.log(`  ✓ Created ${data.length} routes`);
  return data;
}

// Seed students
async function seedStudents(schoolId, parents, teachers, routes) {
  console.log('\n👦👧 Seeding students...');
  
  const students = [];
  
  for (let i = 0; i < 40; i++) {
    const parent = parents[i % parents.length];
    const teacher = teachers[i % teachers.length];
    const route = routes[i % routes.length];
    const grade = GRADES[i % GRADES.length];
    const classSection = CLASSES[i % CLASSES.length];
    const gender = randomElement(['male', 'female']);
    
    students.push({
      student_id: 'STU' + String(i + 1).padStart(4, '0'),
      name: faker.person.fullName({ sex: gender === 'male' ? 'male' : 'female' }),
      date_of_birth: faker.date.birthdate({ min: 5, max: 18, mode: 'age' }).toISOString().split('T')[0],
      grade: grade,
      class: classSection,
      gender: gender,
      qr_code: 'QR' + faker.string.alphanumeric(16).toUpperCase(),
      parent_id: parent.id,
      teacher_id: teacher.id,
      route_id: route.id,
      address: {
        line1: faker.location.streetAddress(),
        line2: faker.location.secondaryAddress(),
        city: randomElement(CITIES),
        state: 'Maharashtra',
        pincode: faker.location.zipCode('####00'),
        landmark: faker.location.street()
      },
      medical_info: {
        allergies: randomElement([[], ['Peanuts'], ['Dairy'], ['Dust']]),
        medications: [],
        conditions: randomElement([[], ['Asthma'], ['Diabetes']]),
        bloodType: randomElement(['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-']),
        doctorContact: '+91 ' + faker.phone.number('#### ### ###')
      },
      emergency_contacts: [
        {
          name: parent.name,
          phone: parent.phone,
          relationship: 'parent',
          isPrimary: true
        },
        {
          name: faker.person.fullName(),
          phone: '+91 ' + faker.phone.number('#### ### ###'),
          relationship: randomElement(['grandparent', 'uncle', 'aunt']),
          isPrimary: false
        }
      ],
      transport_info: {
        needsTransport: randomElement([true, true, true, false]),
        pickupPoint: route.stops[0]?.name || 'Main Gate',
        dropoffPoint: route.stops[route.stops.length - 1]?.name || 'Main Gate',
        specialInstructions: randomElement([null, 'Needs assistance', 'Must be handed to parent only'])
      },
      is_active: true,
      school_id: schoolId
    });
  }
  
  const { data, error } = await supabase.from('students').insert(students).select();
  
  if (error) throw error;
  console.log(`  ✓ Created ${data.length} students`);
  return data;
}

// Seed attendance
async function seedAttendance(schoolId, students, routes, vehicles, drivers) {
  console.log('\n📋 Seeding attendance records...');
  
  const attendance = [];
  const today = new Date();
  
  // Generate attendance for last 30 days
  for (let day = 0; day < 30; day++) {
    const date = new Date(today);
    date.setDate(date.getDate() - day);
    const dateStr = date.toISOString().split('T')[0];
    
    // Only weekdays
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    for (const student of students) {
      if (!student.transport_info?.needsTransport) continue;
      
      const route = routes.find(r => r.id === student.route_id);
      if (!route) continue;
      
      const vehicle = vehicles.find(v => v.id === route.vehicle_id);
      const driver = drivers.find(d => d.id === route.driver_id);
      
      const status = randomElement([
        'present', 'present', 'present', 'present', 'present',
        'absent', 'late'
      ]);
      
      attendance.push({
        student_id: student.id,
        route_id: route.id,
        vehicle_id: vehicle?.id,
        driver_id: driver?.id,
        date: dateStr,
        pickup_time: status === 'present' || status === 'late' 
          ? new Date(date.setHours(7 + randomInt(0, 2), randomInt(0, 59))).toISOString()
          : null,
        pickup_location: status === 'present' || status === 'late'
          ? { lat: faker.location.latitude(), lng: faker.location.longitude() }
          : null,
        dropoff_time: status === 'present'
          ? new Date(date.setHours(15 + randomInt(0, 2), randomInt(0, 59))).toISOString()
          : null,
        dropoff_location: status === 'present'
          ? { lat: faker.location.latitude(), lng: faker.location.longitude() }
          : null,
        status: status,
        scanned_by: driver?.id,
        notes: status === 'late' ? 'Traffic delay' : null,
        parent_notified: randomElement([true, false]),
        school_id: schoolId
      });
    }
  }
  
  // Insert in batches
  const batchSize = 100;
  let inserted = 0;
  
  for (let i = 0; i < attendance.length; i += batchSize) {
    const batch = attendance.slice(i, i + batchSize);
    const { error } = await supabase.from('attendance').insert(batch);
    if (error) throw error;
    inserted += batch.length;
  }
  
  console.log(`  ✓ Created ${inserted} attendance records`);
}

// Seed payments
async function seedPayments(schoolId, students, parents) {
  console.log('\n💰 Seeding payment records...');
  
  const payments = [];
  
  for (const student of students) {
    if (!student.transport_info?.needsTransport) continue;
    
    const parent = parents.find(p => p.id === student.parent_id);
    
    // Generate 3-6 months of payment history
    const numPayments = randomInt(3, 6);
    
    for (let i = 0; i < numPayments; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      const status = i === 0 
        ? randomElement(['pending', 'completed'])
        : 'completed';
      
      payments.push({
        student_id: student.id,
        parent_id: parent?.id,
        amount: 5000,
        month: date.toISOString().slice(0, 7), // YYYY-MM format
        payment_method: randomElement(['upi', 'credit_card', 'debit_card', 'net_banking', 'cash']),
        status: status,
        transaction_id: status === 'completed' ? 'TXN' + faker.string.alphanumeric(16).toUpperCase() : null,
        payment_date: status === 'completed' ? date.toISOString() : null,
        notes: i === 0 && status === 'pending' ? 'Payment due' : null,
        school_id: schoolId
      });
    }
  }
  
  const { data, error } = await supabase.from('payments').insert(payments).select();
  
  if (error) throw error;
  console.log(`  ✓ Created ${data.length} payment records`);
}

// Seed notifications
async function seedNotifications(schoolId, users, students) {
  console.log('\n🔔 Seeding notifications...');
  
  const notifications = [];
  const admin = users.find(u => u.role === 'admin');
  
  // System notifications
  notifications.push({
    title: 'Welcome to Little Angels Transport System',
    message: 'Your account has been successfully set up. Start tracking your child\'s transport in real-time!',
    type: 'success',
    priority: 'medium',
    recipients: users.filter(u => u.role === 'parent').map(u => u.id),
    channels: ['in_app', 'email'],
    sent_by: admin.id,
    status: 'sent',
    school_id: schoolId
  });
  
  // Transport updates
  for (let i = 0; i < 10; i++) {
    const student = randomElement(students);
    const parent = users.find(u => u.id === student.parent_id);
    
    notifications.push({
      title: `Transport Update - ${student.name}`,
      message: randomElement([
        'Your child has been picked up successfully.',
        'Your child has been dropped off safely.',
        'Vehicle is running 10 minutes late due to traffic.',
        'Route completed successfully.'
      ]),
      type: randomElement(['info', 'success', 'warning']),
      priority: randomElement(['low', 'medium', 'high']),
      recipients: [parent.id],
      channels: ['in_app', 'sms'],
      sent_by: admin.id,
      status: 'sent',
      read_by: randomElement([[], [parent.id]]),
      related_entity: {
        type: 'student',
        id: student.id,
        name: student.name
      },
      school_id: schoolId
    });
  }
  
  const { data, error } = await supabase.from('notifications').insert(notifications).select();
  
  if (error) throw error;
  console.log(`  ✓ Created ${data.length} notifications`);
}

// Seed live tracking
async function seedLiveTracking(schoolId, vehicles, routes, drivers, students) {
  console.log('\n📍 Seeding live tracking data...');
  
  const tracking = [];
  
  for (const vehicle of vehicles.slice(0, 3)) { // Only active vehicles
    const route = routes.find(r => r.vehicle_id === vehicle.id);
    const driver = drivers.find(d => d.id === route?.driver_id);
    const routeStudents = students.filter(s => s.route_id === route?.id).slice(0, 10);
    
    tracking.push({
      vehicle_id: vehicle.id,
      location: vehicle.current_location,
      speed: faker.number.float({ min: 0, max: 60, precision: 0.1 }),
      heading: faker.number.float({ min: 0, max: 360, precision: 0.1 }),
      timestamp: new Date().toISOString(),
      route_id: route?.id,
      driver_id: driver?.id,
      status: randomElement(['on_route', 'at_stop', 'off_duty']),
      students_on_board: routeStudents.map(s => s.id),
      next_stop: route?.stops[randomInt(0, route.stops.length - 1)]?.name || 'School',
      estimated_arrival: new Date(Date.now() + randomInt(10, 30) * 60000).toISOString(),
      school_id: schoolId
    });
  }
  
  const { data, error } = await supabase.from('live_tracking').insert(tracking).select();
  
  if (error) throw error;
  console.log(`  ✓ Created ${data.length} live tracking records`);
}

// Main seeding function
async function main() {
  console.log('🌱 Starting comprehensive seed process...\n');
  console.log('================================================');
  
  try {
    // Check schema
    await checkSchema();
    
    // Optional: Clear existing data
    // Uncomment if you want to start fresh
    // await clearData();
    
    // Seed data in order
    const school = await seedSchool();
    const users = await seedUsers(school.id);
    
    const parents = users.filter(u => u.role === 'parent');
    const teachers = users.filter(u => u.role === 'teacher');
    const drivers = users.filter(u => u.role === 'driver');
    
    const vehicles = await seedVehicles(school.id, drivers);
    const routes = await seedRoutes(school.id, vehicles, drivers);
    const students = await seedStudents(school.id, parents, teachers, routes);
    
    await seedAttendance(school.id, students, routes, vehicles, drivers);
    await seedPayments(school.id, students, parents);
    await seedNotifications(school.id, users, students);
    await seedLiveTracking(school.id, vehicles, routes, drivers, students);
    
    console.log('\n================================================');
    console.log('✅ Seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`  • 1 school`);
    console.log(`  • ${users.length} users (${parents.length} parents, ${teachers.length} teachers, ${drivers.length} drivers)`);
    console.log(`  • ${vehicles.length} vehicles`);
    console.log(`  • ${routes.length} routes`);
    console.log(`  • ${students.length} students`);
    console.log(`  • Attendance records for 30 days`);
    console.log(`  • Payment history for all students`);
    console.log(`  • System notifications`);
    console.log(`  • Live tracking data\n`);
    
    console.log('🔐 Test credentials:');
    console.log('  Admin: admin1@littleangels.edu.in');
    console.log('  Teacher: teacher1@littleangels.edu.in');
    console.log('  Driver: driver1@littleangels.edu.in');
    console.log('  Parent: parent1@example.com');
    console.log('  Password: (use Supabase auth to set passwords)\n');
    
  } catch (error) {
    console.error('\n❌ Seed failed:', error.message);
    console.error('Details:', error);
    process.exit(1);
  }
}

// Run the script
main();
