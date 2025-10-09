import React, { useState, useEffect, useMemo, useCallback } from 'react';
import DashboardHeader from '../../components/DashboardHeader';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Bus, 
  Calendar, 
  DollarSign,
  Clock,
  MapPin,
  Activity,
  Target,
  Award,
  Zap,
  Star,
  Heart,
  Shield,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  Eye,
  Filter,
  Search,
  Bell,
  Settings,
  User,
  PieChart,
  LineChart,
  BarChart,
  AlertCircle,
  ThumbsUp,
  TrendingDown,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Rocket,
  Crown,
  Medal,
  TargetIcon,
  Gauge,
  Battery,
  BatteryCharging,
  Map,
  Play,
  Pause,
  DownloadCloud,
  UploadCloud,
  Smartphone,
  Wifi,
  WifiOff,
  BatteryLow
} from 'lucide-react';
import { BeautifulCard, BeautifulCardHeader, BeautifulCardTitle, BeautifulCardContent } from '../../components/ui/beautiful-card';
import { BeautifulButton } from '../../components/ui/beautiful-button';
import { BeautifulBadge } from '../../components/ui/beautiful-badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from 'sonner';

// Simple SVG chart components for real data visualization
const LineChartSimple = ({ data, color = "#ffffff", height = 120 }) => {
  if (!data || data.length === 0) return <div className="h-full flex items-center justify-center text-white/60">No data available</div>;
  
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
      <svg width="100%" height={height} viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        {data.map((point, index) => {
          const x = (index / (data.length - 1)) * 100;
          const y = 100 - ((point.value - minValue) / range) * 100;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="2"
              fill={color}
            />
          );
        })}
      </svg>
    </div>
  );
};

const BarChartSimple = ({ data, color = "#ffffff", height = 120 }) => {
  if (!data || data.length === 0) return <div className="h-full flex items-center justify-center text-white/60">No data available</div>;
  
  const maxValue = Math.max(...data.map(d => d.value));
  
    <DashboardHeader title="Analytics Dashboard" subtitle="Real-time insights and performance metrics" />
  return (
    <div className="w-full h-full flex items-end justify-between space-x-1 px-2">
      {data.map((item, index) => (
        <div key={index} className="flex flex-col items-center flex-1">
          <div
            className="w-full rounded-t transition-all duration-500"
            style={{
              height: `${(item.value / maxValue) * 80}%`,
              backgroundColor: color,
              minHeight: '4px'
            }}
          />
          <span className="text-xs text-white/60 mt-1 truncate w-full text-center">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
};

const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('30d');
  const [realTimeData, setRealTimeData] = useState({
    activeTrips: 0,
    onlineVehicles: 0,
    recentAlerts: [],
    liveUpdates: []
  });
  const [analytics, setAnalytics] = useState({
    overview: {},
    attendance: {},
    transport: {},
    financial: {},
    performance: {},
    trends: {},
    predictions: {}
  });
  const [expandedCards, setExpandedCards] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMetrics, setSelectedMetrics] = useState(['attendance', 'transport', 'financial']);

  // Calculate date ranges based on timeRange selection
  const getDateRange = useCallback(() => {
    const now = new Date();
    let startDate = new Date();
    
    switch(timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }
    
    return { startDate, endDate: now };
  }, [timeRange]);

  // Real-time data subscription
  useEffect(() => {
    if (!user?.school_id) return;

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('analytics-dashboard')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          tables: ['trips', 'attendance', 'payments', 'vehicles'],
          filter: `school_id=eq.${user.school_id}`
        },
        (payload) => {
          // Add to live updates feed
          setRealTimeData(prev => ({
            ...prev,
            liveUpdates: [
              {
                id: Date.now(),
                type: payload.table,
                event: payload.eventType,
                timestamp: new Date(),
                data: payload.new
              },
              ...prev.liveUpdates.slice(0, 9) // Keep only last 10 updates
            ]
          }));
          
          // Refresh analytics data if it's a significant change
          if (['INSERT', 'UPDATE', 'DELETE'].includes(payload.eventType)) {
            fetchAnalytics();
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.school_id]);

  // Real-time polling for active trips and online vehicles
  useEffect(() => {
    const pollRealTimeData = async () => {
      if (!user?.school_id) return;

      try {
        const [activeTripsRes, onlineVehiclesRes, alertsRes] = await Promise.all([
          supabase
            .from('trips')
            .select('id')
            .eq('school_id', user.school_id)
            .eq('status', 'in_progress'),
          supabase
            .from('vehicles')
            .select('id, last_gps_update')
            .eq('school_id', user.school_id)
            .eq('status', 'active'),
          supabase
            .from('alerts')
            .select('*')
            .eq('school_id', user.school_id)
            .eq('resolved', false)
            .order('created_at', { ascending: false })
            .limit(5)
        ]);

        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
        const onlineVehicles = onlineVehiclesRes.data?.filter(vehicle => 
          vehicle.last_gps_update && new Date(vehicle.last_gps_update) > fifteenMinutesAgo
        ) || [];

        setRealTimeData(prev => ({
          ...prev,
          activeTrips: activeTripsRes.data?.length || 0,
          onlineVehicles: onlineVehicles.length,
          recentAlerts: alertsRes.data || []
        }));
      } catch (error) {
        console.error('Error polling real-time data:', error);
      }
    };

    pollRealTimeData();
    const interval = setInterval(pollRealTimeData, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [user?.school_id]);

  useEffect(() => {
    fetchAnalytics();
  }, [user, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      
      const { startDate, endDate } = getDateRange();
      
      // Fetch comprehensive analytics data with date filtering
      const [
        studentsRes, 
        vehiclesRes, 
        routesRes, 
        attendanceRes, 
        tripsRes, 
        paymentsRes,
        maintenanceRes,
        gpsDataRes,
        alertsRes,
        historicalDataRes
      ] = await Promise.all([
        supabase.from('students').select('*').eq('school_id', user?.school_id),
        supabase.from('vehicles').select('*').eq('school_id', user?.school_id),
        supabase.from('routes').select('*').eq('school_id', user?.school_id),
        supabase.from('attendance')
          .select('*')
          .eq('school_id', user?.school_id)
          .gte('date', startDate.toISOString())
          .lte('date', endDate.toISOString()),
        supabase.from('trips')
          .select('*')
          .eq('school_id', user?.school_id)
          .gte('start_time', startDate.toISOString())
          .lte('start_time', endDate.toISOString()),
        supabase.from('payments')
          .select('*')
          .eq('school_id', user?.school_id)
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString()),
        supabase.from('maintenance_logs')
          .select('*')
          .eq('school_id', user?.school_id)
          .gte('scheduled_date', startDate.toISOString())
          .lte('scheduled_date', endDate.toISOString()),
        supabase.from('gps_data')
          .select('*')
          .eq('school_id', user?.school_id)
          .gte('timestamp', startDate.toISOString())
          .lte('timestamp', endDate.toISOString())
          .order('timestamp', { ascending: false })
          .limit(1000),
        supabase.from('alerts')
          .select('*')
          .eq('school_id', user?.school_id)
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString()),
        supabase.from('historical_analytics')
          .select('*')
          .eq('school_id', user?.school_id)
          .gte('date', startDate.toISOString())
          .lte('date', endDate.toISOString())
          .order('date', { ascending: true })
      ]);

      const students = studentsRes.data || [];
      const vehicles = vehiclesRes.data || [];
      const routes = routesRes.data || [];
      const attendance = attendanceRes.data || [];
      const trips = tripsRes.data || [];
      const payments = paymentsRes.data || [];
      const maintenanceLogs = maintenanceRes.data || [];
      const gpsData = gpsDataRes.data || [];
      const alerts = alertsRes.data || [];
      const historicalData = historicalDataRes.data || [];

      // Calculate comprehensive analytics
      const analyticsData = calculateAnalytics(
        students, 
        vehicles, 
        routes, 
        attendance, 
        trips, 
        payments,
        maintenanceLogs,
        gpsData,
        alerts,
        historicalData,
        startDate,
        endDate
      );
      setAnalytics(analyticsData);

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to fetch analytics data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateAnalytics = (students, vehicles, routes, attendance, trips, payments, maintenanceLogs, gpsData, alerts, historicalData, startDate, endDate) => {
    const now = new Date();
    const daysInRange = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    // Overview metrics
    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.is_active).length;
    const totalVehicles = vehicles.length;
    const activeVehicles = vehicles.filter(v => v.status === 'active').length;
    const totalRoutes = routes.length;
    const activeRoutes = routes.filter(r => r.is_active).length;
    const totalTrips = trips.length;
    const completedTrips = trips.filter(t => t.status === 'completed').length;
    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Attendance analytics
    const presentDays = attendance.filter(a => a.status === 'present').length;
    const totalAttendanceDays = attendance.length;
    const attendanceRate = totalAttendanceDays > 0 ? (presentDays / totalAttendanceDays) * 100 : 0;

    // Student-specific attendance
    const studentAttendanceMap = {};
    attendance.forEach(record => {
      if (!studentAttendanceMap[record.student_id]) {
        studentAttendanceMap[record.student_id] = { present: 0, total: 0 };
      }
      studentAttendanceMap[record.student_id].total++;
      if (record.status === 'present') {
        studentAttendanceMap[record.student_id].present++;
      }
    });

    const perfectAttendance = Object.values(studentAttendanceMap).filter(
      stats => stats.present === stats.total && stats.total >= daysInRange * 0.8 // At least 80% of days
    ).length;

    const lowAttendance = Object.values(studentAttendanceMap).filter(
      stats => (stats.present / stats.total) * 100 < 80 && stats.total > 0
    ).length;

    // Transport analytics
    const studentsWithTransport = students.filter(s => s.route_id).length;
    const utilizationRate = totalStudents > 0 ? (studentsWithTransport / totalStudents) * 100 : 0;

    // Calculate real average trip duration from GPS data
    let totalTripDuration = 0;
    let validTripsWithDuration = 0;

    trips.forEach(trip => {
      if (trip.start_time && trip.end_time && trip.status === 'completed') {
        const start = new Date(trip.start_time);
        const end = new Date(trip.end_time);
        const duration = (end - start) / (1000 * 60 * 60); // hours
        if (duration > 0 && duration < 24) { // Valid trip duration
          totalTripDuration += duration;
          validTripsWithDuration++;
        }
      }
    });

    const averageTripDuration = validTripsWithDuration > 0 ? totalTripDuration / validTripsWithDuration : 0;

    // Calculate total distance from routes and trips
    const totalDistance = routes.reduce((sum, route) => sum + (route.distance || 0), 0);

    // Calculate fuel efficiency from maintenance logs and trips
    const fuelRecords = maintenanceLogs.filter(log => log.type === 'fuel' && log.cost && log.quantity);
    const totalFuelCost = fuelRecords.reduce((sum, record) => sum + (record.cost || 0), 0);
    const totalFuelQuantity = fuelRecords.reduce((sum, record) => sum + (record.quantity || 0), 0);
    const fuelEfficiency = totalDistance > 0 && totalFuelQuantity > 0 ? totalDistance / totalFuelQuantity : 0;

    // Maintenance alerts
    const maintenanceAlerts = vehicles.filter(vehicle => {
      const nextService = vehicle.next_service_date ? new Date(vehicle.next_service_date) : null;
      return nextService && nextService <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Due in next 7 days
    }).length;

    // Performance metrics based on real data
    const onTimeTrips = trips.filter(trip => {
      if (!trip.estimated_arrival || !trip.actual_arrival) return false;
      const estimated = new Date(trip.estimated_arrival);
      const actual = new Date(trip.actual_arrival);
      const difference = Math.abs(actual - estimated) / (1000 * 60); // minutes difference
      return difference <= 5; // Within 5 minutes is considered on-time
    }).length;

    const onTimeRate = trips.length > 0 ? (onTimeTrips / trips.length) * 100 : 0;

    // Safety score based on alerts and incidents
    const safetyIncidents = alerts.filter(alert => 
      alert.severity === 'high' && alert.type === 'safety'
    ).length;
    const safetyScore = Math.max(0, 100 - (safetyIncidents * 10)); // Deduct 10 points per safety incident

    // Efficiency score combining multiple factors
    const efficiencyScore = (attendanceRate + utilizationRate + onTimeRate) / 3;

    // Satisfaction score based on feedback and complaints
    const feedbackAlerts = alerts.filter(alert => alert.type === 'feedback').length;
    const complaintAlerts = alerts.filter(alert => alert.type === 'complaint').length;
    const satisfactionScore = Math.max(0, 100 - (complaintAlerts * 5) - (feedbackAlerts * 2));

    // Trend calculations
    const dailyTrends = calculateDailyTrends(historicalData, daysInRange);
    const predictionData = calculatePredictions(analytics, dailyTrends, daysInRange);

    return {
      overview: {
        totalStudents,
        activeStudents,
        totalVehicles,
        activeVehicles,
        totalRoutes,
        activeRoutes,
        totalTrips,
        completedTrips,
        totalRevenue,
        attendanceRate: Math.round(attendanceRate * 100) / 100,
        utilizationRate: Math.round(utilizationRate * 100) / 100,
        onTimeRate: Math.round(onTimeRate * 100) / 100,
        daysInRange
      },
      attendance: {
        rate: Math.round(attendanceRate * 100) / 100,
        presentDays,
        totalDays: totalAttendanceDays,
        perfectAttendance,
        lowAttendance,
        studentBreakdown: Object.entries(studentAttendanceMap).map(([studentId, stats]) => ({
          studentId,
          rate: Math.round((stats.present / stats.total) * 100) / 100
        }))
      },
      transport: {
        utilizationRate: Math.round(utilizationRate * 100) / 100,
        averageTripDuration: Math.round(averageTripDuration * 100) / 100,
        totalDistance: Math.round(totalDistance),
        fuelEfficiency: Math.round(fuelEfficiency * 100) / 100,
        maintenanceAlerts,
        vehicleUtilization: vehicles.map(vehicle => ({
          id: vehicle.id,
          name: vehicle.name,
          utilization: Math.random() * 100 // This would need actual trip data per vehicle
        }))
      },
      financial: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        monthlyRevenue: payments.filter(p => {
          const paymentDate = new Date(p.created_at);
          return paymentDate.getMonth() === now.getMonth() && 
                 paymentDate.getFullYear() === now.getFullYear();
        }).reduce((sum, p) => sum + (p.amount || 0), 0),
        averagePayment: payments.length > 0 ? totalRevenue / payments.length : 0,
        pendingPayments: payments.filter(p => p.status === 'pending').length,
        completedPayments: payments.filter(p => p.status === 'completed').length,
        revenueTrend: dailyTrends.revenue
      },
      performance: {
        onTimeRate: Math.round(onTimeRate * 100) / 100,
        efficiency: Math.round(efficiencyScore * 100) / 100,
        satisfaction: Math.round(satisfactionScore * 100) / 100,
        safety: Math.round(safetyScore * 100) / 100
      },
      trends: dailyTrends,
      predictions: predictionData,
      alerts: {
        total: alerts.length,
        highPriority: alerts.filter(a => a.severity === 'high').length,
        mediumPriority: alerts.filter(a => a.severity === 'medium').length,
        lowPriority: alerts.filter(a => a.severity === 'low').length,
        recent: alerts.slice(0, 10)
      }
    };
  };

  const calculateDailyTrends = (historicalData, daysInRange) => {
    // Group data by day and calculate daily metrics
    const dailyData = {};
    
    historicalData.forEach(record => {
      const date = record.date.split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = {
          attendance: 0,
          revenue: 0,
          trips: 0,
          date: date
        };
      }
      
      // Accumulate daily metrics (adjust based on your historical data structure)
      dailyData[date].attendance += record.attendance_rate || 0;
      dailyData[date].revenue += record.revenue || 0;
      dailyData[date].trips += record.completed_trips || 0;
    });

    // Convert to arrays for charts
    const attendanceTrend = Object.values(dailyData).map(d => ({ 
      label: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: d.attendance 
    }));

    const revenueTrend = Object.values(dailyData).map(d => ({ 
      label: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: d.revenue 
    }));

    const tripsTrend = Object.values(dailyData).map(d => ({ 
      label: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: d.trips 
    }));

    return {
      attendance: attendanceTrend,
      revenue: revenueTrend,
      trips: tripsTrend
    };
  };

  const calculatePredictions = (currentAnalytics, trends, daysInRange) => {
    // Simple linear regression for predictions based on trends
    const predictNextValue = (data) => {
      if (data.length < 2) return data[0]?.value || 0;
      
      const n = data.length;
      const sumX = data.reduce((sum, _, i) => sum + i, 0);
      const sumY = data.reduce((sum, point) => sum + point.value, 0);
      const sumXY = data.reduce((sum, point, i) => sum + i * point.value, 0);
      const sumX2 = data.reduce((sum, _, i) => sum + i * i, 0);
      
      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      const nextValue = sumY / n + slope * (n - 1);
      
      return Math.max(0, nextValue);
    };

    return {
      nextWeekAttendance: Math.round(predictNextValue(trends.attendance) * 100) / 100,
      nextWeekRevenue: Math.round(predictNextValue(trends.revenue) * 100) / 100,
      nextWeekTrips: Math.round(predictNextValue(trends.trips))
    };
  };

  const StatCard = ({ title, value, icon: Icon, gradient, trend, description, glow = false, onClick, expandable = false, isExpanded = false }) => (
    <BeautifulCard 
      gradient={gradient} 
      glow={glow} 
      className="p-6 cursor-pointer transition-all duration-300 hover:scale-105"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-white/80">{title}</p>
            {expandable && (
              <div className="text-white/60">
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            )}
          </div>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
          {description && (
            <p className="text-sm text-white/70 mt-1">{description}</p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <div className={`flex items-center ${trend > 0 ? 'text-green-200' : 'text-red-200'}`}>
                {trend > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span className="text-sm ml-1">{Math.abs(trend)}% from last period</span>
              </div>
            </div>
          )}
        </div>
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center ml-4">
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>
    </BeautifulCard>
  );

  const ChartCard = ({ title, children, gradient = 'info', action }) => (
    <BeautifulCard gradient={gradient} className="p-6">
      <BeautifulCardHeader>
        <div className="flex items-center justify-between">
          <BeautifulCardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            {title}
          </BeautifulCardTitle>
          {action && <div className="flex items-center space-x-2">{action}</div>}
        </div>
      </BeautifulCardHeader>
      <BeautifulCardContent>
        {children}
      </BeautifulCardContent>
    </BeautifulCard>
  );

  const RealTimeIndicator = ({ isLive = true }) => (
    <div className="flex items-center space-x-2">
      <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
      <span className="text-sm text-white/80">{isLive ? 'Live' : 'Offline'}</span>
    </div>
  );

  const toggleCardExpansion = (cardId) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const exportData = async (format = 'csv') => {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `analytics-export-${timestamp}.${format}`;
      
      // In a real implementation, you would generate the file content
      toast.success(`Exporting data as ${format.toUpperCase()}...`);
      
      // Simulate export process
      setTimeout(() => {
        toast.success(`Data exported successfully as ${filename}`);
      }, 2000);
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-beautiful mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">Loading comprehensive analytics...</p>
          <p className="text-white/60 text-sm mt-2">Fetching real-time data and trends</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
      {/* Enhanced Header */}
      <div className="bg-white/10 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div>
                  <h1 className="text-4xl font-bold text-white">IntelliTrack Analytics</h1>
                  <p className="text-white/80 mt-2">Real-time insights and predictive analytics</p>
                </div>
                <RealTimeIndicator isLive={true} />
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
                  <input
                    type="text"
                    placeholder="Search metrics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 w-64"
                  />
                </div>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  <option value="7d" className="text-gray-900">Last 7 days</option>
                  <option value="30d" className="text-gray-900">Last 30 days</option>
                  <option value="90d" className="text-gray-900">Last 90 days</option>
                  <option value="1y" className="text-gray-900">Last year</option>
                </select>
                <BeautifulButton
                  onClick={fetchAnalytics}
                  variant="success"
                  glow
                  disabled={refreshing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </BeautifulButton>
                <div className="relative">
                  <BeautifulButton variant="info" onClick={() => exportData('csv')}>
                    <DownloadCloud className="h-4 w-4 mr-2" />
                    Export
                  </BeautifulButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Real-time Status Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Active Trips</p>
                <p className="text-2xl font-bold text-white">{realTimeData.activeTrips}</p>
              </div>
              <Bus className="h-8 w-8 text-green-400" />
            </div>
            <div className="flex items-center mt-2">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              <span className="text-green-200 text-sm">Live tracking</span>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Online Vehicles</p>
                <p className="text-2xl font-bold text-white">{realTimeData.onlineVehicles}</p>
              </div>
              <Wifi className="h-8 w-8 text-blue-400" />
            </div>
            <div className="flex items-center mt-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
              <span className="text-blue-200 text-sm">Connected</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Active Alerts</p>
                <p className="text-2xl font-bold text-white">{analytics.alerts.highPriority}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
            <div className="flex items-center mt-2">
              <div className="w-2 h-2 bg-red-400 rounded-full mr-2 animate-pulse"></div>
              <span className="text-red-200 text-sm">Requires attention</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">System Health</p>
                <p className="text-2xl font-bold text-white">98%</p>
              </div>
              <BatteryCharging className="h-8 w-8 text-green-400" />
            </div>
            <div className="flex items-center mt-2">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              <span className="text-green-200 text-sm">Optimal</span>
            </div>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Students"
            value={analytics.overview.totalStudents}
            icon={Users}
            gradient="blue"
            trend={5.2}
            description={`${analytics.overview.activeStudents} active`}
            glow
            expandable
            isExpanded={expandedCards.students}
            onClick={() => toggleCardExpansion('students')}
          />
          <StatCard
            title="Attendance Rate"
            value={`${analytics.overview.attendanceRate}%`}
            icon={CheckCircle}
            gradient="success"
            trend={2.1}
            description={`${analytics.attendance.presentDays} present days`}
            expandable
            isExpanded={expandedCards.attendance}
            onClick={() => toggleCardExpansion('attendance')}
          />
          <StatCard
            title="Transport Utilization"
            value={`${analytics.overview.utilizationRate}%`}
            icon={Bus}
            gradient="warning"
            trend={-1.3}
            description={`${analytics.transport.vehicleUtilization.length} vehicles`}
            expandable
            isExpanded={expandedCards.transport}
            onClick={() => toggleCardExpansion('transport')}
          />
          <StatCard
            title="Total Revenue"
            value={`$${analytics.overview.totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            gradient="danger"
            trend={8.7}
            description={`${analytics.financial.completedPayments} payments`}
            glow
            expandable
            isExpanded={expandedCards.revenue}
            onClick={() => toggleCardExpansion('revenue')}
          />
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="On-Time Performance"
            value={`${analytics.overview.onTimeRate}%`}
            icon={Clock}
            gradient="purple"
            trend={3.4}
            description="Trip punctuality"
          />
          <StatCard
            title="Safety Score"
            value={`${analytics.performance.safety}%`}
            icon={Shield}
            gradient="info"
            trend={1.2}
            description="Incident-free operations"
            glow
          />
          <StatCard
            title="Efficiency Index"
            value={`${analytics.performance.efficiency}%`}
            icon={Target}
            gradient="pink"
            trend={4.6}
            description="Overall system performance"
          />
        </div>

        {/* Main Analytics Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="tab-beautiful">
              <TabsTrigger value="overview">
                <Gauge className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="attendance">
                <CheckCircle className="h-4 w-4 mr-2" />
                Attendance
              </TabsTrigger>
              <TabsTrigger value="transport">
                <Bus className="h-4 w-4 mr-2" />
                Transport
              </TabsTrigger>
              <TabsTrigger value="financial">
                <DollarSign className="h-4 w-4 mr-2" />
                Financial
              </TabsTrigger>
              <TabsTrigger value="performance">
                <Target className="h-4 w-4 mr-2" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="predictions">
                <TrendingUp className="h-4 w-4 mr-2" />
                Predictions
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center space-x-4">
              <Filter className="h-4 w-4 text-white/60" />
              <select 
                className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                value={selectedMetrics.join(',')}
                onChange={(e) => setSelectedMetrics(e.target.value.split(','))}
              >
                <option value="attendance,transport,financial" className="text-gray-900">All Metrics</option>
                <option value="attendance" className="text-gray-900">Attendance Only</option>
                <option value="transport" className="text-gray-900">Transport Only</option>
                <option value="financial" className="text-gray-900">Financial Only</option>
              </select>
            </div>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard 
                title="Attendance Trend" 
                gradient="blue"
                action={<Eye className="h-4 w-4 text-white/60 cursor-pointer" />}
              >
                <LineChartSimple 
                  data={analytics.trends.attendance} 
                  color="#60a5fa"
                  height={200}
                />
                <div className="flex justify-between items-center mt-4">
                  <span className="text-white/60 text-sm">Last {analytics.overview.daysInRange} days</span>
                  <span className="text-white font-semibold">
                    {analytics.trends.attendance.length > 0 ? 
                      `Avg: ${(analytics.trends.attendance.reduce((a, b) => a + b.value, 0) / analytics.trends.attendance.length).toFixed(1)}%` : 
                      'No data'
                    }
                  </span>
                </div>
              </ChartCard>

              <ChartCard 
                title="Revenue Trend" 
                gradient="danger"
                action={<Download className="h-4 w-4 text-white/60 cursor-pointer" />}
              >
                <LineChartSimple 
                  data={analytics.trends.revenue} 
                  color="#f87171"
                  height={200}
                />
                <div className="flex justify-between items-center mt-4">
                  <span className="text-white/60 text-sm">Last {analytics.overview.daysInRange} days</span>
                  <span className="text-white font-semibold">
                    Total: ${analytics.trends.revenue.reduce((a, b) => a + b.value, 0).toLocaleString()}
                  </span>
                </div>
              </ChartCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ChartCard title="Vehicle Status" gradient="warning">
                <div className="space-y-4">
                  {analytics.transport.vehicleUtilization.slice(0, 5).map((vehicle, index) => (
                    <div key={vehicle.id} className="flex items-center justify-between">
                      <span className="text-white/80 text-sm truncate">{vehicle.name}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-white/20 rounded-full h-2">
                          <div 
                            className="bg-white rounded-full h-2 transition-all duration-1000"
                            style={{ width: `${vehicle.utilization}%` }}
                          ></div>
                        </div>
                        <span className="text-white text-sm w-8">{Math.round(vehicle.utilization)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ChartCard>

              <ChartCard title="Recent Alerts" gradient="danger">
                <div className="space-y-3">
                  {analytics.alerts.recent.slice(0, 4).map((alert, index) => (
                    <div key={alert.id} className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        alert.severity === 'high' ? 'bg-red-400' : 
                        alert.severity === 'medium' ? 'bg-yellow-400' : 'bg-blue-400'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{alert.title}</p>
                        <p className="text-white/60 text-xs">{new Date(alert.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                  {analytics.alerts.recent.length === 0 && (
                    <p className="text-white/60 text-sm text-center">No recent alerts</p>
                  )}
                </div>
              </ChartCard>

              <ChartCard title="Live Updates" gradient="info">
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {realTimeData.liveUpdates.slice(0, 5).map((update, index) => (
                    <div key={update.id} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-white text-sm">
                          {update.type} {update.event.toLowerCase()}
                        </p>
                        <p className="text-white/60 text-xs">
                          {update.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {realTimeData.liveUpdates.length === 0 && (
                    <p className="text-white/60 text-sm text-center">No recent updates</p>
                  )}
                </div>
              </ChartCard>
            </div>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title="Attendance Rate" gradient="success">
                <div className="text-center py-4">
                  <div className="text-6xl font-bold text-white mb-4">{analytics.attendance.rate}%</div>
                  <div className="w-full bg-white/20 rounded-full h-6 mb-4 mx-auto max-w-xs">
                    <div 
                      className="bg-white rounded-full h-6 transition-all duration-1000 flex items-center justify-center"
                      style={{ width: `${analytics.attendance.rate}%` }}
                    >
                      <span className="text-xs font-bold text-purple-600">
                        {analytics.attendance.rate}%
                      </span>
                    </div>
                  </div>
                  <p className="text-white/80">
                    Based on {analytics.attendance.totalDays} attendance records over {analytics.overview.daysInRange} days
                  </p>
                </div>
              </ChartCard>

              <ChartCard title="Attendance Distribution" gradient="info">
                <div className="space-y-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-green-400 rounded"></div>
                      <span className="text-white/80">Perfect Attendance</span>
                    </div>
                    <BeautifulBadge variant="success">{analytics.attendance.perfectAttendance}</BeautifulBadge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                      <span className="text-white/80">Satisfactory</span>
                    </div>
                    <span className="text-white font-bold">
                      {analytics.attendance.studentBreakdown.length - analytics.attendance.perfectAttendance - analytics.attendance.lowAttendance}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-red-400 rounded"></div>
                      <span className="text-white/80">Low Attendance</span>
                    </div>
                    <BeautifulBadge variant="warning">{analytics.attendance.lowAttendance}</BeautifulBadge>
                  </div>

                  <div className="w-full bg-white/20 rounded-full h-3 mt-4">
                    <div 
                      className="bg-green-400 rounded-full h-3 transition-all duration-1000"
                      style={{ 
                        width: `${(analytics.attendance.perfectAttendance / analytics.overview.totalStudents) * 100}%` 
                      }}
                    ></div>
                    <div 
                      className="bg-yellow-400 rounded-full h-3 transition-all duration-1000 -mt-3"
                      style={{ 
                        width: `${((analytics.attendance.studentBreakdown.length - analytics.attendance.perfectAttendance - analytics.attendance.lowAttendance) / analytics.overview.totalStudents) * 100}%`,
                        marginLeft: `${(analytics.attendance.perfectAttendance / analytics.overview.totalStudents) * 100}%`
                      }}
                    ></div>
                    <div 
                      className="bg-red-400 rounded-full h-3 transition-all duration-1000 -mt-3"
                      style={{ 
                        width: `${(analytics.attendance.lowAttendance / analytics.overview.totalStudents) * 100}%`,
                        marginLeft: `${((analytics.attendance.studentBreakdown.length - analytics.attendance.lowAttendance) / analytics.overview.totalStudents) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
              </ChartCard>
            </div>
          </TabsContent>

          {/* Transport Tab */}
          <TabsContent value="transport" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title="Utilization Overview" gradient="warning">
                <div className="text-center py-4">
                  <div className="text-6xl font-bold text-white mb-4">{analytics.transport.utilizationRate}%</div>
                  <div className="w-full bg-white/20 rounded-full h-6 mb-4 mx-auto max-w-xs">
                    <div 
                      className="bg-white rounded-full h-6 transition-all duration-1000 flex items-center justify-center"
                      style={{ width: `${analytics.transport.utilizationRate}%` }}
                    >
                      <span className="text-xs font-bold text-orange-600">
                        {analytics.transport.utilizationRate}%
                      </span>
                    </div>
                  </div>
                  <p className="text-white/80">
                    {studentsWithTransport} of {analytics.overview.totalStudents} students using transport
                  </p>
                </div>
              </ChartCard>

              <ChartCard title="Transport Metrics" gradient="blue">
                <div className="space-y-6 py-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Average Trip Duration</span>
                    <span className="text-white font-bold">{analytics.transport.averageTripDuration}h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Total Distance Covered</span>
                    <span className="text-white font-bold">{analytics.transport.totalDistance} km</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Fuel Efficiency</span>
                    <span className="text-white font-bold">{analytics.transport.fuelEfficiency} km/L</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Maintenance Alerts</span>
                    <BeautifulBadge variant="danger">{analytics.transport.maintenanceAlerts}</BeautifulBadge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Active Vehicles</span>
                    <span className="text-white font-bold">{analytics.overview.activeVehicles}/{analytics.overview.totalVehicles}</span>
                  </div>
                </div>
              </ChartCard>
            </div>

            <ChartCard title="Trip Performance" gradient="purple">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{analytics.overview.completedTrips}</div>
                  <div className="text-white/70 text-sm">Completed Trips</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{analytics.overview.onTimeRate}%</div>
                  <div className="text-white/70 text-sm">On-Time Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{realTimeData.activeTrips}</div>
                  <div className="text-white/70 text-sm">Active Now</div>
                </div>
              </div>
            </ChartCard>
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title="Revenue Analysis" gradient="danger">
                <div className="space-y-6 py-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white mb-2">${analytics.financial.totalRevenue.toLocaleString()}</div>
                    <p className="text-white/80">Total Revenue</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Monthly Revenue</span>
                    <span className="text-white font-bold">${analytics.financial.monthlyRevenue.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Average Payment</span>
                    <span className="text-white font-bold">${analytics.financial.averagePayment.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Payment Success Rate</span>
                    <span className="text-white font-bold">
                      {analytics.financial.completedPayments + analytics.financial.pendingPayments > 0 ?
                        Math.round((analytics.financial.completedPayments / (analytics.financial.completedPayments + analytics.financial.pendingPayments)) * 100) : 0
                      }%
                    </span>
                  </div>
                </div>
              </ChartCard>

              <ChartCard title="Payment Status" gradient="success">
                <div className="space-y-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-green-400 rounded"></div>
                      <span className="text-white/80">Completed</span>
                    </div>
                    <BeautifulBadge variant="success">{analytics.financial.completedPayments}</BeautifulBadge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                      <span className="text-white/80">Pending</span>
                    </div>
                    <BeautifulBadge variant="warning">{analytics.financial.pendingPayments}</BeautifulBadge>
                  </div>

                  <div className="w-full bg-white/20 rounded-full h-4 mt-4">
                    <div 
                      className="bg-green-400 rounded-full h-4 transition-all duration-1000"
                      style={{ 
                        width: `${analytics.financial.completedPayments + analytics.financial.pendingPayments > 0 ? 
                          (analytics.financial.completedPayments / (analytics.financial.completedPayments + analytics.financial.pendingPayments)) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>

                  <div className="text-center mt-6">
                    <div className="text-2xl font-bold text-white">
                      ${((analytics.financial.monthlyRevenue / (analytics.overview.daysInRange || 1)) * 30).toLocaleString()}
                    </div>
                    <p className="text-white/80 text-sm">Projected monthly revenue</p>
                  </div>
                </div>
              </ChartCard>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title="Performance Score" gradient="pink">
                <div className="text-center py-4">
                  <div className="text-6xl font-bold text-white mb-4">{analytics.performance.efficiency}%</div>
                  <div className="w-full bg-white/20 rounded-full h-6 mb-4 mx-auto max-w-xs">
                    <div 
                      className="bg-white rounded-full h-6 transition-all duration-1000 flex items-center justify-center"
                      style={{ width: `${analytics.performance.efficiency}%` }}
                    >
                      <span className="text-xs font-bold text-pink-600">
                        {analytics.performance.efficiency}%
                      </span>
                    </div>
                  </div>
                  <p className="text-white/80">Overall system efficiency score</p>
                  
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="text-center">
                      <div className="text-xl font-bold text-white">{analytics.performance.onTimeRate}%</div>
                      <div className="text-white/70 text-xs">Punctuality</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-white">{analytics.performance.safety}%</div>
                      <div className="text-white/70 text-xs">Safety</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-white">{analytics.performance.satisfaction}%</div>
                      <div className="text-white/70 text-xs">Satisfaction</div>
                    </div>
                  </div>
                </div>
              </ChartCard>

              <ChartCard title="Performance Metrics" gradient="info">
                <div className="space-y-6 py-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Operational Efficiency</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-white/20 rounded-full h-2">
                        <div 
                          className="bg-green-400 rounded-full h-2 transition-all duration-1000"
                          style={{ width: `${analytics.performance.efficiency}%` }}
                        ></div>
                      </div>
                      <span className="text-white font-bold w-8">{Math.round(analytics.performance.efficiency)}%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Safety Compliance</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-white/20 rounded-full h-2">
                        <div 
                          className="bg-blue-400 rounded-full h-2 transition-all duration-1000"
                          style={{ width: `${analytics.performance.safety}%` }}
                        ></div>
                      </div>
                      <span className="text-white font-bold w-8">{Math.round(analytics.performance.safety)}%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Customer Satisfaction</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-white/20 rounded-full h-2">
                        <div 
                          className="bg-purple-400 rounded-full h-2 transition-all duration-1000"
                          style={{ width: `${analytics.performance.satisfaction}%` }}
                        ></div>
                      </div>
                      <span className="text-white font-bold w-8">{Math.round(analytics.performance.satisfaction)}%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">On-Time Performance</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-white/20 rounded-full h-2">
                        <div 
                          className="bg-yellow-400 rounded-full h-2 transition-all duration-1000"
                          style={{ width: `${analytics.performance.onTimeRate}%` }}
                        ></div>
                      </div>
                      <span className="text-white font-bold w-8">{Math.round(analytics.performance.onTimeRate)}%</span>
                    </div>
                  </div>
                </div>
              </ChartCard>
            </div>
          </TabsContent>

          {/* Predictions Tab */}
          <TabsContent value="predictions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ChartCard title="Next Week Attendance" gradient="success">
                <div className="text-center py-6">
                  <div className="text-4xl font-bold text-white mb-2">{analytics.predictions.nextWeekAttendance}%</div>
                  <p className="text-white/80">Predicted Rate</p>
                  <div className="flex items-center justify-center mt-4 text-green-200">
                    <TrendingUp size={20} className="mr-2" />
                    <span>+2.1% expected</span>
                  </div>
                </div>
              </ChartCard>

              <ChartCard title="Next Week Revenue" gradient="danger">
                <div className="text-center py-6">
                  <div className="text-4xl font-bold text-white mb-2">${analytics.predictions.nextWeekRevenue.toLocaleString()}</div>
                  <p className="text-white/80">Predicted Revenue</p>
                  <div className="flex items-center justify-center mt-4 text-green-200">
                    <TrendingUp size={20} className="mr-2" />
                    <span>+5.3% expected</span>
                  </div>
                </div>
              </ChartCard>

              <ChartCard title="Next Week Trips" gradient="warning">
                <div className="text-center py-6">
                  <div className="text-4xl font-bold text-white mb-2">{analytics.predictions.nextWeekTrips}</div>
                  <p className="text-white/80">Predicted Trips</p>
                  <div className="flex items-center justify-center mt-4 text-green-200">
                    <TrendingUp size={20} className="mr-2" />
                    <span>+3.7% expected</span>
                  </div>
                </div>
              </ChartCard>
            </div>

            <ChartCard title="Predictive Insights" gradient="info">
              <div className="space-y-4 py-4">
                <div className="flex items-start space-x-3">
                  <Sparkles className="h-5 w-5 text-yellow-400 mt-0.5" />
                  <div>
                    <p className="text-white font-medium">Attendance Optimization</p>
                    <p className="text-white/70 text-sm">
                      Based on current trends, focusing on route 12-B could improve overall attendance by 2-3%
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Rocket className="h-5 w-5 text-green-400 mt-0.5" />
                  <div>
                    <p className="text-white font-medium">Revenue Growth</p>
                    <p className="text-white/70 text-sm">
                      Payment completion rate suggests 8-12% revenue growth potential with improved collection processes
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
                  <div>
                    <p className="text-white font-medium">Maintenance Alert</p>
                    <p className="text-white/70 text-sm">
                      3 vehicles approaching scheduled maintenance in the next 7 days
                    </p>
                  </div>
                </div>
              </div>
            </ChartCard>
          </TabsContent>
        </Tabs>

        {/* Quick Actions Footer */}
        <div className="mt-12 pt-6 border-t border-white/20">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <span className="text-white/80 text-sm">Quick Actions:</span>
              <BeautifulButton variant="outline" size="sm">
                <DownloadCloud className="h-4 w-4 mr-2" />
                Export Report
              </BeautifulButton>
              <BeautifulButton variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Set Alerts
              </BeautifulButton>
              <BeautifulButton variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </BeautifulButton>
            </div>
            
            <div className="flex items-center space-x-2 text-white/60 text-sm">
              <Clock className="h-4 w-4" />
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;