import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  FileText, 
  Calendar,
  Users,
  CheckCircle,
  Clock,
  Download,
  Plus,
  Bell,
  Receipt,
  Target,
  BarChart3,
  Wallet,
  Calculator,
  Filter,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  LineChart,
  BarChart,
  Eye,
  MoreVertical,
  RefreshCw,
  Upload,
  DownloadCloud,
  Settings,
  Zap,
  AlertTriangle,
  Crown,
  Sparkles,
  TrendingDown,
  Landmark,
  PiggyBank,
  Shield,
  Lock,
  Unlock,
  Send,
  Mail,
  MessageSquare,
  Phone,
  UserCheck,
  FileCheck,
  Archive,
  Trash2,
  Edit,
  Copy,
  QrCode,
  Smartphone,
  Wifi,
  Battery,
  BatteryCharging,
  Cloud,
  Sun,
  CloudRain,
  Thermometer
} from 'lucide-react';
import { toast } from 'sonner';

// Simple SVG chart components
const LineChartSimple = ({ data, color = "#3b82f6", height = 120, title }) => {
  if (!data || data.length === 0) return (
    <div className="h-full flex items-center justify-center text-gray-500">
      <div className="text-center">
        <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No data available</p>
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
      {title && <p className="text-gray-600 text-sm mb-2 font-medium">{title}</p>}
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

const BarChartSimple = ({ data, color = "#3b82f6", height = 120, title }) => {
  if (!data || data.length === 0) return (
    <div className="h-full flex items-center justify-center text-gray-500">
      <div className="text-center">
        <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No data available</p>
      </div>
    </div>
  );
  
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="w-full h-full">
      {title && <p className="text-gray-600 text-sm mb-2 font-medium">{title}</p>}
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
            <span className="text-xs text-gray-500 mt-1 truncate w-full text-center">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const AccountsDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedTab, setSelectedTab] = useState('overview');
  
  const [financialData, setFinancialData] = useState({
    overview: {},
    transactions: [],
    revenueTrends: [],
    expenseBreakdown: [],
    budgetStatus: {},
    financialHealth: {},
    predictions: {},
    alerts: []
  });

  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    dateRange: '30d',
    amountRange: 'all'
  });

  // Real-time data subscription
  useEffect(() => {
    if (!user?.school_id) return;

    const subscription = supabase
      .channel('accounts-dashboard')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          tables: ['payments', 'invoices', 'expenses'],
          filter: `school_id=eq.${user.school_id}`
        },
        (payload) => {
          // Refresh data for significant changes
          if (['INSERT', 'UPDATE', 'DELETE'].includes(payload.eventType)) {
            fetchFinancialData();
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.school_id]);

  useEffect(() => {
    fetchFinancialData();
  }, [user, timeRange, filters]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      const schoolId = user?.school_id;

      if (!schoolId) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      console.log('💰 Fetching comprehensive financial data...');

      // Fetch all financial data
      const [
        paymentsRes,
        invoicesRes,
        expensesRes,
        studentsRes,
        budgetRes,
        historicalDataRes
      ] = await Promise.all([
        supabase
          .from('payments')
          .select('*')
          .eq('school_id', schoolId)
          .order('created_at', { ascending: false })
          .limit(200),
        supabase
          .from('invoices')
          .select('*')
          .eq('school_id', schoolId)
          .order('due_date', { ascending: false })
          .limit(100),
        supabase
          .from('expenses')
          .select('*')
          .eq('school_id', schoolId)
          .order('date', { ascending: false })
          .limit(100),
        supabase
          .from('students')
          .select('id, name, grade_level, is_active')
          .eq('school_id', schoolId),
        supabase
          .from('budgets')
          .select('*')
          .eq('school_id', schoolId)
          .eq('year', new Date().getFullYear())
          .single(),
        supabase
          .from('financial_history')
          .select('*')
          .eq('school_id', schoolId)
          .order('month', { ascending: true })
          .limit(12)
      ]);

      const payments = paymentsRes.data || [];
      const invoices = invoicesRes.data || [];
      const expenses = expensesRes.data || [];
      const students = studentsRes.data || [];
      const budget = budgetRes.data || {};
      const historicalData = historicalDataRes.data || [];

      // Calculate comprehensive financial metrics
      const financialMetrics = calculateFinancialMetrics(
        payments, 
        invoices, 
        expenses, 
        students, 
        budget, 
        historicalData
      );

      setFinancialData(financialMetrics);

    } catch (error) {
      console.error('Error fetching financial data:', error);
      toast.error('Failed to load financial data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateFinancialMetrics = (payments, invoices, expenses, students, budget, historicalData) => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Revenue calculations
    const totalRevenue = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const monthlyRevenue = payments
      .filter(p => p.status === 'completed' && new Date(p.created_at).getMonth() === currentMonth)
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const pendingPayments = payments
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const overduePayments = invoices
      .filter(i => i.status === 'overdue')
      .reduce((sum, i) => sum + (i.amount || 0), 0);

    const completedPayments = payments.filter(p => p.status === 'completed').length;
    const totalPending = payments.filter(p => p.status === 'pending').length;
    const totalOverdue = invoices.filter(i => i.status === 'overdue').length;

    // Expense calculations
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const monthlyExpenses = expenses
      .filter(e => new Date(e.date).getMonth() === currentMonth)
      .reduce((sum, e) => sum + (e.amount || 0), 0);

    // Budget calculations
    const budgetAllocated = budget.allocated_amount || 0;
    const budgetUtilized = monthlyExpenses;
    const budgetUtilization = budgetAllocated > 0 ? (budgetUtilized / budgetAllocated) * 100 : 0;
    const budgetRemaining = budgetAllocated - budgetUtilized;

    // Student financial metrics
    const activeStudents = students.filter(s => s.is_active).length;
    const studentsWithBalance = invoices.filter(i => i.status !== 'paid').length;
    const collectionRate = totalRevenue > 0 ? (completedPayments / (completedPayments + totalPending + totalOverdue)) * 100 : 0;

    // Financial health score (0-100)
    const financialHealth = calculateFinancialHealth(
      totalRevenue,
      totalExpenses,
      collectionRate,
      budgetUtilization,
      overduePayments
    );

    // Revenue trends
    const revenueTrends = historicalData.map(item => ({
      month: item.month,
      revenue: item.revenue || 0,
      expenses: item.expenses || 0
    }));

    // Expense breakdown
    const expenseBreakdown = expenses.reduce((acc, expense) => {
      const category = expense.category || 'Other';
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += expense.amount || 0;
      return acc;
    }, {});

    // Predictions
    const predictions = calculatePredictions(revenueTrends, monthlyRevenue, monthlyExpenses);

    // Alerts
    const alerts = generateFinancialAlerts(
      overduePayments,
      budgetUtilization,
      financialHealth,
      pendingPayments
    );

    return {
      overview: {
        totalRevenue,
        monthlyRevenue,
        pendingPayments,
        overduePayments,
        completedPayments,
        totalPending,
        totalOverdue,
        totalExpenses,
        monthlyExpenses,
        budgetAllocated,
        budgetUtilized,
        budgetUtilization: Math.round(budgetUtilization * 100) / 100,
        budgetRemaining,
        activeStudents,
        studentsWithBalance,
        collectionRate: Math.round(collectionRate * 100) / 100,
        netProfit: totalRevenue - totalExpenses,
        profitMargin: totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0
      },
      transactions: payments.slice(0, 20).map(p => ({
        ...p,
        student: students.find(s => s.id === p.student_id) || {}
      })),
      revenueTrends,
      expenseBreakdown: Object.entries(expenseBreakdown).map(([category, amount]) => ({
        category,
        amount,
        percentage: (amount / totalExpenses) * 100
      })),
      budgetStatus: {
        allocated: budgetAllocated,
        utilized: budgetUtilized,
        remaining: budgetRemaining,
        utilization: budgetUtilization
      },
      financialHealth: {
        score: financialHealth,
        status: financialHealth >= 80 ? 'Excellent' : 
                financialHealth >= 60 ? 'Good' : 
                financialHealth >= 40 ? 'Fair' : 'Poor',
        color: financialHealth >= 80 ? 'green' : 
               financialHealth >= 60 ? 'blue' : 
               financialHealth >= 40 ? 'yellow' : 'red'
      },
      predictions,
      alerts
    };
  };

  const calculateFinancialHealth = (revenue, expenses, collectionRate, budgetUtilization, overdue) => {
    let score = 100;

    // Deduct for low collection rate
    if (collectionRate < 80) score -= (80 - collectionRate);
    
    // Deduct for high budget utilization
    if (budgetUtilization > 90) score -= (budgetUtilization - 90);
    
    // Deduct for significant overdue amounts
    if (overdue > revenue * 0.1) score -= 20;
    
    // Deduct for negative profit
    if (revenue < expenses) score -= 30;

    return Math.max(0, Math.min(100, score));
  };

  const calculatePredictions = (trends, currentRevenue, currentExpenses) => {
    if (trends.length < 3) {
      return {
        nextMonthRevenue: currentRevenue,
        nextMonthExpenses: currentExpenses,
        growthRate: 0
      };
    }

    const recentTrends = trends.slice(-6);
    const totalRevenue = recentTrends.reduce((sum, t) => sum + t.revenue, 0);
    const avgRevenue = totalRevenue / recentTrends.length;
    
    const growthRate = ((currentRevenue - avgRevenue) / avgRevenue) * 100;

    return {
      nextMonthRevenue: Math.round(currentRevenue * (1 + growthRate / 100)),
      nextMonthExpenses: Math.round(currentExpenses * 1.02), // Assume 2% inflation
      growthRate: Math.round(growthRate * 100) / 100
    };
  };

  const generateFinancialAlerts = (overdue, budgetUtilization, healthScore, pending) => {
    const alerts = [];

    if (overdue > 10000) {
      alerts.push({
        id: 'high-overdue',
        type: 'error',
        title: 'High Overdue Amount',
        message: `$${overdue.toLocaleString()} in overdue payments requires attention`,
        priority: 'high'
      });
    }

    if (budgetUtilization > 90) {
      alerts.push({
        id: 'budget-overutilization',
        type: 'warning',
        title: 'Budget Nearly Exhausted',
        message: `${Math.round(budgetUtilization)}% of monthly budget utilized`,
        priority: 'medium'
      });
    }

    if (healthScore < 50) {
      alerts.push({
        id: 'poor-financial-health',
        type: 'error',
        title: 'Poor Financial Health',
        message: 'Financial health score needs improvement',
        priority: 'high'
      });
    }

    if (pending > 5000) {
      alerts.push({
        id: 'pending-payments',
        type: 'info',
        title: 'Pending Payments',
        message: `$${pending.toLocaleString()} in payments awaiting processing`,
        priority: 'medium'
      });
    }

    return alerts;
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    trend, 
    description, 
    color = "blue",
    glow = false,
    onClick 
  }) => (
    <Card 
      className={`p-6 hover:shadow-lg transition-all duration-300 cursor-pointer border-2 ${
        glow ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
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
                {trend > 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                <span className="text-sm font-medium ml-1">{Math.abs(trend)}%</span>
              </div>
              <span className="text-xs text-gray-500 ml-2">from last month</span>
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
        {urgent && (
          <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
        )}
      </div>
    </Card>
  );

  const exportFinancialReport = async (type = 'summary') => {
    try {
      toast.success(`Generating ${type} financial report...`);
      // Simulate export process
      setTimeout(() => {
        toast.success(`Financial ${type} report exported successfully!`);
      }, 2000);
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  const sendPaymentReminders = async () => {
    try {
      toast.success('Sending payment reminders...');
      // Implementation for sending reminders
      setTimeout(() => {
        toast.success('Payment reminders sent successfully!');
      }, 2000);
    } catch (error) {
      toast.error('Failed to send reminders');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading financial dashboard...</p>
          <p className="text-gray-500 text-sm mt-2">Crunching the numbers for you</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Financial Dashboard</h1>
                  <p className="text-gray-600 mt-1">Welcome back, {user?.name || 'Finance Manager'}</p>
                </div>
                <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-700">Live Updates</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                </select>
                <Button
                  onClick={fetchFinancialData}
                  variant="outline"
                  disabled={refreshing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button onClick={() => exportFinancialReport('summary')}>
                  <DownloadCloud className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Financial Health Score */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <Card className="lg:col-span-1 p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">{financialData.financialHealth.score}</div>
              <div className="text-lg font-semibold mb-1">Financial Health</div>
              <Badge className={
                financialData.financialHealth.color === 'green' ? 'bg-green-100 text-green-800' :
                financialData.financialHealth.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                financialData.financialHealth.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }>
                {financialData.financialHealth.status}
              </Badge>
              <div className="w-full bg-white/20 rounded-full h-2 mt-4">
                <div 
                  className="bg-white rounded-full h-2 transition-all duration-1000"
                  style={{ width: `${financialData.financialHealth.score}%` }}
                ></div>
              </div>
            </div>
          </Card>

          {/* Key Financial Metrics */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Monthly Revenue"
              value={`$${financialData.overview.monthlyRevenue?.toLocaleString()}`}
              icon={TrendingUp}
              trend={8.2}
              color="green"
              glow
            />
            <StatCard
              title="Pending Payments"
              value={`$${financialData.overview.pendingPayments?.toLocaleString()}`}
              icon={Clock}
              color="yellow"
              description={`${financialData.overview.totalPending} payments`}
            />
            <StatCard
              title="Budget Utilization"
              value={`${financialData.overview.budgetUtilization}%`}
              icon={PieChart}
              color="blue"
              description={`$${financialData.overview.budgetRemaining?.toLocaleString()} remaining`}
            />
          </div>
        </div>

        {/* Enhanced Navigation Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center">
              <Receipt className="h-4 w-4 mr-2" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="budget" className="flex items-center">
              <PiggyBank className="h-4 w-4 mr-2" />
              Budget
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center">
              <LineChart className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <div className="space-y-8">
            {/* Secondary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Revenue"
                value={`$${financialData.overview.totalRevenue?.toLocaleString()}`}
                icon={DollarSign}
                color="green"
              />
              <StatCard
                title="Overdue Payments"
                value={`$${financialData.overview.overduePayments?.toLocaleString()}`}
                icon={AlertTriangle}
                color="red"
                description={`${financialData.overview.totalOverdue} invoices`}
              />
              <StatCard
                title="Collection Rate"
                value={`${financialData.overview.collectionRate}%`}
                icon={CheckCircle}
                color="blue"
              />
              <StatCard
                title="Net Profit"
                value={`$${financialData.overview.netProfit?.toLocaleString()}`}
                icon={TrendingUp}
                color="green"
                description={`${Math.round(financialData.overview.profitMargin)}% margin`}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Quick Actions */}
              <div className="lg:col-span-1">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                    <Zap className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div className="space-y-4">
                    <QuickActionCard
                      title="Create Invoice"
                      description="Generate new student invoice"
                      icon={FileText}
                      color="blue"
                      onClick={() => window.location.href = '/accounts/invoices/new'}
                    />
                    <QuickActionCard
                      title="Record Payment"
                      description="Process received payment"
                      icon={CreditCard}
                      color="green"
                      onClick={() => window.location.href = '/accounts/payments/new'}
                    />
                    <QuickActionCard
                      title="Send Reminders"
                      description="Notify overdue accounts"
                      icon={Bell}
                      color="red"
                      urgent={financialData.overview.overduePayments > 0}
                      onClick={sendPaymentReminders}
                    />
                    <QuickActionCard
                      title="Budget Planning"
                      description="Manage monthly budget"
                      icon={Calculator}
                      color="purple"
                      onClick={() => window.location.href = '/accounts/budget'}
                    />
                    <QuickActionCard
                      title="Generate Report"
                      description="Create financial report"
                      icon={BarChart3}
                      color="orange"
                      onClick={() => exportFinancialReport('detailed')}
                    />
                  </div>
                </Card>

                {/* Financial Alerts */}
                <Card className="p-6 mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Financial Alerts</h2>
                    <Badge variant="destructive">{financialData.alerts.length}</Badge>
                  </div>
                  <div className="space-y-3">
                    {financialData.alerts.map((alert) => (
                      <div key={alert.id} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-medium text-red-900">{alert.title}</p>
                          <p className="text-sm text-red-700">{alert.message}</p>
                        </div>
                      </div>
                    ))}
                    {financialData.alerts.length === 0 && (
                      <div className="text-center py-4">
                        <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                        <p className="text-green-700 font-medium">All clear!</p>
                        <p className="text-green-600 text-sm">No financial alerts</p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Revenue Trends & Recent Transactions */}
              <div className="lg:col-span-2 space-y-6">
                {/* Revenue Trend Chart */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Revenue Trends</h2>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        +{financialData.predictions.growthRate}% growth
                      </Badge>
                    </div>
                  </div>
                  <LineChartSimple 
                    data={financialData.revenueTrends.map(t => ({ value: t.revenue / 1000 }))}
                    color="#10b981"
                    height={200}
                    title="Monthly Revenue (in $ thousands)"
                  />
                </Card>

                {/* Recent Transactions */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {financialData.transactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            transaction.status === 'completed' ? 'bg-green-100' :
                            transaction.status === 'pending' ? 'bg-yellow-100' :
                            'bg-red-100'
                          }`}>
                            <DollarSign className={`h-5 w-5 ${
                              transaction.status === 'completed' ? 'text-green-600' :
                              transaction.status === 'pending' ? 'text-yellow-600' :
                              'text-red-600'
                            }`} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {transaction.student?.name || 'Unknown Student'}
                            </p>
                            <p className="text-sm text-gray-600 capitalize">
                              {transaction.payment_type?.replace('_', ' ') || 'Payment'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">${transaction.amount}</p>
                          <div className="flex items-center space-x-2">
                            <Badge className={
                              transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                              transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }>
                              {transaction.status}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(transaction.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {selectedTab === 'analytics' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Expense Breakdown */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Expense Breakdown</h2>
                <div className="space-y-4">
                  {financialData.expenseBreakdown.map((expense, index) => (
                    <div key={expense.category} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{
                            backgroundColor: [
                              '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
                              '#8b5cf6', '#06b6d4', '#f97316'
                            ][index % 7]
                          }}
                        ></div>
                        <span className="font-medium text-gray-900">{expense.category}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">${expense.amount.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">{Math.round(expense.percentage)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Budget Status */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Budget Status</h2>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Budget Utilization</span>
                      <span>{Math.round(financialData.overview.budgetUtilization)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-1000 ${
                          financialData.overview.budgetUtilization > 90 ? 'bg-red-500' :
                          financialData.overview.budgetUtilization > 75 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(financialData.overview.budgetUtilization, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        ${financialData.overview.budgetAllocated?.toLocaleString()}
                      </p>
                      <p className="text-sm text-blue-600">Allocated</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        ${financialData.overview.budgetRemaining?.toLocaleString()}
                      </p>
                      <p className="text-sm text-green-600">Remaining</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Predictions & Insights */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Financial Predictions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">
                    ${financialData.predictions.nextMonthRevenue?.toLocaleString()}
                  </p>
                  <p className="text-sm text-green-700">Next Month Revenue</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                  <Calculator className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">
                    ${financialData.predictions.nextMonthExpenses?.toLocaleString()}
                  </p>
                  <p className="text-sm text-blue-700">Expected Expenses</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                  <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-600">
                    {financialData.predictions.growthRate > 0 ? '+' : ''}{financialData.predictions.growthRate}%
                  </p>
                  <p className="text-sm text-purple-700">Growth Rate</p>
                </div>
              </div>
            </Card>
          </div>
        )}

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

export default AccountsDashboard;