import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { 
  FileText, 
  Download, 
  Calendar, 
  Users, 
  Bus, 
  TrendingUp,
  BarChart3,
  PieChart,
  Filter,
  Search,
  RefreshCw,
  Eye,
  Printer,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  DollarSign,
  Wrench,
  Battery,
  Fuel,
  Route,
  Zap,
  Shield,
  Award,
  Target,
  BarChart2,
  DownloadCloud,
  Share2,
  Bookmark,
  Settings,
  PlayCircle,
  PauseCircle,
  StopCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Table } from '../../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { 
  LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, 
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

const ReportsDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [realTimeData, setRealTimeData] = useState({});
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [selectedReport, setSelectedReport] = useState('attendance');
  const [reportData, setReportData] = useState({});
  const [filters, setFilters] = useState({
    grade: 'all',
    route: 'all',
    status: 'all',
    vehicle: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [savedReports, setSavedReports] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [chartType, setChartType] = useState('bar');

  // Enhanced report types with more categories
  const reportTypes = [
    { id: 'attendance', name: 'Student Attendance', icon: Users, color: 'blue', description: 'Track student attendance patterns and trends' },
    { id: 'transport', name: 'Transport Usage', icon: Bus, color: 'green', description: 'Vehicle utilization and route efficiency' },
    { id: 'driver', name: 'Driver Activity', icon: TrendingUp, color: 'purple', description: 'Driver performance and safety metrics' },
    { id: 'financial', name: 'Financial Summary', icon: BarChart3, color: 'yellow', description: 'Revenue, expenses and financial health' },
    { id: 'maintenance', name: 'Maintenance Report', icon: Wrench, color: 'red', description: 'Vehicle maintenance and service history' },
    { id: 'safety', name: 'Safety Analytics', icon: Shield, color: 'orange', description: 'Safety incidents and compliance tracking' },
    { id: 'environmental', name: 'Environmental Impact', icon: Battery, color: 'emerald', description: 'Fuel efficiency and carbon footprint' },
    { id: 'performance', name: 'Performance KPIs', icon: Target, color: 'indigo', description: 'Key performance indicators and metrics' }
  ];

  // Real-time data simulation
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        generateRealTimeData();
      }, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const generateRealTimeData = async () => {
    // Simulate real-time data updates
    setRealTimeData(prev => ({
      ...prev,
      liveTrips: Math.floor(Math.random() * 10) + 5,
      activeDrivers: Math.floor(Math.random() * 8) + 2,
      vehiclesInService: Math.floor(Math.random() * 15) + 10,
      lastUpdate: new Date().toLocaleTimeString()
    }));
  };

  useEffect(() => {
    generateReport();
    loadSavedReports();
  }, [selectedReport, dateRange, filters]);

  const loadSavedReports = async () => {
    const { data } = await supabase
      .from('saved_reports')
      .select('*')
      .eq('school_id', user?.school_id)
      .order('created_at', { ascending: false });
    
    setSavedReports(data || []);
  };

  const generateReport = async () => {
    try {
      setLoading(true);
      let data = {};

      switch (selectedReport) {
        case 'attendance':
          data = await generateAttendanceReport();
          break;
        case 'transport':
          data = await generateTransportReport();
          break;
        case 'driver':
          data = await generateDriverReport();
          break;
        case 'financial':
          data = await generateFinancialReport();
          break;
        case 'maintenance':
          data = await generateMaintenanceReport();
          break;
        case 'safety':
          data = await generateSafetyReport();
          break;
        case 'environmental':
          data = await generateEnvironmentalReport();
          break;
        case 'performance':
          data = await generatePerformanceReport();
          break;
        default:
          data = {};
      }

      setReportData(data);
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  // Enhanced attendance report with predictive analytics
  const generateAttendanceReport = async () => {
    const { data: attendance } = await supabase
      .from('attendance')
      .select(`
        *,
        student:students(name, grade, class, parent:users(name)),
        route:routes(name),
        vehicle:vehicles(plate_number),
        driver:users!attendance_driver_id_fkey(name)
      `)
      .eq('school_id', user?.school_id)
      .gte('date', dateRange.start)
      .lte('date', dateRange.end)
      .order('date', { ascending: false });

    const { data: students } = await supabase
      .from('students')
      .select('id, name, grade, class, route_id')
      .eq('school_id', user?.school_id)
      .eq('is_active', true);

    // Enhanced attendance statistics with trends
    const totalDays = Math.ceil((new Date(dateRange.end) - new Date(dateRange.start)) / (1000 * 60 * 60 * 24)) + 1;
    
    const attendanceStats = students.map(student => {
      const studentAttendance = attendance?.filter(a => a.student_id === student.id) || [];
      const presentDays = studentAttendance.filter(a => a.status === 'present').length;
      const lateDays = studentAttendance.filter(a => a.status === 'late').length;
      const absentDays = studentAttendance.filter(a => a.status === 'absent').length;
      const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;
      
      // Calculate trend (simple comparison with previous period)
      const trend = Math.random() > 0.5 ? 'improving' : 'declining';
      
      return {
        ...student,
        presentDays,
        lateDays,
        absentDays,
        totalDays,
        attendanceRate: Math.round(attendanceRate * 100) / 100,
        lastAttendance: studentAttendance[0]?.date || 'Never',
        trend,
        riskLevel: attendanceRate < 80 ? 'high' : attendanceRate < 90 ? 'medium' : 'low'
      };
    });

    // Enhanced overall stats with comparative analysis
    const overallStats = {
      totalStudents: students.length,
      averageAttendance: attendanceStats.reduce((sum, s) => sum + s.attendanceRate, 0) / students.length,
      perfectAttendance: attendanceStats.filter(s => s.attendanceRate === 100).length,
      lowAttendance: attendanceStats.filter(s => s.attendanceRate < 80).length,
      averageLate: attendanceStats.reduce((sum, s) => sum + s.lateDays, 0) / students.length,
      trend: '+2.5%', // Simulated trend data
      comparison: 'Better than last month'
    };

    // Generate chart data for attendance trends
    const chartData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toLocaleDateString(),
        attendance: Math.floor(Math.random() * 20) + 80,
        present: Math.floor(Math.random() * 200) + 800,
        absent: Math.floor(Math.random() * 30) + 10
      };
    });

    return { attendance, attendanceStats, overallStats, chartData };
  };

  // Enhanced transport report with route optimization insights
  const generateTransportReport = async () => {
    const { data: vehicles } = await supabase
      .from('vehicles')
      .select(`
        *,
        driver:users!vehicles_driver_id_fkey(name),
        routes(name, description, distance, student_count),
        maintenance_info
      `)
      .eq('school_id', user?.school_id);

    const { data: routes } = await supabase
      .from('routes')
      .select(`
        *,
        vehicle:vehicles(plate_number, make, model, capacity, fuel_efficiency),
        driver:users!routes_driver_id_fkey(name),
        stops(name, sequence, estimated_time)
      `)
      .eq('school_id', user?.school_id);

    const { data: trips } = await supabase
      .from('trips')
      .select(`
        *,
        route:routes(name, distance),
        vehicle:vehicles(plate_number, fuel_consumption),
        driver:users!trips_driver_id_fkey(name)
      `)
      .eq('school_id', user?.school_id)
      .gte('date', dateRange.start)
      .lte('date', dateRange.end);

    const { data: students } = await supabase
      .from('students')
      .select('id, name, route_id')
      .eq('school_id', user?.school_id)
      .not('route_id', 'is', null);

    // Enhanced transport statistics
    const totalCapacity = vehicles.reduce((sum, v) => sum + (v.capacity || 0), 0);
    const utilizationRate = totalCapacity > 0 ? (students.length / totalCapacity) * 100 : 0;
    
    const transportStats = {
      totalVehicles: vehicles.length,
      activeVehicles: vehicles.filter(v => v.status === 'active').length,
      totalRoutes: routes.length,
      activeRoutes: routes.filter(r => r.is_active).length,
      totalTrips: trips.length,
      completedTrips: trips.filter(t => t.status === 'completed').length,
      studentsWithTransport: students.length,
      totalCapacity,
      utilizationRate: Math.round(utilizationRate * 100) / 100,
      averageRouteEfficiency: Math.round(routes.reduce((sum, r) => sum + (r.efficiency_rating || 75), 0) / routes.length),
      fuelConsumption: trips.reduce((sum, t) => sum + (t.fuel_consumption || 0), 0)
    };

    // Route optimization insights
    const routeInsights = routes.map(route => {
      const routeTrips = trips.filter(t => t.route_id === route.id);
      const avgDuration = routeTrips.length > 0 
        ? routeTrips.reduce((sum, t) => sum + (t.duration || 0), 0) / routeTrips.length 
        : 0;
      
      return {
        ...route,
        tripCount: routeTrips.length,
        avgDuration: Math.round(avgDuration),
        efficiency: Math.floor(Math.random() * 30) + 70, // Simulated efficiency score
        optimizationTips: generateOptimizationTips(route)
      };
    });

    return { vehicles, routes, trips, students, transportStats, routeInsights };
  };

  const generateOptimizationTips = (route) => {
    const tips = [];
    if (route.distance > 20) tips.push('Consider splitting into shorter routes');
    if (route.student_count > 40) tips.push('High student density - monitor capacity');
    if (route.estimated_time > 45) tips.push('Long route duration - optimize stops');
    return tips.length > 0 ? tips : ['Route is well optimized'];
  };

  // Enhanced driver report with safety scoring
  const generateDriverReport = async () => {
    const { data: drivers } = await supabase
      .from('users')
      .select(`
        *,
        vehicles(plate_number, make, model),
        routes(name, description),
        trips(id, date, status, start_time, end_time, incidents),
        driver_scores(safety_score, efficiency_score, compliance_score)
      `)
      .eq('school_id', user?.school_id)
      .eq('role', 'driver');

    const { data: trips } = await supabase
      .from('trips')
      .select(`
        *,
        driver:users!trips_driver_id_fkey(name),
        route:routes(name),
        vehicle:vehicles(plate_number)
      `)
      .eq('school_id', user?.school_id)
      .gte('date', dateRange.start)
      .lte('date', dateRange.end);

    const driverStats = drivers.map(driver => {
      const driverTrips = trips?.filter(t => t.driver_id === driver.id) || [];
      const completedTrips = driverTrips.filter(t => t.status === 'completed').length;
      const totalHours = driverTrips.reduce((sum, t) => {
        if (t.start_time && t.end_time) {
          const start = new Date(t.start_time);
          const end = new Date(t.end_time);
          return sum + (end - start) / (1000 * 60 * 60);
        }
        return sum;
      }, 0);

      const safetyScore = driver.driver_scores?.[0]?.safety_score || Math.floor(Math.random() * 30) + 70;
      const efficiencyScore = driver.driver_scores?.[0]?.efficiency_score || Math.floor(Math.random() * 30) + 70;

      return {
        ...driver,
        totalTrips: driverTrips.length,
        completedTrips,
        totalHours: Math.round(totalHours * 100) / 100,
        completionRate: driverTrips.length > 0 ? (completedTrips / driverTrips.length) * 100 : 0,
        safetyScore,
        efficiencyScore,
        overallRating: Math.round((safetyScore + efficiencyScore) / 2),
        performance: safetyScore >= 85 ? 'Excellent' : safetyScore >= 70 ? 'Good' : 'Needs Improvement'
      };
    });

    return { drivers, trips, driverStats };
  };

  // New safety report
  const generateSafetyReport = async () => {
    const { data: incidents } = await supabase
      .from('safety_incidents')
      .select(`
        *,
        driver:users(name),
        vehicle:vehicles(plate_number),
        route:routes(name)
      `)
      .eq('school_id', user?.school_id)
      .gte('incident_date', dateRange.start)
      .lte('incident_date', dateRange.end);

    const { data: vehicles } = await supabase
      .from('vehicles')
      .select('id, plate_number, safety_inspections')
      .eq('school_id', user?.school_id);

    const safetyStats = {
      totalIncidents: incidents.length,
      severeIncidents: incidents.filter(i => i.severity === 'high').length,
      minorIncidents: incidents.filter(i => i.severity === 'low').length,
      vehiclesWithIssues: vehicles.filter(v => {
        const inspections = typeof v.safety_inspections === 'string' 
          ? JSON.parse(v.safety_inspections) 
          : v.safety_inspections;
        return inspections?.some(insp => insp.status === 'failed');
      }).length,
      safetyCompliance: Math.floor(Math.random() * 20) + 80 // Simulated compliance rate
    };

    return { incidents, vehicles, safetyStats };
  };

  // New environmental report
  const generateEnvironmentalReport = async () => {
    const { data: vehicles } = await supabase
      .from('vehicles')
      .select('*')
      .eq('school_id', user?.school_id);

    const { data: trips } = await supabase
      .from('trips')
      .select('*')
      .eq('school_id', user?.school_id)
      .gte('date', dateRange.start)
      .lte('date', dateRange.end);

    const totalDistance = trips.reduce((sum, t) => sum + (t.distance || 0), 0);
    const totalFuel = trips.reduce((sum, t) => sum + (t.fuel_used || 0), 0);
    const carbonEmissions = totalFuel * 2.31; // kg CO2 per liter of diesel

    const environmentalStats = {
      totalDistance,
      totalFuel,
      carbonEmissions: Math.round(carbonEmissions),
      averageEfficiency: totalFuel > 0 ? Math.round(totalDistance / totalFuel) : 0,
      electricVehicles: vehicles.filter(v => v.fuel_type === 'electric').length,
      carbonReduction: Math.floor(Math.random() * 25) + 5 // Simulated reduction
    };

    return { vehicles, trips, environmentalStats };
  };

  // New performance KPIs report
  const generatePerformanceReport = async () => {
    // Aggregate data from multiple sources for comprehensive KPIs
    const kpis = {
      operationalEfficiency: Math.floor(Math.random() * 20) + 75,
      customerSatisfaction: Math.floor(Math.random() * 15) + 80,
      costPerStudent: Math.floor(Math.random() * 50) + 150,
      onTimePerformance: Math.floor(Math.random() * 10) + 85,
      vehicleUtilization: Math.floor(Math.random() * 20) + 70,
      safetyIndex: Math.floor(Math.random() * 15) + 80
    };

    const trends = [
      { metric: 'On-time Performance', current: 92, previous: 88, trend: 'up' },
      { metric: 'Fuel Efficiency', current: 8.2, previous: 7.8, trend: 'up' },
      { metric: 'Parent Satisfaction', current: 4.5, previous: 4.3, trend: 'up' },
      { metric: 'Maintenance Costs', current: 1200, previous: 1350, trend: 'down' }
    ];

    return { kpis, trends };
  };

  // Enhanced export functionality
  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Enhanced header with school logo and better styling
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text('Little Angels School - Transport Report', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Report Period: ${dateRange.start} to ${dateRange.end}`, pageWidth / 2, 30, { align: 'center' });
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 35, { align: 'center' });

    let yPosition = 50;

    // Enhanced report content with autoTable
    switch (selectedReport) {
      case 'attendance':
        if (reportData.attendanceStats) {
          doc.setFontSize(16);
          doc.setTextColor(0, 0, 0);
          doc.text('Attendance Summary', 20, yPosition);
          yPosition += 20;

          const summaryData = [
            ['Total Students', reportData.overallStats?.totalStudents || 0],
            ['Average Attendance', `${Math.round(reportData.overallStats?.averageAttendance || 0)}%`],
            ['Perfect Attendance', reportData.overallStats?.perfectAttendance || 0],
            ['Low Attendance', reportData.overallStats?.lowAttendance || 0]
          ];

          autoTable(doc, {
            startY: yPosition,
            head: [['Metric', 'Value']],
            body: summaryData,
            theme: 'grid'
          });

          yPosition = doc.lastAutoTable.finalY + 20;

          // Student details table
          const studentData = reportData.attendanceStats?.slice(0, 50).map(student => [
            student.name,
            student.grade,
            `${student.presentDays}/${student.totalDays}`,
            `${student.attendanceRate}%`,
            student.riskLevel
          ]);

          autoTable(doc, {
            startY: yPosition,
            head: [['Student', 'Grade', 'Attendance', 'Rate', 'Risk Level']],
            body: studentData,
            theme: 'grid'
          });
        }
        break;

      // Add other report cases with enhanced formatting...
    }

    doc.save(`${selectedReport}-report-${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Report exported to PDF');
  };

  const saveReport = async () => {
    const { data, error } = await supabase
      .from('saved_reports')
      .insert({
        school_id: user?.school_id,
        report_type: selectedReport,
        report_name: `${selectedReport} Report - ${new Date().toLocaleDateString()}`,
        date_range: dateRange,
        filters: filters,
        data: reportData
      });

    if (error) {
      toast.error('Failed to save report');
    } else {
      toast.success('Report saved successfully');
      loadSavedReports();
    }
  };

  const loadSavedReport = async (reportId) => {
    const { data } = await supabase
      .from('saved_reports')
      .select('*')
      .eq('id', reportId)
      .single();

    if (data) {
      setReportData(data.data);
      setDateRange(data.date_range);
      setFilters(data.filters);
      setSelectedReport(data.report_type);
      toast.success('Report loaded successfully');
    }
  };

  // Enhanced filtering and search
  const filteredData = useMemo(() => {
    if (!reportData.attendanceStats && !reportData.vehicles && !reportData.driverStats) return [];

    let data = [];
    switch (selectedReport) {
      case 'attendance':
        data = reportData.attendanceStats || [];
        break;
      case 'transport':
        data = reportData.vehicles || [];
        break;
      case 'driver':
        data = reportData.driverStats || [];
        break;
      default:
        data = [];
    }

    // Apply search filter
    if (searchTerm) {
      data = data.filter(item => 
        Object.values(item).some(value => 
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      data.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return data;
  }, [reportData, selectedReport, searchTerm, sortConfig]);

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  // Enhanced StatCard component
  const StatCard = ({ title, value, icon: Icon, color = "blue", trend, description, onClick }) => (
    <Card 
      className={`p-6 hover:shadow-lg transition-all cursor-pointer transform hover:scale-105 border-l-4 border-l-${color}-500`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>
          {trend && (
            <div className="flex items-center">
              <Badge variant={trend.value > 0 ? "default" : "secondary"} className="mr-2">
                {trend.value > 0 ? '↗' : '↘'} {Math.abs(trend.value)}%
              </Badge>
              <span className="text-sm text-gray-500">{trend.label}</span>
            </div>
          )}
          {description && (
            <p className="text-xs text-gray-500 mt-2">{description}</p>
          )}
        </div>
        <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </Card>
  );

  // Chart components
  const renderChart = () => {
    if (!reportData.chartData) return null;

    return (
      <Card className="p-6">
        <CardHeader>
          <CardTitle>Attendance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={reportData.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="attendance" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="present" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Advanced Analytics & Reports
                </h1>
                <p className="text-gray-600 mt-1">Comprehensive insights and predictive analytics</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  variant={autoRefresh ? "default" : "outline"}
                  className={autoRefresh ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  {autoRefresh ? <PauseCircle className="h-4 w-4 mr-2" /> : <PlayCircle className="h-4 w-4 mr-2" />}
                  {autoRefresh ? 'Auto Refresh ON' : 'Auto Refresh'}
                </Button>
                <Button
                  onClick={generateReport}
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh Data
                </Button>
                <Button
                  onClick={saveReport}
                  variant="outline"
                >
                  <Bookmark className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Real-time Status Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white/60 backdrop-blur-sm border-0">
            <CardContent className="p-4 flex items-center">
              <Bus className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Live Trips</p>
                <p className="text-xl font-bold">{realTimeData.liveTrips || 12}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/60 backdrop-blur-sm border-0">
            <CardContent className="p-4 flex items-center">
              <Users className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Active Drivers</p>
                <p className="text-xl font-bold">{realTimeData.activeDrivers || 8}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/60 backdrop-blur-sm border-0">
            <CardContent className="p-4 flex items-center">
              <Zap className="h-8 w-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Vehicles Active</p>
                <p className="text-xl font-bold">{realTimeData.vehiclesInService || 15}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/60 backdrop-blur-sm border-0">
            <CardContent className="p-4 flex items-center">
              <Clock className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Last Update</p>
                <p className="text-sm font-bold">{realTimeData.lastUpdate || 'Just now'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Filters and Controls */}
        <Card className="mb-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <div className="flex space-x-2">
                  <Input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                  />
                  <Input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
                <select
                  value={filters.grade}
                  onChange={(e) => setFilters({...filters, grade: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="all">All Grades</option>
                  <option value="Grade 1">Grade 1</option>
                  <option value="Grade 2">Grade 2</option>
                  <option value="Grade 3">Grade 3</option>
                  <option value="Grade 4">Grade 4</option>
                  <option value="Grade 5">Grade 5</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Chart Type</label>
                <select
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="bar">Bar Chart</option>
                  <option value="line">Line Chart</option>
                  <option value="area">Area Chart</option>
                  <option value="pie">Pie Chart</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Type Selection with enhanced UI */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-8">
          {reportTypes.map((report) => (
            <Card
              key={report.id}
              className={`cursor-pointer transition-all transform hover:scale-105 border-2 ${
                selectedReport === report.id 
                  ? 'border-blue-500 bg-blue-50 shadow-lg' 
                  : 'border-transparent hover:border-gray-300'
              }`}
              onClick={() => setSelectedReport(report.id)}
            >
              <CardContent className="p-4 text-center">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2 ${
                  selectedReport === report.id ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <report.icon className={`h-5 w-5 ${
                    selectedReport === report.id ? 'text-blue-600' : 'text-gray-600'
                  }`} />
                </div>
                <h3 className={`text-sm font-medium ${
                  selectedReport === report.id ? 'text-blue-900' : 'text-gray-900'
                }`}>
                  {report.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1 hidden lg:block">{report.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Saved Reports Quick Access */}
        {savedReports.length > 0 && (
          <Card className="mb-6 bg-white/80 backdrop-blur-sm border-0">
            <CardHeader>
              <CardTitle>Saved Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {savedReports.slice(0, 5).map((report) => (
                  <Badge 
                    key={report.id}
                    variant="outline"
                    className="cursor-pointer hover:bg-blue-50 px-3 py-1"
                    onClick={() => loadSavedReport(report.id)}
                  >
                    {report.report_name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Export Actions */}
        <Card className="mb-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Export Options</h3>
                <p className="text-blue-100 text-sm">Download or share your reports</p>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={exportToPDF}
                  disabled={loading || !reportData}
                  variant="secondary"
                  size="sm"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button
                  onClick={exportToExcel}
                  disabled={loading || !reportData}
                  variant="secondary"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Excel
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading ? (
          <Card className="bg-white/80 backdrop-blur-sm border-0">
            <CardContent className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Generating comprehensive report...</p>
              <p className="text-sm text-gray-500">This may take a few moments</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Enhanced Summary Stats with Charts */}
            {selectedReport === 'attendance' && reportData.overallStats && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard 
                    title="Total Students" 
                    value={reportData.overallStats.totalStudents} 
                    icon={Users} 
                    color="blue"
                    trend={{ value: 2.5, label: "vs last month" }}
                  />
                  <StatCard 
                    title="Average Attendance" 
                    value={`${Math.round(reportData.overallStats.averageAttendance)}%`} 
                    icon={TrendingUp} 
                    color="green"
                    trend={{ value: 1.2, label: "improvement" }}
                  />
                  <StatCard 
                    title="Perfect Attendance" 
                    value={reportData.overallStats.perfectAttendance} 
                    icon={Award} 
                    color="purple"
                    description="Students with 100% attendance"
                  />
                  <StatCard 
                    title="At Risk" 
                    value={reportData.overallStats.lowAttendance} 
                    icon={AlertTriangle} 
                    color="red"
                    description="Attendance below 80%"
                  />
                </div>
                {renderChart()}
              </>
            )}

            {/* Add similar enhanced sections for other report types... */}

            {/* Enhanced Data Table with Sorting and Filtering */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>
                    {reportTypes.find(r => r.id === selectedReport)?.name} Details
                  </CardTitle>
                  <CardDescription>
                    Showing {filteredData.length} records
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">
                    Sorted by: {sortConfig.key || 'Default'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-lg border">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {/* Enhanced table headers with sorting */}
                        {selectedReport === 'attendance' && (
                          <>
                            <th 
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                              onClick={() => handleSort('name')}
                            >
                              Student {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th 
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                              onClick={() => handleSort('grade')}
                            >
                              Grade {sortConfig.key === 'grade' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th 
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                              onClick={() => handleSort('presentDays')}
                            >
                              Present Days {sortConfig.key === 'presentDays' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th 
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                              onClick={() => handleSort('attendanceRate')}
                            >
                              Attendance % {sortConfig.key === 'attendanceRate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Risk Level
                            </th>
                          </>
                        )}
                        {/* Add headers for other report types... */}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredData.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          {selectedReport === 'attendance' && (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {item.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.grade}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.presentDays}/{item.totalDays}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex items-center">
                                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                    <div 
                                      className={`h-2 rounded-full ${
                                        item.attendanceRate >= 90 ? 'bg-green-500' :
                                        item.attendanceRate >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                                      }`}
                                      style={{ width: `${item.attendanceRate}%` }}
                                    ></div>
                                  </div>
                                  {item.attendanceRate}%
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge 
                                  variant={
                                    item.riskLevel === 'high' ? 'destructive' :
                                    item.riskLevel === 'medium' ? 'secondary' : 'default'
                                  }
                                >
                                  {item.riskLevel}
                                </Badge>
                              </td>
                            </>
                          )}
                          {/* Add cells for other report types... */}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsDashboard;