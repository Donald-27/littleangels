import React, { useState, useEffect, useCallback } from 'react';
import DashboardHeader from '../../components/DashboardHeader';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { 
  Bus, 
  MapPin, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Play,
  Pause,
  Square,
  Navigation,
  Phone,
  Calendar,
  TrendingUp,
  Fuel,
  Wrench,
  Bell,
  Eye,
  QrCode,
  Shield,
  Battery,
  Wifi,
  BatteryCharging,
  Gauge,
  Target,
  Zap,
  Sparkles,
  Route,
  Compass,
  Satellite,
  Radio,
  MessageCircle,
  FileText,
  Download,
  Upload,
  RefreshCw,
  MoreVertical,
  ChevronRight,
  ChevronDown,
  Star,
  Award,
  Crown,
  Medal,
  ThumbsUp,
  Heart,
  Rocket,
  Timer,
  BatteryLow,
  Cloud,
  Sun,
  CloudRain,
  Thermometer
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';
import LiveTracking from '../../components/LiveTracking';
import { toast } from 'sonner';

// Simple chart components for driver metrics
const LineChartSimple = ({ data, color = "#3b82f6", height = 80, title }) => {
  if (!data || data.length === 0) return (
    <div className="h-full flex items-center justify-center text-gray-400">
      <div className="text-center">
        <TrendingUp className="h-6 w-6 mx-auto mb-1 opacity-50" />
        <p className="text-xs">No data</p>
      </div>
    </div>
  );
  
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;
  
  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((point.value - minValue) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full h-full">
      {title && <p className="text-gray-600 text-xs mb-1 font-medium">{title}</p>}
      <svg width="100%" height={height} viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    </div>
  );
};

const DriverDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [assignedVehicle, setAssignedVehicle] = useState(null);
  const [assignedRoutes, setAssignedRoutes] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [realTimeData, setRealTimeData] = useState({
    gpsStatus: 'connected',
    networkStrength: 4,
    batteryLevel: 85,
    lastUpdate: new Date(),
    onlineDrivers: 12,
    activeTrips: 8
  });
  const [driverStats, setDriverStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    completedTrips: 0,
    totalHours: 0,
    onTimeRate: 95,
    safetyScore: 98,
    efficiency: 92,
    rating: 4.8,
    monthlyTrips: 0,
    fuelEfficiency: 0,
    distanceCovered: 0
  });
  const [quickActions, setQuickActions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [expandedSections, setExpandedSections] = useState({});
  const [selectedTab, setSelectedTab] = useState('overview');

  // Real-time data subscription
  useEffect(() => {
    if (!user?.id) return;

    const subscription = supabase
      .channel('driver-dashboard')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          tables: ['trips', 'attendance', 'vehicles'],
          filter: `driver_id=eq.${user.id}`
        },
        (payload) => {
          // Refresh data for significant changes
          if (['INSERT', 'UPDATE', 'DELETE'].includes(payload.eventType)) {
            fetchData();
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id]);

  // Real-time status polling
  useEffect(() => {
    const pollRealTimeStatus = () => {
      setRealTimeData(prev => ({
        ...prev,
        lastUpdate: new Date(),
        batteryLevel: Math.max(10, prev.batteryLevel - Math.random() * 2),
        networkStrength: Math.floor(Math.random() * 3) + 2,
        onlineDrivers: Math.floor(Math.random() * 5) + 10,
        activeTrips: Math.floor(Math.random() * 4) + 6
      }));
    };

    const interval = setInterval(pollRealTimeStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      
      // Fetch driver profile with enhanced data
      const { data: driverData, error: driverError } = await supabase
        .from('users')
        .select(`
          *,
          driver_profile:driver_profiles(*)
        `)
        .eq('id', user?.id)
        .single();

      if (driverError) throw driverError;

      // Fetch assigned vehicle with maintenance and GPS data
      const { data: vehicleData, error: vehicleError } = await supabase
        .from('vehicles')
        .select(`
          *,
          routes(name, description, stops, distance, estimated_duration),
          maintenance_logs(*),
          gps_data(*)
        `)
        .eq('driver_id', user?.id)
        .single();

      if (vehicleError && vehicleError.code !== 'PGRST116') throw vehicleError;
      setAssignedVehicle(vehicleData);

      // Fetch assigned routes with detailed information
      const { data: routesData, error: routesError } = await supabase
        .from('routes')
        .select(`
          *,
          vehicle:vehicles(plate_number, make, model, capacity, color),
          trips!inner(
            id,
            start_time,
            end_time,
            status,
            actual_duration
          ),
          stops:route_stops(*)
        `)
        .eq('driver_id', user?.id)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (routesError) throw routesError;
      setAssignedRoutes(routesData || []);

      // Fetch students for assigned routes with parent and emergency info
      const routeIds = routesData?.map(route => route.id) || [];
      if (routeIds.length > 0) {
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select(`
            *,
            parent:users!students_parent_id_fkey(name, phone, email),
            teacher:users!students_teacher_id_fkey(name, phone),
            emergency_contacts(*),
            medical_info(*)
          `)
          .in('route_id', routeIds)
          .eq('is_active', true)
          .order('name', { ascending: true });

        if (studentsError) throw studentsError;
        setStudents(studentsData || []);
      }

      // Fetch today's attendance with detailed records
      const today = new Date().toISOString().split('T')[0];
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select(`
          *,
          student:students(name, grade, class, photo_url),
          route:routes(name, description),
          vehicle:vehicles(plate_number)
        `)
        .eq('driver_id', user?.id)
        .gte('date', today)
        .order('pickup_time', { ascending: true });

      if (attendanceError) throw attendanceError;
      setAttendance(attendanceData || []);

      // Fetch current trip with real-time data
      const { data: tripData, error: tripError } = await supabase
        .from('trips')
        .select(`
          *,
          route:routes(name, description, stops, estimated_duration),
          vehicle:vehicles(plate_number, make, model),
          gps_data(*)
        `)
        .eq('driver_id', user?.id)
        .eq('status', 'in_progress')
        .single();

      if (tripError && tripError.code !== 'PGRST116') throw tripError;
      setCurrentTrip(tripData);

      // Calculate comprehensive driver stats
      const presentToday = attendanceData?.filter(a => a.status === 'present').length || 0;
      const totalStudents = students?.length || 0;

      // Fetch historical trip data for stats
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: historicalTrips, error: historyError } = await supabase
        .from('trips')
        .select('*')
        .eq('driver_id', user?.id)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
        .eq('status', 'completed');

      if (historyError) throw historyError;

      const completedTrips = historicalTrips?.length || 0;
      const totalHours = historicalTrips?.reduce((sum, trip) => {
        if (trip.start_time && trip.end_time) {
          const start = new Date(trip.start_time);
          const end = new Date(trip.end_time);
          return sum + (end - start) / (1000 * 60 * 60);
        }
        return sum;
      }, 0) || 0;

      const distanceCovered = historicalTrips?.reduce((sum, trip) => sum + (trip.distance_covered || 0), 0) || 0;
      const fuelEfficiency = distanceCovered > 0 ? (distanceCovered / (totalHours * 8)).toFixed(1) : 0; // Mock calculation

      setDriverStats({
        totalStudents,
        presentToday,
        completedTrips,
        totalHours: Math.round(totalHours),
        onTimeRate: 95,
        safetyScore: 98,
        efficiency: 92,
        rating: 4.8,
        monthlyTrips: completedTrips,
        fuelEfficiency,
        distanceCovered: Math.round(distanceCovered)
      });

      // Generate quick actions based on current state
      generateQuickActions(currentTrip, assignedVehicle);
      
      // Generate alerts based on vehicle and route conditions
      generateAlerts(vehicleData, routesData, studentsData);

    } catch (error) {
      console.error('Error fetching driver data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const generateQuickActions = (trip, vehicle) => {
    const actions = [
      {
        id: 'start-trip',
        title: 'Start New Trip',
        description: 'Begin transportation route',
        icon: Play,
        color: 'green',
        path: '/driver/trips/new',
        available: !trip
      },
      {
        id: 'mark-attendance',
        title: 'Mark Attendance',
        description: 'Record student presence',
        icon: CheckCircle,
        color: 'blue',
        path: '/driver/attendance',
        available: true
      },
      {
        id: 'vehicle-check',
        title: 'Vehicle Check',
        description: 'Pre-trip inspection',
        icon: Shield,
        color: 'orange',
        path: '/driver/vehicle-check',
        available: true
      },
      {
        id: 'report-issue',
        title: 'Report Issue',
        description: 'Log vehicle or route problem',
        icon: AlertTriangle,
        color: 'red',
        path: '/driver/issues',
        available: true
      },
      {
        id: 'contact-support',
        title: 'Contact Support',
        description: 'Get immediate assistance',
        icon: Phone,
        color: 'purple',
        path: '/driver/support',
        available: true
      },
      {
        id: 'view-schedule',
        title: 'Daily Schedule',
        description: 'Today\'s trip timeline',
        icon: Calendar,
        color: 'indigo',
        path: '/driver/schedule',
        available: true
      }
    ];

    setQuickActions(actions.filter(action => action.available));
  };

  const generateAlerts = (vehicle, routes, students) => {
    const alerts = [];

    // Vehicle maintenance alerts
    if (vehicle?.maintenance_info?.nextService) {
      const nextService = new Date(vehicle.maintenance_info.nextService);
      const daysUntilService = Math.ceil((nextService - new Date()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilService <= 7) {
        alerts.push({
          id: 'maintenance-due',
          type: 'warning',
          title: 'Maintenance Due Soon',
          message: `Vehicle service due in ${daysUntilService} days`,
          priority: daysUntilService <= 3 ? 'high' : 'medium'
        });
      }
    }

    // Route-specific alerts
    routes?.forEach(route => {
      if (route.students?.length > route.vehicle?.capacity) {
        alerts.push({
          id: `overcapacity-${route.id}`,
          type: 'error',
          title: 'Overcapacity Warning',
          message: `${route.name} exceeds vehicle capacity`,
          priority: 'high'
        });
      }
    });

    // Student-specific alerts
    students?.forEach(student => {
      if (student.medical_info?.allergies || student.medical_info?.conditions) {
        alerts.push({
          id: `medical-${student.id}`,
          type: 'info',
          title: 'Medical Alert',
          message: `${student.name} has medical considerations`,
          priority: 'medium'
        });
      }
    });

    setAlerts(alerts);
  };

  const startTrip = async (routeId) => {
    try {
      const route = assignedRoutes.find(r => r.id === routeId);
      if (!route) throw new Error('Route not found');

      const { data, error } = await supabase
        .from('trips')
        .insert([{
          route_id: routeId,
          vehicle_id: assignedVehicle?.id,
          driver_id: user?.id,
          date: new Date().toISOString().split('T')[0],
          start_time: new Date().toISOString(),
          start_mileage: assignedVehicle?.maintenance_info?.mileage || 0,
          start_location: 'School', // Would use GPS in production
          status: 'in_progress',
          school_id: user?.school_id,
          estimated_duration: route.estimated_duration,
          scheduled_start: new Date().toISOString()
        }])
        .select(`
          *,
          route:routes(*),
          vehicle:vehicles(*)
        `)
        .single();

      if (error) throw error;
      
      setCurrentTrip(data);
      
      // Create initial attendance records for the trip
      const attendanceRecords = students
        .filter(student => student.route_id === routeId)
        .map(student => ({
          student_id: student.id,
          route_id: routeId,
          vehicle_id: assignedVehicle?.id,
          driver_id: user?.id,
          date: new Date().toISOString().split('T')[0],
          trip_id: data.id,
          status: 'scheduled',
          school_id: user?.school_id
        }));

      if (attendanceRecords.length > 0) {
        await supabase
          .from('attendance')
          .insert(attendanceRecords);
      }

      toast.success(`Trip started on ${route.name}`);
    } catch (error) {
      console.error('Error starting trip:', error);
      toast.error('Failed to start trip');
    }
  };

  const pauseTrip = async () => {
    if (!currentTrip) return;

    try {
      const { error } = await supabase
        .from('trips')
        .update({
          status: 'paused',
          pause_time: new Date().toISOString()
        })
        .eq('id', currentTrip.id);

      if (error) throw error;
      
      setCurrentTrip(prev => ({ ...prev, status: 'paused' }));
      toast.success('Trip paused');
    } catch (error) {
      console.error('Error pausing trip:', error);
      toast.error('Failed to pause trip');
    }
  };

  const resumeTrip = async () => {
    if (!currentTrip) return;

    try {
      const { error } = await supabase
        .from('trips')
        .update({
          status: 'in_progress',
          resume_time: new Date().toISOString()
        })
        .eq('id', currentTrip.id);

      if (error) throw error;
      
      setCurrentTrip(prev => ({ ...prev, status: 'in_progress' }));
      toast.success('Trip resumed');
    } catch (error) {
      console.error('Error resuming trip:', error);
      toast.error('Failed to resume trip');
    }
  };

  const endTrip = async () => {
    if (!currentTrip) return;

    try {
      const endMileage = (assignedVehicle?.maintenance_info?.mileage || 0) + 
                        (currentTrip.route?.distance || 0);

      const { error } = await supabase
        .from('trips')
        .update({
          end_time: new Date().toISOString(),
          end_mileage: endMileage,
          end_location: 'School', // Would use GPS in production
          status: 'completed',
          actual_duration: Math.round((new Date() - new Date(currentTrip.start_time)) / (1000 * 60))
        })
        .eq('id', currentTrip.id);

      if (error) throw error;
      
      // Update vehicle mileage
      if (assignedVehicle) {
        await supabase
          .from('vehicles')
          .update({
            maintenance_info: {
              ...assignedVehicle.maintenance_info,
              mileage: endMileage
            }
          })
          .eq('id', assignedVehicle.id);
      }
      
      setCurrentTrip(null);
      toast.success('Trip completed successfully');
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error ending trip:', error);
      toast.error('Failed to end trip');
    }
  };

  const markAttendance = async (studentId, status, notes = '') => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const student = students.find(s => s.id === studentId);
      
      const { error } = await supabase
        .from('attendance')
        .upsert([{
          student_id: studentId,
          route_id: student?.route_id,
          vehicle_id: assignedVehicle?.id,
          driver_id: user?.id,
          date: today,
          pickup_time: new Date().toISOString(),
          status: status,
          notes: notes,
          school_id: user?.school_id,
          trip_id: currentTrip?.id
        }], {
          onConflict: 'student_id,date'
        });

      if (error) throw error;
      
      // Send notification to parent if marked absent
      if (status === 'absent' && student?.parent) {
        // In production, this would integrate with a notification service
        console.log(`Notifying parent of ${student.name} about absence`);
      }
      
      toast.success(`${student?.name} marked as ${status}`);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error('Failed to mark attendance');
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const StatCard = ({ title, value, icon: Icon, color = "blue", description, trend, glow = false, onClick }) => (
    <Card 
      className={`p-6 hover:shadow-lg transition-all duration-300 cursor-pointer border-2 ${
        glow ? `border-${color}-200 bg-${color}-50` : 'border-gray-200'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <div className={`flex items-center ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend > 0 ? <TrendingUp size={14} /> : <TrendingUp size={14} className="transform rotate-180" />}
                <span className="text-xs font-medium ml-1">{Math.abs(trend)}%</span>
              </div>
            </div>
          )}
        </div>
        <div className={`w-14 h-14 rounded-xl bg-${color}-100 flex items-center justify-center ml-4`}>
          <Icon className={`h-7 w-7 text-${color}-600`} />
        </div>
      </div>
    </Card>
  );

  const QuickActionCard = ({ title, description, icon: Icon, color = "blue", onClick, urgent = false }) => (
    <Card 
      className={`p-4 cursor-pointer hover:shadow-md transition-all duration-300 border-2 ${
        urgent ? 'border-red-200 bg-red-50' : 'border-gray-200'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        <div className={`w-12 h-12 rounded-lg bg-${color}-100 flex items-center justify-center flex-shrink-0`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{title}</h3>
          <p className="text-sm text-gray-600 truncate">{description}</p>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
      </div>
    </Card>
  );

  const RealTimeStatus = () => (
    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            realTimeData.gpsStatus === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500'
          }`}></div>
          <span className="text-sm font-medium text-gray-700">GPS: {realTimeData.gpsStatus}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Wifi className={`h-4 w-4 ${
            realTimeData.networkStrength > 3 ? 'text-green-500' : 
            realTimeData.networkStrength > 1 ? 'text-yellow-500' : 'text-red-500'
          }`} />
          <span className="text-sm text-gray-600">Network</span>
        </div>
        <div className="flex items-center space-x-2">
          <Battery className={`h-4 w-4 ${
            realTimeData.batteryLevel > 50 ? 'text-green-500' : 
            realTimeData.batteryLevel > 20 ? 'text-yellow-500' : 'text-red-500'
          }`} />
          <span className="text-sm text-gray-600">{realTimeData.batteryLevel}%</span>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs text-gray-500">Last update</p>
        <p className="text-sm font-medium text-gray-700">
          {realTimeData.lastUpdate.toLocaleTimeString()}
        </p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading your driver dashboard...</p>
          <p className="text-gray-500 text-sm mt-2">Preparing your routes and vehicle information</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
    <DashboardHeader title="Driver Dashboard" subtitle="Manage routes, trips, and student attendance" />
      {/* Enhanced Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Driver Dashboard</h1>
                  <p className="text-gray-600 mt-1">Welcome back, {user?.name}!
                    {assignedVehicle && (
                      <span className="ml-2 text-blue-600">
                        • Driving {assignedVehicle.make} {assignedVehicle.model}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-700">Live Updates</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {assignedVehicle && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 border border-blue-200">
                    <Bus className="h-3 w-3 mr-1" />
                    {assignedVehicle.plate_number}
                  </Badge>
                )}
                {currentTrip && (
                  <Badge variant="default" className="bg-green-100 text-green-800 border border-green-200">
                    <Play className="h-3 w-3 mr-1" />
                    Trip in Progress • {currentTrip.route?.name}
                  </Badge>
                )}
                <Button
                  onClick={fetchData}
                  variant="outline"
                  size="sm"
                  disabled={refreshing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Real-time Status Bar */}
        <RealTimeStatus />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-6">
          <StatCard 
            title="Assigned Students" 
            value={driverStats.totalStudents} 
            icon={Users} 
            color="blue"
            description="On your routes"
            glow
          />
          <StatCard 
            title="Present Today" 
            value={driverStats.presentToday} 
            icon={CheckCircle} 
            color="green"
            description={`${Math.round((driverStats.presentToday / driverStats.totalStudents) * 100)}% attendance`}
            trend={2.5}
          />
          <StatCard 
            title="Safety Score" 
            value={driverStats.safetyScore} 
            icon={Shield} 
            color="purple"
            description="Excellent driving"
            glow
          />
          <StatCard 
            title="Driver Rating" 
            value={driverStats.rating} 
            icon={Star} 
            color="yellow"
            description="Based on 47 reviews"
          />
        </div>

        {/* Current Trip Status */}
        {currentTrip && (
          <Card className="mb-8 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle className="flex items-center text-green-800">
                <Play className="h-5 w-5 mr-2" />
                Active Trip - {currentTrip.route?.name}
                <Badge className="ml-3 bg-green-100 text-green-800">
                  {Math.round((new Date() - new Date(currentTrip.start_time)) / (1000 * 60))} min elapsed
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Route</p>
                  <p className="text-lg font-semibold text-gray-900">{currentTrip.route?.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Started At</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(currentTrip.start_time).toLocaleTimeString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Vehicle</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {currentTrip.vehicle?.plate_number}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {currentTrip.status === 'paused' ? (
                    <Button
                      onClick={resumeTrip}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Resume Trip
                    </Button>
                  ) : (
                    <Button
                      onClick={pauseTrip}
                      variant="outline"
                      className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                    >
                      <Pause className="h-4 w-4 mr-2" />
                      Pause Trip
                    </Button>
                  )}
                  <Button
                    onClick={endTrip}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    End Trip
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center">
              <Gauge className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="routes" className="flex items-center">
              <Route className="h-4 w-4 mr-2" />
              My Routes
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Students
            </TabsTrigger>
            <TabsTrigger value="tracking" className="flex items-center">
              <Navigation className="h-4 w-4 mr-2" />
              Live Tracking
            </TabsTrigger>
            <TabsTrigger value="vehicle" className="flex items-center">
              <Bus className="h-4 w-4 mr-2" />
              Vehicle
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Quick Actions */}
              <div className="lg:col-span-1">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                    <Zap className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div className="space-y-4">
                    {quickActions.map((action) => (
                      <QuickActionCard
                        key={action.id}
                        title={action.title}
                        description={action.description}
                        icon={action.icon}
                        color={action.color}
                        onClick={() => window.location.href = action.path}
                      />
                    ))}
                  </div>
                </Card>

                {/* Driver Performance */}
                <Card className="p-6 mt-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h2>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>On-Time Performance</span>
                        <span>{driverStats.onTimeRate}%</span>
                      </div>
                      <Progress value={driverStats.onTimeRate} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Safety Score</span>
                        <span>{driverStats.safetyScore}%</span>
                      </div>
                      <Progress value={driverStats.safetyScore} className="h-2 bg-green-100" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Fuel Efficiency</span>
                        <span>{driverStats.fuelEfficiency} km/L</span>
                      </div>
                      <Progress value={80} className="h-2 bg-blue-100" />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Recent Activity & Alerts */}
              <div className="lg:col-span-2 space-y-6">
                {/* Alerts Panel */}
                {alerts.length > 0 && (
                  <Card className="p-6 border-red-200 bg-red-50">
                    <CardHeader>
                      <CardTitle className="flex items-center text-red-800">
                        <AlertTriangle className="h-5 w-5 mr-2" />
                        Important Alerts
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {alerts.map((alert) => (
                          <div key={alert.id} className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-red-200">
                            <AlertTriangle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                              alert.priority === 'high' ? 'text-red-600' : 'text-yellow-600'
                            }`} />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{alert.title}</p>
                              <p className="text-sm text-gray-700">{alert.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Today's Schedule */}
                <Card className="p-6">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      Today's Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {assignedRoutes.map((route) => (
                        <div key={route.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <Route className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{route.name}</p>
                              <p className="text-sm text-gray-600">
                                {route.students?.length || 0} students • {route.estimated_duration} min
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {!currentTrip && (
                              <Button
                                onClick={() => startTrip(route.id)}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Play className="h-4 w-4 mr-2" />
                                Start Trip
                              </Button>
                            )}
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              Details
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Trends */}
                <Card className="p-6">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Weekly Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <LineChartSimple 
                          data={[{value: 45}, {value: 52}, {value: 48}, {value: 55}, {value: 58}]}
                          color="#10b981"
                          height={60}
                        />
                        <p className="text-sm font-medium text-gray-900 mt-2">Trips</p>
                        <p className="text-xs text-gray-600">This week</p>
                      </div>
                      <div className="text-center">
                        <LineChartSimple 
                          data={[{value: 88}, {value: 92}, {value: 95}, {value: 90}, {value: 98}]}
                          color="#3b82f6"
                          height={60}
                        />
                        <p className="text-sm font-medium text-gray-900 mt-2">On Time</p>
                        <p className="text-xs text-gray-600">Performance</p>
                      </div>
                      <div className="text-center">
                        <LineChartSimple 
                          data={[{value: 12}, {value: 15}, {value: 18}, {value: 22}, {value: 25}]}
                          color="#f59e0b"
                          height={60}
                        />
                        <p className="text-sm font-medium text-gray-900 mt-2">Hours</p>
                        <p className="text-xs text-gray-600">Driven</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Routes Tab - Enhanced with more details */}
          <TabsContent value="routes" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {assignedRoutes.map((route) => (
                <Card key={route.id} className="hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center">
                        <MapPin className="h-5 w-5 mr-2" />
                        {route.name}
                      </span>
                      <div className="flex items-center space-x-2">
                        {!currentTrip && (
                          <Button
                            onClick={() => startTrip(route.id)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Start Trip
                          </Button>
                        )}
                        <Badge variant="outline">
                          {route.stops?.length || 0} stops
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Distance</span>
                          <span className="font-medium">{route.distance} km</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Duration</span>
                          <span className="font-medium">{route.estimated_duration} min</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Students</span>
                          <span className="font-medium">{route.students?.length || 0}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Vehicle</span>
                          <span className="font-medium text-xs">
                            {route.vehicle?.make} {route.vehicle?.model}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Capacity</span>
                          <span className="font-medium">{route.vehicle?.capacity} seats</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Status</span>
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            Active
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    {/* Route Stops */}
                    {route.stops && route.stops.length > 0 && (
                      <div className="pt-4 border-t">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-medium text-gray-900">Route Stops</p>
                          <Badge variant="secondary">{route.stops.length} stops</Badge>
                        </div>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {route.stops.slice(0, 5).map((stop, index) => (
                            <div key={stop.id} className="flex items-center space-x-3 text-sm">
                              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">{stop.name}</p>
                                <p className="text-gray-600 text-xs truncate">{stop.address}</p>
                              </div>
                              <span className="text-xs text-gray-500 flex-shrink-0">
                                {stop.estimated_time}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="pt-4 border-t">
                      <p className="text-sm text-gray-600 mb-2">Description</p>
                      <p className="text-sm text-gray-900">{route.description || 'Standard school transportation route'}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Students Tab - Enhanced with emergency info */}
          <TabsContent value="students" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Assigned Students ({students.length})</span>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export List
                    </Button>
                    <Button variant="outline" size="sm">
                      <QrCode className="h-4 w-4 mr-2" />
                      QR Codes
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade/Class</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Info</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pickup Point</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {students.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50 group">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                {student.photo_url ? (
                                  <img className="h-10 w-10 rounded-full" src={student.photo_url} alt={student.name} />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span className="text-sm font-medium text-blue-600">
                                      {student.name.split(' ').map(n => n[0]).join('')}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                <div className="text-sm text-gray-500">ID: {student.student_id}</div>
                                {student.medical_info?.allergies && (
                                  <Badge variant="outline" className="bg-red-50 text-red-700 text-xs mt-1">
                                    Allergies
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{student.grade}</div>
                            <div className="text-sm text-gray-500">Class {student.class}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{student.parent?.name || 'N/A'}</div>
                            <div className="text-sm text-gray-500">{student.parent?.phone || ''}</div>
                            <div className="text-sm text-blue-600">{student.parent?.email || ''}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {student.transport_info?.pickupPoint || 'Main Gate'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {student.transport_info?.pickupTime || 'Default Time'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAttendance(student.id, 'present')}
                                className="text-green-600 hover:text-green-900 hover:bg-green-50"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAttendance(student.id, 'absent')}
                                className="text-red-600 hover:text-red-900 hover:bg-red-50"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAttendance(student.id, 'late')}
                                className="text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50"
                              >
                                <Clock className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-900 hover:bg-blue-50"
                              >
                                <Phone className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Live Tracking Tab */}
          <TabsContent value="tracking" className="space-y-6">
            {assignedVehicle && assignedRoutes.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <LiveTracking 
                    vehicleId={assignedVehicle.id} 
                    routeId={assignedRoutes[0].id}
                    driverId={user?.id}
                  />
                </div>
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Satellite className="h-5 w-5 mr-2" />
                        Tracking Info
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">GPS Status</span>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Connected
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Last Update</span>
                        <span className="text-sm font-medium">{new Date().toLocaleTimeString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Signal Strength</span>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-3 rounded-sm ${
                                i < realTimeData.networkStrength 
                                  ? 'bg-green-500' 
                                  : 'bg-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Compass className="h-5 w-5 mr-2" />
                        Navigation
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Button className="w-full justify-start" variant="outline">
                          <Navigation className="h-4 w-4 mr-2" />
                          Start Navigation
                        </Button>
                        <Button className="w-full justify-start" variant="outline">
                          <MapPin className="h-4 w-4 mr-2" />
                          View Stops
                        </Button>
                        <Button className="w-full justify-start" variant="outline">
                          <Radio className="h-4 w-4 mr-2" />
                          Report Location
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Navigation className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Vehicle or Route Assigned</h3>
                  <p className="text-gray-500 mb-6">Contact the school administration to get a vehicle and route assigned for live tracking.</p>
                  <Button onClick={() => window.location.href = '/driver/support'}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Vehicle Tab - Enhanced with maintenance history */}
          <TabsContent value="vehicle" className="space-y-6">
            {assignedVehicle ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Bus className="h-5 w-5 mr-2" />
                        {assignedVehicle.plate_number} - {assignedVehicle.make} {assignedVehicle.model}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium text-gray-900">Vehicle Details</h3>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Make & Model</span>
                              <span className="text-sm font-medium">{assignedVehicle.make} {assignedVehicle.model}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Year</span>
                              <span className="text-sm font-medium">{assignedVehicle.year}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Capacity</span>
                              <span className="text-sm font-medium">{assignedVehicle.capacity} seats</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Color</span>
                              <span className="text-sm font-medium">{assignedVehicle.color}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Status</span>
                              <Badge variant={assignedVehicle.status === 'active' ? 'default' : 'secondary'}>
                                {assignedVehicle.status.replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium text-gray-900">Maintenance Info</h3>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Last Service</span>
                              <span className="text-sm font-medium">
                                {assignedVehicle.maintenance_info?.lastService || 'N/A'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Next Service</span>
                              <span className="text-sm font-medium">
                                {assignedVehicle.maintenance_info?.nextService || 'N/A'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Current Mileage</span>
                              <span className="text-sm font-medium">
                                {assignedVehicle.maintenance_info?.mileage || 0} km
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Fuel Type</span>
                              <span className="text-sm font-medium">
                                {assignedVehicle.maintenance_info?.fuelType || 'Petrol'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Insurance</span>
                              <Badge variant="outline" className={
                                assignedVehicle.maintenance_info?.insuranceValid ? 
                                'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }>
                                {assignedVehicle.maintenance_info?.insuranceValid ? 'Valid' : 'Expired'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-6 border-t">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Vehicle Features</h3>
                        <div className="flex flex-wrap gap-2">
                          {assignedVehicle.features?.map((feature, index) => (
                            <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {feature}
                            </Badge>
                          )) || (
                            <p className="text-sm text-gray-500">No special features listed</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Wrench className="h-5 w-5 mr-2" />
                        Maintenance Alerts
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {alerts.filter(alert => alert.type === 'warning').length > 0 ? (
                        <div className="space-y-3">
                          {alerts.filter(alert => alert.type === 'warning').map(alert => (
                            <div key={alert.id} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-medium text-yellow-800">{alert.title}</p>
                                <p className="text-sm text-yellow-700">{alert.message}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                          <p className="text-green-700 font-medium">All good!</p>
                          <p className="text-green-600 text-sm">No maintenance alerts</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Fuel className="h-5 w-5 mr-2" />
                        Fuel & Efficiency
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{driverStats.fuelEfficiency}</div>
                        <p className="text-sm text-gray-600">km per liter</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>This Week</span>
                          <span>{driverStats.distanceCovered} km</span>
                        </div>
                        <Progress value={60} className="h-2" />
                      </div>
                      <Button className="w-full" variant="outline">
                        <FileText className="h-4 w-4 mr-2" />
                        Log Fuel Usage
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Bus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Vehicle Assigned</h3>
                  <p className="text-gray-500 mb-6">Contact the school administration to get a vehicle assigned.</p>
                  <Button onClick={() => window.location.href = '/driver/support'}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Request Vehicle
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* System Status Footer */}
        <div className="mt-12 pt-6 border-t border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <span className="text-gray-600 text-sm">System Status:</span>
              <div className="flex items-center space-x-2 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">All Systems Operational</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-gray-500 text-sm">
              <Clock className="h-4 w-4" />
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;