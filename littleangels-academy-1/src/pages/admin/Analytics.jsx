import React, { useState, useEffect } from 'react';
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
  Filter
} from 'lucide-react';
import { BeautifulCard, BeautifulCardHeader, BeautifulCardTitle, BeautifulCardContent } from '../../components/ui/beautiful-card';
import { BeautifulButton } from '../../components/ui/beautiful-button';
import { BeautifulBadge } from '../../components/ui/beautiful-badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from 'sonner';

const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [analytics, setAnalytics] = useState({
    overview: {},
    attendance: {},
    transport: {},
    financial: {},
    performance: {}
  });

  useEffect(() => {
    fetchAnalytics();
  }, [user, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch comprehensive analytics data
      const [studentsRes, vehiclesRes, routesRes, attendanceRes, tripsRes, paymentsRes] = await Promise.all([
        supabase.from('students').select('*').eq('school_id', user?.school_id),
        supabase.from('vehicles').select('*').eq('school_id', user?.school_id),
        supabase.from('routes').select('*').eq('school_id', user?.school_id),
        supabase.from('attendance').select('*').eq('school_id', user?.school_id),
        supabase.from('trips').select('*').eq('school_id', user?.school_id),
        supabase.from('payments').select('*').eq('school_id', user?.school_id)
      ]);

      const students = studentsRes.data || [];
      const vehicles = vehiclesRes.data || [];
      const routes = routesRes.data || [];
      const attendance = attendanceRes.data || [];
      const trips = tripsRes.data || [];
      const payments = paymentsRes.data || [];

      // Calculate analytics
      const analyticsData = calculateAnalytics(students, vehicles, routes, attendance, trips, payments);
      setAnalytics(analyticsData);

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (students, vehicles, routes, attendance, trips, payments) => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
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
    const recentAttendance = attendance.filter(a => new Date(a.date) >= thirtyDaysAgo);
    const presentDays = recentAttendance.filter(a => a.status === 'present').length;
    const totalAttendanceDays = recentAttendance.length;
    const attendanceRate = totalAttendanceDays > 0 ? (presentDays / totalAttendanceDays) * 100 : 0;

    // Transport analytics
    const utilizationRate = totalStudents > 0 ? (students.filter(s => s.route_id).length / totalStudents) * 100 : 0;
    const averageTripDuration = trips.length > 0 ? 
      trips.reduce((sum, t) => {
        if (t.start_time && t.end_time) {
          const start = new Date(t.start_time);
          const end = new Date(t.end_time);
          return sum + (end - start) / (1000 * 60 * 60); // hours
        }
        return sum;
      }, 0) / trips.length : 0;

    // Performance metrics
    const onTimeTrips = trips.filter(t => {
      // Simple on-time calculation based on expected vs actual duration
      return t.status === 'completed' && Math.random() > 0.2; // Mock data
    }).length;
    const onTimeRate = trips.length > 0 ? (onTimeTrips / trips.length) * 100 : 0;

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
        onTimeRate: Math.round(onTimeRate * 100) / 100
      },
      attendance: {
        rate: Math.round(attendanceRate * 100) / 100,
        presentDays,
        totalDays: totalAttendanceDays,
        perfectAttendance: students.filter(s => {
          const studentAttendance = recentAttendance.filter(a => a.student_id === s.id);
          const studentPresentDays = studentAttendance.filter(a => a.status === 'present').length;
          return studentPresentDays === studentAttendance.length && studentAttendance.length > 0;
        }).length,
        lowAttendance: students.filter(s => {
          const studentAttendance = recentAttendance.filter(a => a.student_id === s.id);
          const studentPresentDays = studentAttendance.filter(a => a.status === 'present').length;
          const studentRate = studentAttendance.length > 0 ? (studentPresentDays / studentAttendance.length) * 100 : 0;
          return studentRate < 80;
        }).length
      },
      transport: {
        utilizationRate: Math.round(utilizationRate * 100) / 100,
        averageTripDuration: Math.round(averageTripDuration * 100) / 100,
        totalDistance: routes.reduce((sum, r) => sum + (r.distance || 0), 0),
        fuelEfficiency: Math.round(Math.random() * 20 + 10), // Mock data
        maintenanceAlerts: vehicles.filter(v => {
          const maintenance = typeof v.maintenance_info === 'string' ? 
            JSON.parse(v.maintenance_info) : v.maintenance_info;
          const nextService = new Date(maintenance.nextService);
          return nextService <= now;
        }).length
      },
      financial: {
        totalRevenue,
        monthlyRevenue: payments.filter(p => new Date(p.created_at) >= thirtyDaysAgo)
          .reduce((sum, p) => sum + (p.amount || 0), 0),
        averagePayment: payments.length > 0 ? totalRevenue / payments.length : 0,
        pendingPayments: payments.filter(p => p.status === 'pending').length,
        completedPayments: payments.filter(p => p.status === 'completed').length
      },
      performance: {
        onTimeRate: Math.round(onTimeRate * 100) / 100,
        efficiency: Math.round((attendanceRate + utilizationRate + onTimeRate) / 3 * 100) / 100,
        satisfaction: Math.round(Math.random() * 20 + 80), // Mock data
        safety: Math.round(Math.random() * 10 + 90) // Mock data
      }
    };
  };

  const StatCard = ({ title, value, icon: Icon, gradient, trend, description, glow = false }) => (
    <BeautifulCard gradient={gradient} glow={glow} className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white/80">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {description && (
            <p className="text-sm text-white/70 mt-1">{description}</p>
          )}
          {trend && (
            <p className={`text-sm mt-1 ${trend > 0 ? 'text-green-200' : 'text-red-200'}`}>
              {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}% from last period
            </p>
          )}
        </div>
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>
    </BeautifulCard>
  );

  const ChartCard = ({ title, children, gradient = 'info' }) => (
    <BeautifulCard gradient={gradient} className="p-6">
      <BeautifulCardHeader>
        <BeautifulCardTitle className="flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          {title}
        </BeautifulCardTitle>
      </BeautifulCardHeader>
      <BeautifulCardContent>
        {children}
      </BeautifulCardContent>
    </BeautifulCard>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-beautiful mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
      <div className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white">Analytics Dashboard</h1>
                <p className="text-white/80 mt-2">Comprehensive insights and performance metrics</p>
              </div>
              <div className="flex items-center space-x-4">
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
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </BeautifulButton>
                <BeautifulButton variant="info">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </BeautifulButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Students"
            value={analytics.overview.totalStudents}
            icon={Users}
            gradient="blue"
            trend={5.2}
            description="Active enrollment"
            glow
          />
          <StatCard
            title="Attendance Rate"
            value={`${analytics.overview.attendanceRate}%`}
            icon={CheckCircle}
            gradient="success"
            trend={2.1}
            description="Last 30 days"
          />
          <StatCard
            title="Transport Utilization"
            value={`${analytics.overview.utilizationRate}%`}
            icon={Bus}
            gradient="warning"
            trend={-1.3}
            description="Route efficiency"
          />
          <StatCard
            title="Total Revenue"
            value={`$${analytics.overview.totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            gradient="danger"
            trend={8.7}
            description="All time"
            glow
          />
        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="On-Time Rate"
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
            description="Safety rating"
          />
          <StatCard
            title="Efficiency"
            value={`${analytics.performance.efficiency}%`}
            icon={Target}
            gradient="pink"
            trend={4.6}
            description="Overall performance"
            glow
          />
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="tab-beautiful">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="transport">Transport</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title="Student Distribution" gradient="blue">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Active Students</span>
                    <span className="text-white font-bold">{analytics.overview.activeStudents}</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3">
                    <div 
                      className="bg-white rounded-full h-3 transition-all duration-1000"
                      style={{ width: `${(analytics.overview.activeStudents / analytics.overview.totalStudents) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Inactive Students</span>
                    <span className="text-white font-bold">{analytics.overview.totalStudents - analytics.overview.activeStudents}</span>
                  </div>
                </div>
              </ChartCard>

              <ChartCard title="Transport Status" gradient="success">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Active Vehicles</span>
                    <span className="text-white font-bold">{analytics.overview.activeVehicles}</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3">
                    <div 
                      className="bg-white rounded-full h-3 transition-all duration-1000"
                      style={{ width: `${(analytics.overview.activeVehicles / analytics.overview.totalVehicles) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Active Routes</span>
                    <span className="text-white font-bold">{analytics.overview.activeRoutes}</span>
                  </div>
                </div>
              </ChartCard>
            </div>

            <ChartCard title="Recent Activity" gradient="purple">
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{analytics.overview.completedTrips}</div>
                    <div className="text-sm text-white/70">Completed Trips</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{analytics.attendance.presentDays}</div>
                    <div className="text-sm text-white/70">Present Today</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{analytics.financial.completedPayments}</div>
                    <div className="text-sm text-white/70">Paid Invoices</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{analytics.transport.maintenanceAlerts}</div>
                    <div className="text-sm text-white/70">Maintenance Alerts</div>
                  </div>
                </div>
              </div>
            </ChartCard>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title="Attendance Rate" gradient="success">
                <div className="text-center">
                  <div className="text-6xl font-bold text-white mb-4">{analytics.attendance.rate}%</div>
                  <div className="w-full bg-white/20 rounded-full h-4 mb-4">
                    <div 
                      className="bg-white rounded-full h-4 transition-all duration-1000"
                      style={{ width: `${analytics.attendance.rate}%` }}
                    ></div>
                  </div>
                  <p className="text-white/80">Based on {analytics.attendance.totalDays} attendance records</p>
                </div>
              </ChartCard>

              <ChartCard title="Attendance Stats" gradient="info">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Perfect Attendance</span>
                    <BeautifulBadge variant="success">{analytics.attendance.perfectAttendance}</BeautifulBadge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Low Attendance</span>
                    <BeautifulBadge variant="warning">{analytics.attendance.lowAttendance}</BeautifulBadge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Present Days</span>
                    <span className="text-white font-bold">{analytics.attendance.presentDays}</span>
                  </div>
                </div>
              </ChartCard>
            </div>
          </TabsContent>

          {/* Transport Tab */}
          <TabsContent value="transport" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title="Utilization Rate" gradient="warning">
                <div className="text-center">
                  <div className="text-6xl font-bold text-white mb-4">{analytics.transport.utilizationRate}%</div>
                  <div className="w-full bg-white/20 rounded-full h-4 mb-4">
                    <div 
                      className="bg-white rounded-full h-4 transition-all duration-1000"
                      style={{ width: `${analytics.transport.utilizationRate}%` }}
                    ></div>
                  </div>
                  <p className="text-white/80">Students using transport</p>
                </div>
              </ChartCard>

              <ChartCard title="Transport Metrics" gradient="blue">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Avg Trip Duration</span>
                    <span className="text-white font-bold">{analytics.transport.averageTripDuration}h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Total Distance</span>
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
                </div>
              </ChartCard>
            </div>
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title="Revenue Overview" gradient="danger">
                <div className="space-y-4">
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
                </div>
              </ChartCard>

              <ChartCard title="Payment Status" gradient="purple">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Completed</span>
                    <BeautifulBadge variant="success">{analytics.financial.completedPayments}</BeautifulBadge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Pending</span>
                    <BeautifulBadge variant="warning">{analytics.financial.pendingPayments}</BeautifulBadge>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3">
                    <div 
                      className="bg-white rounded-full h-3 transition-all duration-1000"
                      style={{ 
                        width: `${analytics.financial.completedPayments > 0 ? 
                          (analytics.financial.completedPayments / (analytics.financial.completedPayments + analytics.financial.pendingPayments)) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </ChartCard>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title="Overall Performance" gradient="pink">
                <div className="text-center">
                  <div className="text-6xl font-bold text-white mb-4">{analytics.performance.efficiency}%</div>
                  <div className="w-full bg-white/20 rounded-full h-4 mb-4">
                    <div 
                      className="bg-white rounded-full h-4 transition-all duration-1000"
                      style={{ width: `${analytics.performance.efficiency}%` }}
                    ></div>
                  </div>
                  <p className="text-white/80">Combined efficiency score</p>
                </div>
              </ChartCard>

              <ChartCard title="Performance Metrics" gradient="info">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">On-Time Rate</span>
                    <span className="text-white font-bold">{analytics.performance.onTimeRate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Safety Score</span>
                    <span className="text-white font-bold">{analytics.performance.safety}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Satisfaction</span>
                    <span className="text-white font-bold">{analytics.performance.satisfaction}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Efficiency</span>
                    <span className="text-white font-bold">{analytics.performance.efficiency}%</span>
                  </div>
                </div>
              </ChartCard>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
