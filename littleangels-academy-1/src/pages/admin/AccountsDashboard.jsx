// src/pages/admin/AccountsDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { 
  DollarSign,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Filter,
  Search,
  Plus,
  Edit,
  Eye,
  MoreVertical,
  Calendar,
  BarChart3,
  PieChart,
  FileText,
  RefreshCw,
  Upload,
  DownloadCloud,
  Bell,
  AlertTriangle,
  Target,
  Wallet,
  Banknote,
  Receipt,
  Calculator,
  Shield,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Table } from '../../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import DashboardHeader from '../../components/DashboardHeader';
import { toast } from 'sonner';

const AccountsDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('30d');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // State for data
  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingPayments: 0,
    collectedPayments: 0,
    overduePayments: 0,
    collectionRate: 0,
    averagePayment: 0,
    revenueGrowth: 0,
    studentsWithBalance: 0,
    totalStudents: 0
  });

  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [financialTrends, setFinancialTrends] = useState([]);
  const [revenueByGrade, setRevenueByGrade] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [alerts, setAlerts] = useState([]);

  // Demo data for development
  const createDemoData = () => {
    console.log('💰 Creating demo accounts data');
    
    const demoPayments = [
      {
        id: 'pay-1',
        student_id: 'LAS-001',
        student_name: 'John Mwangi',
        grade: 'Grade 3',
        amount: 15000,
        type: 'tuition',
        status: 'completed',
        due_date: '2024-01-15',
        paid_date: '2024-01-10',
        method: 'mpesa',
        reference: 'MPE234567890',
        created_at: new Date('2024-01-10').toISOString(),
        school_id: user?.school_id || 'demo-school',
        _isDemo: true
      },
      {
        id: 'pay-2',
        student_id: 'LAS-002',
        student_name: 'Sarah Wanjiku',
        grade: 'Grade 2',
        amount: 15000,
        type: 'tuition',
        status: 'pending',
        due_date: '2024-01-15',
        paid_date: null,
        method: '',
        reference: '',
        created_at: new Date('2024-01-08').toISOString(),
        school_id: user?.school_id || 'demo-school',
        _isDemo: true
      },
      {
        id: 'pay-3',
        student_id: 'LAS-003',
        student_name: 'David Ochieng',
        grade: 'Grade 4',
        amount: 12000,
        type: 'transport',
        status: 'completed',
        due_date: '2024-01-10',
        paid_date: '2024-01-05',
        method: 'bank',
        reference: 'BNK987654321',
        created_at: new Date('2024-01-05').toISOString(),
        school_id: user?.school_id || 'demo-school',
        _isDemo: true
      },
      {
        id: 'pay-4',
        student_id: 'LAS-004',
        student_name: 'Grace Akinyi',
        grade: 'Grade 5',
        amount: 18000,
        type: 'tuition',
        status: 'overdue',
        due_date: '2023-12-20',
        paid_date: null,
        method: '',
        reference: '',
        created_at: new Date('2023-12-01').toISOString(),
        school_id: user?.school_id || 'demo-school',
        _isDemo: true
      }
    ];

    const demoInvoices = [
      {
        id: 'inv-1',
        invoice_number: 'INV-2024-001',
        student_id: 'LAS-001',
        student_name: 'John Mwangi',
        amount: 15000,
        items: [
          { description: 'Term 1 Tuition', amount: 12000 },
          { description: 'Transport Fee', amount: 3000 }
        ],
        status: 'paid',
        due_date: '2024-01-15',
        created_at: new Date('2024-01-01').toISOString(),
        _isDemo: true
      },
      {
        id: 'inv-2',
        invoice_number: 'INV-2024-002',
        student_id: 'LAS-002',
        student_name: 'Sarah Wanjiku',
        amount: 15000,
        items: [
          { description: 'Term 1 Tuition', amount: 15000 }
        ],
        status: 'pending',
        due_date: '2024-01-15',
        created_at: new Date('2024-01-01').toISOString(),
        _isDemo: true
      }
    ];

    const demoFinancialTrends = [
      { month: 'Sep 2023', revenue: 450000, expenses: 320000, profit: 130000 },
      { month: 'Oct 2023', revenue: 520000, expenses: 350000, profit: 170000 },
      { month: 'Nov 2023', revenue: 480000, expenses: 340000, profit: 140000 },
      { month: 'Dec 2023', revenue: 380000, expenses: 320000, profit: 60000 },
      { month: 'Jan 2024', revenue: 550000, expenses: 360000, profit: 190000 }
    ];

    const demoRevenueByGrade = [
      { grade: 'PP1', revenue: 120000, students: 15 },
      { grade: 'PP2', revenue: 135000, students: 18 },
      { grade: 'Grade 1', revenue: 110000, students: 16 },
      { grade: 'Grade 2', revenue: 95000, students: 14 },
      { grade: 'Grade 3', revenue: 105000, students: 15 },
      { grade: 'Grade 4', revenue: 115000, students: 17 },
      { grade: 'Grade 5', revenue: 125000, students: 19 },
      { grade: 'Grade 6', revenue: 130000, students: 20 }
    ];

    setPayments(demoPayments);
    setInvoices(demoInvoices);
    setFinancialTrends(demoFinancialTrends);
    setRevenueByGrade(demoRevenueByGrade);
    calculateStats(demoPayments, demoInvoices, demoFinancialTrends);
    setLoading(false);
  };

  const calculateStats = (paymentsData, invoicesData, trendsData) => {
    const totalRevenue = paymentsData
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);

    const monthlyRevenue = trendsData[trendsData.length - 1]?.revenue || 0;
    const previousMonthlyRevenue = trendsData[trendsData.length - 2]?.revenue || 0;
    const revenueGrowth = previousMonthlyRevenue > 0 
      ? ((monthlyRevenue - previousMonthlyRevenue) / previousMonthlyRevenue) * 100 
      : 0;

    const pendingPayments = paymentsData.filter(p => p.status === 'pending').length;
    const collectedPayments = paymentsData.filter(p => p.status === 'completed').length;
    const overduePayments = paymentsData.filter(p => p.status === 'overdue').length;

    const totalPayments = paymentsData.length;
    const collectionRate = totalPayments > 0 ? (collectedPayments / totalPayments) * 100 : 0;

    const completedPayments = paymentsData.filter(p => p.status === 'completed');
    const averagePayment = completedPayments.length > 0 
      ? completedPayments.reduce((sum, p) => sum + p.amount, 0) / completedPayments.length 
      : 0;

    setStats({
      totalRevenue,
      monthlyRevenue,
      pendingPayments,
      collectedPayments,
      overduePayments,
      collectionRate: Math.round(collectionRate),
      averagePayment: Math.round(averagePayment),
      revenueGrowth: Math.round(revenueGrowth * 100) / 100,
      studentsWithBalance: invoicesData.filter(i => i.status !== 'paid').length,
      totalStudents: 120 // This would come from actual student count
    });
  };

  useEffect(() => {
    if (user) {
      fetchAccountsData();
    }
  }, [user, timeRange]);

  const fetchAccountsData = async () => {
    try {
      setLoading(true);
      console.log('💰 Fetching accounts data for school:', user?.school_id);

      // Try to fetch from database
      const [paymentsRes, invoicesRes] = await Promise.all([
        supabase
          .from('payments')
          .select('*')
          .eq('school_id', user?.school_id)
          .order('created_at', { ascending: false }),
        
        supabase
          .from('invoices')
          .select('*')
          .eq('school_id', user?.school_id)
          .order('created_at', { ascending: false })
      ]);

      if (paymentsRes.error || invoicesRes.error) {
        console.log('📋 Accounts tables might not exist, using demo data');
        createDemoData();
        return;
      }

      console.log(`✅ Fetched ${paymentsRes.data?.length || 0} payments, ${invoicesRes.data?.length || 0} invoices`);
      setPayments(paymentsRes.data || []);
      setInvoices(invoicesRes.data || []);
      
      // Calculate stats from real data
      calculateStats(paymentsRes.data || [], invoicesRes.data || [], []);

    } catch (error) {
      console.error('❌ Error fetching accounts data:', error);
      createDemoData();
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchAccountsData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const generateInvoice = async (studentId) => {
    try {
      toast.success('Generating invoice...');
      // Simulate API call
      setTimeout(() => {
        toast.success('Invoice generated successfully!');
      }, 1500);
    } catch (error) {
      toast.error('Failed to generate invoice');
    }
  };

  const processPayment = async (paymentId) => {
    try {
      toast.success('Processing payment...');
      // Simulate API call
      setTimeout(() => {
        toast.success('Payment processed successfully!');
        refreshData();
      }, 1500);
    } catch (error) {
      toast.error('Failed to process payment');
    }
  };

  const exportFinancialReport = async () => {
    try {
      toast.success('Preparing financial report...');
      // Simulate export process
      setTimeout(() => {
        toast.success('Financial report exported successfully!');
      }, 2000);
    } catch (error) {
      toast.error('Failed to export financial report');
    }
  };

  const sendReminder = async (studentId) => {
    try {
      toast.success('Sending payment reminder...');
      // Simulate API call
      setTimeout(() => {
        toast.success('Reminder sent successfully!');
      }, 1500);
    } catch (error) {
      toast.error('Failed to send reminder');
    }
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color = "blue", trend, onClick }) => (
    <Card 
      className={`p-6 hover:shadow-lg transition-all duration-200 cursor-pointer border-0 shadow-md ${
        onClick ? 'hover:scale-105' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
          {trend && (
            <div className={`inline-flex items-center text-sm mt-1 ${
              trend > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend > 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          color === 'blue' ? 'bg-blue-100' :
          color === 'green' ? 'bg-green-100' :
          color === 'red' ? 'bg-red-100' :
          color === 'purple' ? 'bg-purple-100' : 'bg-yellow-100'
        }`}>
          <Icon className={`h-6 w-6 ${
            color === 'blue' ? 'text-blue-600' :
            color === 'green' ? 'text-green-600' :
            color === 'red' ? 'text-red-600' :
            color === 'purple' ? 'text-purple-600' : 'text-yellow-600'
          }`} />
        </div>
      </div>
    </Card>
  );

  const PaymentStatusBadge = ({ status }) => {
    const statusConfig = {
      completed: { label: 'Paid', color: 'green', icon: CheckCircle },
      pending: { label: 'Pending', color: 'yellow', icon: Clock },
      overdue: { label: 'Overdue', color: 'red', icon: AlertTriangle }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <Badge 
        variant="outline" 
        className={`inline-flex items-center ${
          config.color === 'green' ? 'bg-green-50 text-green-700 border-green-200' :
          config.color === 'yellow' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
          'bg-red-50 text-red-700 border-red-200'
        }`}
      >
        <IconComponent className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.reference?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    const matchesType = filterType === 'all' || payment.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Simple chart components
  const RevenueTrendChart = () => (
    <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-900">Revenue Trend</h4>
        <span className="text-sm text-gray-600">Last 6 months</span>
      </div>
      <div className="flex items-end justify-between h-32 px-4">
        {financialTrends.map((month, index) => (
          <div key={month.month} className="flex flex-col items-center flex-1">
            <div
              className="w-8 bg-gradient-to-t from-blue-500 to-blue-600 rounded-t transition-all duration-500"
              style={{ height: `${(month.revenue / 600000) * 100}%` }}
            />
            <span className="text-xs text-gray-600 mt-2">{month.month.split(' ')[0]}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const RevenueByGradeChart = () => (
    <div className="w-full h-48 bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-900">Revenue by Grade</h4>
        <span className="text-sm text-gray-600">This month</span>
      </div>
      <div className="flex items-end justify-between h-32 px-4">
        {revenueByGrade.map((grade, index) => (
          <div key={grade.grade} className="flex flex-col items-center flex-1">
            <div
              className="w-6 bg-gradient-to-t from-green-500 to-green-600 rounded-t transition-all duration-500"
              style={{ height: `${(grade.revenue / 150000) * 100}%` }}
            />
            <span className="text-xs text-gray-600 mt-2">{grade.grade}</span>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading financial data...</p>
          <p className="text-gray-400 text-sm mt-2">Setting up your accounts dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <DashboardHeader 
        title="Accounts & Finance" 
        subtitle="Manage payments, invoices, and financial reporting"
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions and Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            
            <Button
              onClick={refreshData}
              variant="outline"
              disabled={refreshing}
              className="border-gray-300 hover:bg-gray-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              onClick={exportFinancialReport}
              variant="outline"
              className="border-gray-300 hover:bg-gray-50"
            >
              <DownloadCloud className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button
              onClick={() => generateInvoice()}
              className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25"
            >
              <Plus className="h-4 w-4 mr-2" />
              Generate Invoice
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Revenue"
            value={`KSh ${stats.totalRevenue.toLocaleString()}`}
            subtitle="All time collected"
            icon={DollarSign}
            color="green"
            trend={stats.revenueGrowth}
          />
          <StatCard
            title="Monthly Revenue"
            value={`KSh ${stats.monthlyRevenue.toLocaleString()}`}
            subtitle="Current month"
            icon={TrendingUp}
            color="blue"
          />
          <StatCard
            title="Collection Rate"
            value={`${stats.collectionRate}%`}
            subtitle="Payment efficiency"
            icon={Target}
            color="purple"
          />
          <StatCard
            title="Pending Payments"
            value={stats.pendingPayments}
            subtitle="Awaiting processing"
            icon={Clock}
            color="yellow"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Collected Payments"
            value={stats.collectedPayments}
            subtitle="Successfully processed"
            icon={CheckCircle}
            color="green"
          />
          <StatCard
            title="Overdue Payments"
            value={stats.overduePayments}
            subtitle="Past due date"
            icon={AlertTriangle}
            color="red"
          />
          <StatCard
            title="Average Payment"
            value={`KSh ${stats.averagePayment.toLocaleString()}`}
            subtitle="Per transaction"
            icon={Calculator}
            color="blue"
          />
          <StatCard
            title="Students with Balance"
            value={stats.studentsWithBalance}
            subtitle={`of ${stats.totalStudents} total`}
            icon={Users}
            color="purple"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Charts */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                    Financial Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RevenueTrendChart />
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2 text-green-600" />
                    Revenue Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RevenueByGradeChart />
                </CardContent>
              </Card>
            </div>

            {/* Recent Transactions & Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Transactions */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-gray-600" />
                      Recent Transactions
                    </div>
                    <Badge variant="secondary">{recentTransactions.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {payments.slice(0, 5).map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            payment.status === 'completed' ? 'bg-green-100' :
                            payment.status === 'pending' ? 'bg-yellow-100' : 'bg-red-100'
                          }`}>
                            <DollarSign className={`h-5 w-5 ${
                              payment.status === 'completed' ? 'text-green-600' :
                              payment.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                            }`} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{payment.student_name}</p>
                            <p className="text-sm text-gray-500">{payment.type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">KSh {payment.amount.toLocaleString()}</p>
                          <PaymentStatusBadge status={payment.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Financial Alerts */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Bell className="h-5 w-5 mr-2 text-red-600" />
                      Financial Alerts
                    </div>
                    <Badge variant="destructive">{stats.overduePayments}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {payments.filter(p => p.status === 'overdue').slice(0, 5).map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center space-x-3">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                          <div>
                            <p className="font-medium text-gray-900">{payment.student_name}</p>
                            <p className="text-sm text-gray-500">Due: {new Date(payment.due_date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => sendReminder(payment.student_id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Remind
                        </Button>
                      </div>
                    ))}
                    {stats.overduePayments === 0 && (
                      <div className="text-center py-8">
                        <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                        <p className="text-gray-600">No overdue payments</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            {/* Filters */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search payments by student name or reference..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-gray-300 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="overdue">Overdue</option>
                  </select>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="all">All Types</option>
                    <option value="tuition">Tuition</option>
                    <option value="transport">Transport</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Payments Table */}
            <Card className="border-0 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold">Payment Records</CardTitle>
                  <Badge variant="secondary" className="text-sm">
                    {filteredPayments.length} payments
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Due Date
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredPayments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-semibold text-gray-900">{payment.student_name}</div>
                              <div className="text-sm text-gray-500">Grade {payment.grade}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">
                              KSh {payment.amount.toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 capitalize">{payment.type}</div>
                            {payment.method && (
                              <div className="text-sm text-gray-500 capitalize">{payment.method}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(payment.due_date).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <PaymentStatusBadge status={payment.status} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              {payment.status === 'pending' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => processPayment(payment.id)}
                                  className="text-green-600 hover:text-green-800 hover:bg-green-50"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}
                              {payment.status === 'overdue' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => sendReminder(payment.student_id)}
                                  className="text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50"
                                >
                                  <Bell className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {filteredPayments.length === 0 && (
                    <div className="text-center py-12">
                      <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
                      <p className="text-gray-500">
                        {searchTerm || filterStatus !== 'all' || filterType !== 'all' 
                          ? 'Try adjusting your search or filters'
                          : 'No payment records available'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-6">
            {/* Invoices Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInvoices.map((invoice) => (
                <Card key={invoice.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{invoice.invoice_number}</CardTitle>
                      <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                        {invoice.status === 'paid' ? 'Paid' : 'Pending'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{invoice.student_name}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {invoice.items?.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-600">{item.description}</span>
                          <span className="font-medium">KSh {item.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center font-semibold">
                        <span>Total</span>
                        <span className="text-lg">KSh {invoice.amount.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Due: {new Date(invoice.due_date).toLocaleDateString()}</span>
                      <span>Created: {new Date(invoice.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex space-x-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button size="sm" className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Financial Summary Report */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Financial Summary</h3>
                      <p className="text-sm text-gray-600">Monthly revenue & expenses</p>
                    </div>
                  </div>
                  <Button className="w-full mt-4" onClick={exportFinancialReport}>
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              {/* Collection Report */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <Target className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Collection Report</h3>
                      <p className="text-sm text-gray-600">Payment collection analysis</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              {/* Student Balance Report */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Student Balances</h3>
                      <p className="text-sm text-gray-600">Outstanding payments report</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AccountsDashboard;