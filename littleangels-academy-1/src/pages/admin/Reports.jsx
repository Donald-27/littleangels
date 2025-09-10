import React, { useState, useEffect } from 'react';
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
  Printer
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Table } from '../../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

const ReportsDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [selectedReport, setSelectedReport] = useState('attendance');
  const [reportData, setReportData] = useState({});
  const [filters, setFilters] = useState({
    grade: 'all',
    route: 'all',
    status: 'all'
  });

  const reportTypes = [
    { id: 'attendance', name: 'Student Attendance', icon: Users, color: 'blue' },
    { id: 'transport', name: 'Transport Usage', icon: Bus, color: 'green' },
    { id: 'driver', name: 'Driver Activity', icon: TrendingUp, color: 'purple' },
    { id: 'financial', name: 'Financial Summary', icon: BarChart3, color: 'yellow' },
    { id: 'maintenance', name: 'Maintenance Report', icon: FileText, color: 'red' }
  ];

  useEffect(() => {
    generateReport();
  }, [selectedReport, dateRange, filters]);

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
      .select('id, name, grade, class')
      .eq('school_id', user?.school_id)
      .eq('is_active', true);

    // Calculate attendance statistics
    const totalDays = Math.ceil((new Date(dateRange.end) - new Date(dateRange.start)) / (1000 * 60 * 60 * 24)) + 1;
    const attendanceStats = students.map(student => {
      const studentAttendance = attendance?.filter(a => a.student_id === student.id) || [];
      const presentDays = studentAttendance.filter(a => a.status === 'present').length;
      const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;
      
      return {
        ...student,
        presentDays,
        totalDays,
        attendanceRate: Math.round(attendanceRate * 100) / 100,
        lastAttendance: studentAttendance[0]?.date || 'Never'
      };
    });

    const overallStats = {
      totalStudents: students.length,
      averageAttendance: attendanceStats.reduce((sum, s) => sum + s.attendanceRate, 0) / students.length,
      perfectAttendance: attendanceStats.filter(s => s.attendanceRate === 100).length,
      lowAttendance: attendanceStats.filter(s => s.attendanceRate < 80).length
    };

    return { attendance, attendanceStats, overallStats };
  };

  const generateTransportReport = async () => {
    const { data: vehicles } = await supabase
      .from('vehicles')
      .select(`
        *,
        driver:users!vehicles_driver_id_fkey(name),
        routes(name, description, distance)
      `)
      .eq('school_id', user?.school_id);

    const { data: routes } = await supabase
      .from('routes')
      .select(`
        *,
        vehicle:vehicles(plate_number, make, model, capacity),
        driver:users!routes_driver_id_fkey(name)
      `)
      .eq('school_id', user?.school_id);

    const { data: trips } = await supabase
      .from('trips')
      .select(`
        *,
        route:routes(name),
        vehicle:vehicles(plate_number)
      `)
      .eq('school_id', user?.school_id)
      .gte('date', dateRange.start)
      .lte('date', dateRange.end);

    const { data: students } = await supabase
      .from('students')
      .select('id, name, route_id')
      .eq('school_id', user?.school_id)
      .not('route_id', 'is', null);

    const transportStats = {
      totalVehicles: vehicles.length,
      activeVehicles: vehicles.filter(v => v.status === 'active').length,
      totalRoutes: routes.length,
      activeRoutes: routes.filter(r => r.is_active).length,
      totalTrips: trips.length,
      completedTrips: trips.filter(t => t.status === 'completed').length,
      studentsWithTransport: students.length,
      totalCapacity: vehicles.reduce((sum, v) => sum + v.capacity, 0),
      utilizationRate: vehicles.length > 0 ? (students.length / vehicles.reduce((sum, v) => sum + v.capacity, 0)) * 100 : 0
    };

    return { vehicles, routes, trips, students, transportStats };
  };

  const generateDriverReport = async () => {
    const { data: drivers } = await supabase
      .from('users')
      .select(`
        *,
        vehicles(plate_number, make, model),
        routes(name, description),
        trips(id, date, status, start_time, end_time)
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

      return {
        ...driver,
        totalTrips: driverTrips.length,
        completedTrips,
        totalHours: Math.round(totalHours * 100) / 100,
        completionRate: driverTrips.length > 0 ? (completedTrips / driverTrips.length) * 100 : 0
      };
    });

    return { drivers, trips, driverStats };
  };

  const generateFinancialReport = async () => {
    const { data: payments } = await supabase
      .from('payments')
      .select(`
        *,
        student:students(name, grade),
        parent:users(name)
      `)
      .eq('school_id', user?.school_id)
      .gte('created_at', dateRange.start)
      .lte('created_at', dateRange.end);

    const { data: expenses } = await supabase
      .from('expenses')
      .select('*')
      .eq('school_id', user?.school_id)
      .gte('created_at', dateRange.start)
      .lte('created_at', dateRange.end);

    const financialStats = {
      totalRevenue: payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
      totalExpenses: expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0,
      netProfit: 0,
      completedPayments: payments?.filter(p => p.status === 'completed').length || 0,
      pendingPayments: payments?.filter(p => p.status === 'pending').length || 0,
      totalTransactions: payments?.length || 0
    };

    financialStats.netProfit = financialStats.totalRevenue - financialStats.totalExpenses;

    return { payments, expenses, financialStats };
  };

  const generateMaintenanceReport = async () => {
    const { data: vehicles } = await supabase
      .from('vehicles')
      .select(`
        *,
        driver:users!vehicles_driver_id_fkey(name)
      `)
      .eq('school_id', user?.school_id);

    const maintenanceStats = vehicles.map(vehicle => {
      const maintenance = typeof vehicle.maintenance_info === 'string' ? 
        JSON.parse(vehicle.maintenance_info) : vehicle.maintenance_info;
      
      const lastService = new Date(maintenance.lastService);
      const nextService = new Date(maintenance.nextService);
      const today = new Date();
      
      const daysSinceService = Math.ceil((today - lastService) / (1000 * 60 * 60 * 24));
      const daysUntilNext = Math.ceil((nextService - today) / (1000 * 60 * 60 * 24));
      const isOverdue = nextService <= today;

      return {
        ...vehicle,
        maintenance,
        daysSinceService,
        daysUntilNext,
        isOverdue,
        status: isOverdue ? 'Overdue' : daysUntilNext <= 7 ? 'Due Soon' : 'Up to Date'
      };
    });

    const summaryStats = {
      totalVehicles: vehicles.length,
      overdueMaintenance: maintenanceStats.filter(v => v.isOverdue).length,
      dueSoon: maintenanceStats.filter(v => v.daysUntilNext <= 7 && !v.isOverdue).length,
      upToDate: maintenanceStats.filter(v => v.daysUntilNext > 7).length
    };

    return { maintenanceStats, summaryStats };
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Header
    doc.setFontSize(20);
    doc.text('Little Angels School Transport Report', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Report Period: ${dateRange.start} to ${dateRange.end}`, pageWidth / 2, 30, { align: 'center' });
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 35, { align: 'center' });

    let yPosition = 50;

    // Report content based on type
    switch (selectedReport) {
      case 'attendance':
        if (reportData.attendanceStats) {
          doc.setFontSize(16);
          doc.text('Attendance Summary', 20, yPosition);
          yPosition += 10;

          doc.setFontSize(12);
          doc.text(`Total Students: ${reportData.overallStats?.totalStudents || 0}`, 20, yPosition);
          yPosition += 7;
          doc.text(`Average Attendance: ${Math.round(reportData.overallStats?.averageAttendance || 0)}%`, 20, yPosition);
          yPosition += 7;
          doc.text(`Perfect Attendance: ${reportData.overallStats?.perfectAttendance || 0}`, 20, yPosition);
          yPosition += 7;
          doc.text(`Low Attendance (<80%): ${reportData.overallStats?.lowAttendance || 0}`, 20, yPosition);
          yPosition += 15;

          // Student details
          doc.setFontSize(14);
          doc.text('Student Attendance Details', 20, yPosition);
          yPosition += 10;

          doc.setFontSize(10);
          doc.text('Name', 20, yPosition);
          doc.text('Grade', 80, yPosition);
          doc.text('Present Days', 120, yPosition);
          doc.text('Attendance %', 160, yPosition);
          yPosition += 5;

          reportData.attendanceStats?.slice(0, 20).forEach(student => {
            if (yPosition > pageHeight - 20) {
              doc.addPage();
              yPosition = 20;
            }
            doc.text(student.name, 20, yPosition);
            doc.text(student.grade, 80, yPosition);
            doc.text(`${student.presentDays}/${student.totalDays}`, 120, yPosition);
            doc.text(`${student.attendanceRate}%`, 160, yPosition);
            yPosition += 5;
          });
        }
        break;

      case 'transport':
        if (reportData.transportStats) {
          doc.setFontSize(16);
          doc.text('Transport Summary', 20, yPosition);
          yPosition += 10;

          doc.setFontSize(12);
          doc.text(`Total Vehicles: ${reportData.transportStats.totalVehicles}`, 20, yPosition);
          yPosition += 7;
          doc.text(`Active Vehicles: ${reportData.transportStats.activeVehicles}`, 20, yPosition);
          yPosition += 7;
          doc.text(`Total Routes: ${reportData.transportStats.totalRoutes}`, 20, yPosition);
          yPosition += 7;
          doc.text(`Students with Transport: ${reportData.transportStats.studentsWithTransport}`, 20, yPosition);
          yPosition += 7;
          doc.text(`Utilization Rate: ${Math.round(reportData.transportStats.utilizationRate)}%`, 20, yPosition);
        }
        break;

      case 'driver':
        if (reportData.driverStats) {
          doc.setFontSize(16);
          doc.text('Driver Activity Summary', 20, yPosition);
          yPosition += 10;

          doc.setFontSize(10);
          doc.text('Driver Name', 20, yPosition);
          doc.text('Total Trips', 80, yPosition);
          doc.text('Completed', 120, yPosition);
          doc.text('Hours Worked', 160, yPosition);
          doc.text('Completion %', 200, yPosition);
          yPosition += 5;

          reportData.driverStats?.forEach(driver => {
            if (yPosition > pageHeight - 20) {
              doc.addPage();
              yPosition = 20;
            }
            doc.text(driver.name, 20, yPosition);
            doc.text(driver.totalTrips.toString(), 80, yPosition);
            doc.text(driver.completedTrips.toString(), 120, yPosition);
            doc.text(driver.totalHours.toString(), 160, yPosition);
            doc.text(`${Math.round(driver.completionRate)}%`, 200, yPosition);
            yPosition += 5;
          });
        }
        break;

      case 'financial':
        if (reportData.financialStats) {
          doc.setFontSize(16);
          doc.text('Financial Summary', 20, yPosition);
          yPosition += 10;

          doc.setFontSize(12);
          doc.text(`Total Revenue: $${reportData.financialStats.totalRevenue.toLocaleString()}`, 20, yPosition);
          yPosition += 7;
          doc.text(`Total Expenses: $${reportData.financialStats.totalExpenses.toLocaleString()}`, 20, yPosition);
          yPosition += 7;
          doc.text(`Net Profit: $${reportData.financialStats.netProfit.toLocaleString()}`, 20, yPosition);
          yPosition += 7;
          doc.text(`Completed Payments: ${reportData.financialStats.completedPayments}`, 20, yPosition);
          yPosition += 7;
          doc.text(`Pending Payments: ${reportData.financialStats.pendingPayments}`, 20, yPosition);
        }
        break;

      case 'maintenance':
        if (reportData.maintenanceStats) {
          doc.setFontSize(16);
          doc.text('Maintenance Summary', 20, yPosition);
          yPosition += 10;

          doc.setFontSize(12);
          doc.text(`Total Vehicles: ${reportData.summaryStats?.totalVehicles || 0}`, 20, yPosition);
          yPosition += 7;
          doc.text(`Overdue Maintenance: ${reportData.summaryStats?.overdueMaintenance || 0}`, 20, yPosition);
          yPosition += 7;
          doc.text(`Due Soon: ${reportData.summaryStats?.dueSoon || 0}`, 20, yPosition);
          yPosition += 7;
          doc.text(`Up to Date: ${reportData.summaryStats?.upToDate || 0}`, 20, yPosition);
        }
        break;
    }

    doc.save(`${selectedReport}-report-${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Report exported to PDF');
  };

  const exportToExcel = () => {
    let worksheet;
    let workbook = XLSX.utils.book_new();

    switch (selectedReport) {
      case 'attendance':
        if (reportData.attendanceStats) {
          const data = reportData.attendanceStats.map(student => ({
            'Student Name': student.name,
            'Grade': student.grade,
            'Class': student.class,
            'Present Days': student.presentDays,
            'Total Days': student.totalDays,
            'Attendance Rate (%)': student.attendanceRate,
            'Last Attendance': student.lastAttendance
          }));
          worksheet = XLSX.utils.json_to_sheet(data);
        }
        break;

      case 'transport':
        if (reportData.vehicles) {
          const data = reportData.vehicles.map(vehicle => ({
            'Plate Number': vehicle.plate_number,
            'Make': vehicle.make,
            'Model': vehicle.model,
            'Year': vehicle.year,
            'Capacity': vehicle.capacity,
            'Status': vehicle.status,
            'Driver': vehicle.driver?.name || 'Unassigned'
          }));
          worksheet = XLSX.utils.json_to_sheet(data);
        }
        break;

      case 'driver':
        if (reportData.driverStats) {
          const data = reportData.driverStats.map(driver => ({
            'Driver Name': driver.name,
            'Email': driver.email,
            'Phone': driver.phone,
            'Total Trips': driver.totalTrips,
            'Completed Trips': driver.completedTrips,
            'Hours Worked': driver.totalHours,
            'Completion Rate (%)': Math.round(driver.completionRate)
          }));
          worksheet = XLSX.utils.json_to_sheet(data);
        }
        break;

      case 'financial':
        if (reportData.payments) {
          const data = reportData.payments.map(payment => ({
            'Transaction ID': payment.transaction_id,
            'Student': payment.student?.name || 'N/A',
            'Parent': payment.parent?.name || 'N/A',
            'Amount': payment.amount,
            'Currency': payment.currency,
            'Type': payment.type,
            'Method': payment.method,
            'Status': payment.status,
            'Date': payment.created_at
          }));
          worksheet = XLSX.utils.json_to_sheet(data);
        }
        break;

      case 'maintenance':
        if (reportData.maintenanceStats) {
          const data = reportData.maintenanceStats.map(vehicle => ({
            'Plate Number': vehicle.plate_number,
            'Make': vehicle.make,
            'Model': vehicle.model,
            'Driver': vehicle.driver?.name || 'Unassigned',
            'Last Service': vehicle.maintenance.lastService,
            'Next Service': vehicle.maintenance.nextService,
            'Days Since Service': vehicle.daysSinceService,
            'Days Until Next': vehicle.daysUntilNext,
            'Status': vehicle.status
          }));
          worksheet = XLSX.utils.json_to_sheet(data);
        }
        break;
    }

    if (worksheet) {
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
      XLSX.writeFile(workbook, `${selectedReport}-report-${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Report exported to Excel');
    }
  };

  const StatCard = ({ title, value, icon: Icon, color = "blue", trend }) => (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '+' : ''}{trend}% from last month
            </p>
          )}
        </div>
        <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
                <p className="text-gray-600 mt-1">Generate comprehensive reports and export data</p>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  onClick={generateReport}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button
                  onClick={exportToPDF}
                  disabled={loading || !reportData}
                  variant="outline"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                <Button
                  onClick={exportToExcel}
                  disabled={loading || !reportData}
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Excel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Date Range and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Grade Filter</label>
                <select
                  value={filters.grade}
                  onChange={(e) => setFilters({...filters, grade: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {reportTypes.map((report) => (
            <Card
              key={report.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedReport === report.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => setSelectedReport(report.id)}
            >
              <CardContent className="p-6 text-center">
                <div className={`w-12 h-12 bg-${report.color}-100 rounded-lg flex items-center justify-center mx-auto mb-3`}>
                  <report.icon className={`h-6 w-6 text-${report.color}-600`} />
                </div>
                <h3 className="font-medium text-gray-900">{report.name}</h3>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Report Content */}
        {loading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Generating report...</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Summary Stats */}
            {selectedReport === 'attendance' && reportData.overallStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  title="Total Students" 
                  value={reportData.overallStats.totalStudents} 
                  icon={Users} 
                  color="blue"
                />
                <StatCard 
                  title="Average Attendance" 
                  value={`${Math.round(reportData.overallStats.averageAttendance)}%`} 
                  icon={TrendingUp} 
                  color="green"
                />
                <StatCard 
                  title="Perfect Attendance" 
                  value={reportData.overallStats.perfectAttendance} 
                  icon={CheckCircle} 
                  color="purple"
                />
                <StatCard 
                  title="Low Attendance" 
                  value={reportData.overallStats.lowAttendance} 
                  icon={AlertCircle} 
                  color="red"
                />
              </div>
            )}

            {selectedReport === 'transport' && reportData.transportStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  title="Total Vehicles" 
                  value={reportData.transportStats.totalVehicles} 
                  icon={Bus} 
                  color="blue"
                />
                <StatCard 
                  title="Active Vehicles" 
                  value={reportData.transportStats.activeVehicles} 
                  icon={CheckCircle} 
                  color="green"
                />
                <StatCard 
                  title="Students with Transport" 
                  value={reportData.transportStats.studentsWithTransport} 
                  icon={Users} 
                  color="purple"
                />
                <StatCard 
                  title="Utilization Rate" 
                  value={`${Math.round(reportData.transportStats.utilizationRate)}%`} 
                  icon={TrendingUp} 
                  color="yellow"
                />
              </div>
            )}

            {selectedReport === 'driver' && reportData.driverStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  title="Total Drivers" 
                  value={reportData.driverStats.length} 
                  icon={Users} 
                  color="blue"
                />
                <StatCard 
                  title="Total Trips" 
                  value={reportData.driverStats.reduce((sum, d) => sum + d.totalTrips, 0)} 
                  icon={Bus} 
                  color="green"
                />
                <StatCard 
                  title="Completed Trips" 
                  value={reportData.driverStats.reduce((sum, d) => sum + d.completedTrips, 0)} 
                  icon={CheckCircle} 
                  color="purple"
                />
                <StatCard 
                  title="Total Hours" 
                  value={Math.round(reportData.driverStats.reduce((sum, d) => sum + d.totalHours, 0))} 
                  icon={Clock} 
                  color="yellow"
                />
              </div>
            )}

            {selectedReport === 'financial' && reportData.financialStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  title="Total Revenue" 
                  value={`$${reportData.financialStats.totalRevenue.toLocaleString()}`} 
                  icon={TrendingUp} 
                  color="green"
                />
                <StatCard 
                  title="Total Expenses" 
                  value={`$${reportData.financialStats.totalExpenses.toLocaleString()}`} 
                  icon={TrendingUp} 
                  color="red"
                />
                <StatCard 
                  title="Net Profit" 
                  value={`$${reportData.financialStats.netProfit.toLocaleString()}`} 
                  icon={BarChart3} 
                  color="blue"
                />
                <StatCard 
                  title="Completed Payments" 
                  value={reportData.financialStats.completedPayments} 
                  icon={CheckCircle} 
                  color="purple"
                />
              </div>
            )}

            {selectedReport === 'maintenance' && reportData.summaryStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  title="Total Vehicles" 
                  value={reportData.summaryStats.totalVehicles} 
                  icon={Bus} 
                  color="blue"
                />
                <StatCard 
                  title="Overdue Maintenance" 
                  value={reportData.summaryStats.overdueMaintenance} 
                  icon={AlertCircle} 
                  color="red"
                />
                <StatCard 
                  title="Due Soon" 
                  value={reportData.summaryStats.dueSoon} 
                  icon={Clock} 
                  color="yellow"
                />
                <StatCard 
                  title="Up to Date" 
                  value={reportData.summaryStats.upToDate} 
                  icon={CheckCircle} 
                  color="green"
                />
              </div>
            )}

            {/* Detailed Data Table */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {reportTypes.find(r => r.id === selectedReport)?.name} Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {selectedReport === 'attendance' && (
                          <>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Present Days</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance %</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Attendance</th>
                          </>
                        )}
                        {selectedReport === 'transport' && (
                          <>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Routes</th>
                          </>
                        )}
                        {selectedReport === 'driver' && (
                          <>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Trips</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours Worked</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion %</th>
                          </>
                        )}
                        {selectedReport === 'financial' && (
                          <>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          </>
                        )}
                        {selectedReport === 'maintenance' && (
                          <>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Service</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Service</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedReport === 'attendance' && reportData.attendanceStats?.map((student, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.grade}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.presentDays}/{student.totalDays}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.attendanceRate}%</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.lastAttendance}</td>
                        </tr>
                      ))}
                      {selectedReport === 'transport' && reportData.vehicles?.map((vehicle, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{vehicle.plate_number}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.driver?.name || 'Unassigned'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.capacity}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <Badge variant={vehicle.status === 'active' ? 'default' : 'secondary'}>
                              {vehicle.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.routes?.length || 0}</td>
                        </tr>
                      ))}
                      {selectedReport === 'driver' && reportData.driverStats?.map((driver, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{driver.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{driver.totalTrips}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{driver.completedTrips}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{driver.totalHours}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{Math.round(driver.completionRate)}%</td>
                        </tr>
                      ))}
                      {selectedReport === 'financial' && reportData.payments?.map((payment, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.transaction_id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.student?.name || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${payment.amount}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.type}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                              {payment.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(payment.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                      {selectedReport === 'maintenance' && reportData.maintenanceStats?.map((vehicle, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{vehicle.plate_number}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.driver?.name || 'Unassigned'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.maintenance.lastService}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.maintenance.nextService}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <Badge variant={vehicle.isOverdue ? 'destructive' : vehicle.daysUntilNext <= 7 ? 'secondary' : 'default'}>
                              {vehicle.status}
                            </Badge>
                          </td>
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
