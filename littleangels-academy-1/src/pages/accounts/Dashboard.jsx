// src/pages/accounts/AccountsDashboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
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
  EyeOff,
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
  ChevronUp,
  Settings,
  Lock,
  Unlock,
  Send,
  UserCheck,
  FileCheck,
  ReceiptText,
  Landmark,
  ChartBar,
  FileSearch,
  Percent,
  CalendarDays,
  UserCog,
  Building,
  Coins,
  WalletCards
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
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
  const [showStats, setShowStats] = useState(true);

  // State for comprehensive financial data
  const [financialStats, setFinancialStats] = useState({
    // Real vs Expected
    totalRevenue: { real: 0, expected: 0, visible: true },
    monthlyRevenue: { real: 0, expected: 0, visible: true },
    pendingPayments: { real: 0, expected: 0, visible: true },
    collectedPayments: { real: 0, expected: 0, visible: true },
    overduePayments: { real: 0, expected: 0, visible: true },
    collectionRate: { real: 0, expected: 85, visible: true },
    averagePayment: { real: 0, expected: 0, visible: true },
    revenueGrowth: { real: 0, expected: 10, visible: true },
    studentsWithBalance: { real: 0, expected: 0, visible: true },
    totalStudents: { real: 0, expected: 0, visible: true },
    
    // Additional financial metrics
    accountsReceivable: 0,
    cashFlow: 0,
    expenseRatio: 0,
    profitMargin: 0,
    feeDefaults: 0,
    totalExpenses: 0,
    netProfit: 0
  });

  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [feeStructure, setFeeStructure] = useState([]);
  const [financialTrends, setFinancialTrends] = useState([]);
  const [revenueByGrade, setRevenueByGrade] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [students, setStudents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [expenses, setExpenses] = useState([]);

  // Form states
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const [feeForm, setFeeForm] = useState({
    grade: '',
    term: '',
    tuition_fee: 0,
    transport_fee: 0,
    activity_fee: 0,
    exam_fee: 0,
    other_fees: 0,
    effective_date: '',
    notes: ''
  });

  const [paymentForm, setPaymentForm] = useState({
    student_id: '',
    invoice_id: '',
    amount: 0,
    payment_method: 'mpesa',
    transaction_id: '',
    notes: '',
    receipt_number: '',
    payment_date: new Date().toISOString().split('T')[0]
  });

  const [requestForm, setRequestForm] = useState({
    type: 'fee_change',
    title: '',
    description: '',
    priority: 'medium',
    requested_changes: {}
  });

  const [expenseForm, setExpenseForm] = useState({
    category: 'operational',
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    payment_method: 'bank',
    reference: '',
    notes: ''
  });

  const grades = ['PP1', 'PP2', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8'];
  const terms = ['Term 1', 'Term 2', 'Term 3'];
  const paymentMethodsList = [
    { value: 'mpesa', label: 'M-Pesa', color: 'green' },
    { value: 'bank', label: 'Bank Transfer', color: 'blue' },
    { value: 'cash', label: 'Cash', color: 'yellow' },
    { value: 'cheque', label: 'Cheque', color: 'purple' },
    { value: 'card', label: 'Card', color: 'indigo' }
  ];

  const expenseCategories = [
    { value: 'salaries', label: 'Salaries', color: 'blue' },
    { value: 'transport', label: 'Transport', color: 'green' },
    { value: 'maintenance', label: 'Maintenance', color: 'orange' },
    { value: 'utilities', label: 'Utilities', color: 'purple' },
    { value: 'supplies', label: 'Supplies', color: 'red' },
    { value: 'operational', label: 'Operational', color: 'gray' }
  ];

  const requestTypes = [
    { value: 'fee_change', label: 'Fee Structure Change', icon: DollarSign },
    { value: 'payment_approval', label: 'Payment Approval', icon: CreditCard },
    { value: 'refund_request', label: 'Refund Request', icon: Receipt },
    { value: 'waiver_request', label: 'Fee Waiver', icon: Shield }
  ];

  useEffect(() => {
    if (user) {
      fetchAccountsData();
    }
  }, [user, timeRange]);

  const fetchAccountsData = async () => {
    try {
      setLoading(true);
      console.log('💰 Fetching comprehensive accounts data');

      // Fetch all financial data
      const [
        paymentsRes,
        invoicesRes,
        studentsRes,
        feeStructureRes,
        financialRequestsRes,
        expensesRes
      ] = await Promise.all([
        supabase
          .from('payments')
          .select(`
            *,
            student:students(name, grade, class),
            invoice:invoices(invoice_number, total_amount)
          `)
          .eq('school_id', user?.school_id)
          .order('created_at', { ascending: false }),

        supabase
          .from('invoices')
          .select(`
            *,
            student:students(name, grade, class, parent:users(name, phone)),
            payments(*)
          `)
          .eq('school_id', user?.school_id)
          .order('due_date', { ascending: true }),

        supabase
          .from('students')
          .select('id, name, grade, class, is_active, parent:users(name, phone)')
          .eq('school_id', user?.school_id)
          .eq('is_active', true),

        supabase
          .from('fee_structure')
          .select('*')
          .eq('school_id', user?.school_id)
          .order('grade', { ascending: true }),

        supabase
          .from('financial_requests')
          .select('*')
          .eq('school_id', user?.school_id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false }),

        supabase
          .from('expenses')
          .select('*')
          .eq('school_id', user?.school_id)
          .order('date', { ascending: false })
          .limit(50)
      ]);

      // Process and set data
      const paymentsData = paymentsRes.data || [];
      const invoicesData = invoicesRes.data || [];
      const studentsData = studentsRes.data || [];
      const feeStructureData = feeStructureRes.data || [];
      const pendingRequestsData = financialRequestsRes.data || [];
      const expensesData = expensesRes.data || [];

      setPayments(paymentsData);
      setInvoices(invoicesData);
      setStudents(studentsData);
      setFeeStructure(feeStructureData);
      setPendingRequests(pendingRequestsData);
      setExpenses(expensesData);

      // Calculate comprehensive financial statistics
      calculateFinancialStats(paymentsData, invoicesData, studentsData, feeStructureData, expensesData);
      
      // Generate demo trends and analytics
      generateFinancialAnalytics(paymentsData, invoicesData, studentsData, expensesData);

      // Generate alerts
      generateAlerts(invoicesData, paymentsData, studentsData);

    } catch (error) {
      console.error('❌ Error fetching accounts data:', error);
      createDemoData();
    } finally {
      setLoading(false);
    }
  };

  const calculateFinancialStats = (paymentsData, invoicesData, studentsData, feeStructureData, expensesData) => {
    // Real collected amounts
    const totalRevenue = paymentsData
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);

    const monthlyRevenue = paymentsData
      .filter(p => p.status === 'completed' && 
        new Date(p.paid_date).getMonth() === new Date().getMonth())
      .reduce((sum, p) => sum + p.amount, 0);

    // Expected amounts based on fee structure
    const expectedMonthlyRevenue = calculateExpectedRevenue(studentsData, feeStructureData);
    
    const pendingPayments = invoicesData.filter(i => i.status === 'pending').length;
    const collectedPayments = paymentsData.filter(p => p.status === 'completed').length;
    const overduePayments = invoicesData.filter(i => 
      i.status === 'pending' && new Date(i.due_date) < new Date()
    ).length;

    const collectionRate = invoicesData.length > 0 ? 
      (collectedPayments / invoicesData.length) * 100 : 0;

    const completedPayments = paymentsData.filter(p => p.status === 'completed');
    const averagePayment = completedPayments.length > 0 ? 
      completedPayments.reduce((sum, p) => sum + p.amount, 0) / completedPayments.length : 0;

    // Calculate additional financial metrics
    const accountsReceivable = invoicesData
      .filter(i => i.status === 'pending')
      .reduce((sum, i) => sum + i.total_amount, 0);

    const totalExpenses = expensesData.reduce((sum, e) => sum + e.amount, 0);
    const cashFlow = monthlyRevenue - totalExpenses;
    const expenseRatio = monthlyRevenue > 0 ? (totalExpenses / monthlyRevenue) * 100 : 0;
    const profitMargin = monthlyRevenue > 0 ? ((monthlyRevenue - totalExpenses) / monthlyRevenue) * 100 : 0;
    const netProfit = monthlyRevenue - totalExpenses;

    setFinancialStats(prev => ({
      ...prev,
      totalRevenue: { ...prev.totalRevenue, real: totalRevenue, expected: expectedMonthlyRevenue * 12 },
      monthlyRevenue: { ...prev.monthlyRevenue, real: monthlyRevenue, expected: expectedMonthlyRevenue },
      pendingPayments: { ...prev.pendingPayments, real: pendingPayments, expected: studentsData.length * 0.1 },
      collectedPayments: { ...prev.collectedPayments, real: collectedPayments, expected: studentsData.length * 0.9 },
      overduePayments: { ...prev.overduePayments, real: overduePayments, expected: studentsData.length * 0.05 },
      collectionRate: { ...prev.collectionRate, real: collectionRate, expected: 85 },
      averagePayment: { ...prev.averagePayment, real: averagePayment, expected: expectedMonthlyRevenue / studentsData.length },
      studentsWithBalance: { ...prev.studentsWithBalance, real: pendingPayments, expected: studentsData.length * 0.1 },
      totalStudents: { ...prev.totalStudents, real: studentsData.length, expected: studentsData.length },
      accountsReceivable,
      cashFlow,
      expenseRatio,
      profitMargin,
      feeDefaults: overduePayments,
      totalExpenses,
      netProfit
    }));
  };

  const calculateExpectedRevenue = (studentsData, feeStructureData) => {
    let totalExpected = 0;
    
    studentsData.forEach(student => {
      const gradeFee = feeStructureData.find(fee => fee.grade === student.grade);
      if (gradeFee) {
        totalExpected += gradeFee.tuition_fee + gradeFee.transport_fee + gradeFee.activity_fee + gradeFee.exam_fee;
      }
    });
    
    return totalExpected;
  };

  const generateFinancialAnalytics = (paymentsData, invoicesData, studentsData, expensesData) => {
    // Generate financial trends (last 6 months)
    const trends = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const monthlyPayments = paymentsData.filter(p => 
        p.paid_date && p.paid_date.startsWith(monthKey)
      );
      
      const monthlyExpenses = expensesData.filter(e =>
        e.date && e.date.startsWith(monthKey)
      );
      
      const revenue = monthlyPayments.reduce((sum, p) => sum + p.amount, 0);
      const expenses = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
      
      trends.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue,
        expenses,
        profit: revenue - expenses
      });
    }
    
    setFinancialTrends(trends);

    // Generate revenue by grade
    const gradeRevenue = {};
    paymentsData.forEach(payment => {
      if (payment.student?.grade) {
        if (!gradeRevenue[payment.student.grade]) {
          gradeRevenue[payment.student.grade] = 0;
        }
        gradeRevenue[payment.student.grade] += payment.amount;
      }
    });

    const revenueByGradeData = Object.entries(gradeRevenue).map(([grade, revenue]) => ({
      grade,
      revenue,
      students: studentsData.filter(s => s.grade === grade).length
    }));

    setRevenueByGrade(revenueByGradeData);

    // Generate payment methods distribution
    const methodDistribution = {};
    paymentsData.forEach(payment => {
      const method = payment.payment_method || 'unknown';
      if (!methodDistribution[method]) {
        methodDistribution[method] = { count: 0, amount: 0 };
      }
      methodDistribution[method].count++;
      methodDistribution[method].amount += payment.amount;
    });

    setPaymentMethods(Object.entries(methodDistribution).map(([method, data]) => ({
      method,
      ...data,
      percentage: paymentsData.length > 0 ? (data.count / paymentsData.length) * 100 : 0
    })));
  };

  const generateAlerts = (invoicesData, paymentsData, studentsData) => {
    const alerts = [];

    // Overdue invoices
    const overdueInvoices = invoicesData.filter(i => 
      i.status === 'pending' && new Date(i.due_date) < new Date()
    );
    
    overdueInvoices.forEach(invoice => {
      alerts.push({
        id: `overdue-${invoice.id}`,
        type: 'error',
        title: 'Overdue Invoice',
        message: `${invoice.student?.name} - KSh ${invoice.total_amount.toLocaleString()}`,
        priority: 'high',
        invoiceId: invoice.id
      });
    });

    // Large payments
    const largePayments = paymentsData.filter(p => p.amount > 50000);
    largePayments.forEach(payment => {
      alerts.push({
        id: `large-payment-${payment.id}`,
        type: 'warning',
        title: 'Large Payment Processed',
        message: `${payment.student?.name} - KSh ${payment.amount.toLocaleString()}`,
        priority: 'medium',
        paymentId: payment.id
      });
    });

    setAlerts(alerts);
  };

  const createDemoData = () => {
    console.log('💰 Creating demo accounts data');
    
    // Demo fee structure
    const demoFeeStructure = grades.map(grade => ({
      id: `fee-${grade}`,
      grade,
      term: 'Term 1',
      tuition_fee: 15000 + (Math.random() * 5000),
      transport_fee: 3000 + (Math.random() * 2000),
      activity_fee: 2000,
      exam_fee: 1000,
      other_fees: 500,
      effective_date: '2024-01-01',
      school_id: user?.school_id,
      created_at: new Date().toISOString()
    }));

    setFeeStructure(demoFeeStructure);
    setLoading(false);
  };

  const toggleStatVisibility = (statKey) => {
    setFinancialStats(prev => ({
      ...prev,
      [statKey]: {
        ...prev[statKey],
        visible: !prev[statKey].visible
      }
    }));
  };

  const processPayment = async () => {
    try {
      if (!paymentForm.student_id || !paymentForm.amount || !paymentForm.payment_method) {
        toast.error('Please fill all required fields');
        return;
      }

      const receiptNumber = `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

      const { error } = await supabase
        .from('payments')
        .insert([{
          student_id: paymentForm.student_id,
          invoice_id: paymentForm.invoice_id,
          amount: parseFloat(paymentForm.amount),
          payment_method: paymentForm.payment_method,
          transaction_id: paymentForm.transaction_id,
          receipt_number: paymentForm.receipt_number || receiptNumber,
          notes: paymentForm.notes,
          status: 'completed',
          paid_date: paymentForm.payment_date,
          processed_by: user?.id,
          school_id: user?.school_id,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      // If invoice exists, update its status
      if (paymentForm.invoice_id) {
        await supabase
          .from('invoices')
          .update({ status: 'paid' })
          .eq('id', paymentForm.invoice_id);
      }

      toast.success('Payment processed successfully!');
      setShowPaymentModal(false);
      setPaymentForm({
        student_id: '',
        invoice_id: '',
        amount: 0,
        payment_method: 'mpesa',
        transaction_id: '',
        notes: '',
        receipt_number: '',
        payment_date: new Date().toISOString().split('T')[0]
      });
      fetchAccountsData();
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Failed to process payment');
    }
  };

  const recordExpense = async () => {
    try {
      if (!expenseForm.category || !expenseForm.amount || !expenseForm.description) {
        toast.error('Please fill all required fields');
        return;
      }

      const { error } = await supabase
        .from('expenses')
        .insert([{
          category: expenseForm.category,
          description: expenseForm.description,
          amount: parseFloat(expenseForm.amount),
          date: expenseForm.date,
          payment_method: expenseForm.payment_method,
          reference: expenseForm.reference,
          notes: expenseForm.notes,
          recorded_by: user?.id,
          school_id: user?.school_id,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      toast.success('Expense recorded successfully!');
      setShowExpenseModal(false);
      setExpenseForm({
        category: 'operational',
        description: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        payment_method: 'bank',
        reference: '',
        notes: ''
      });
      fetchAccountsData();
    } catch (error) {
      console.error('Error recording expense:', error);
      toast.error('Failed to record expense');
    }
  };

  const updateFeeStructure = async () => {
    try {
      if (!feeForm.grade || !feeForm.term) {
        toast.error('Grade and Term are required');
        return;
      }

      const feeData = {
        grade: feeForm.grade,
        term: feeForm.term,
        tuition_fee: parseFloat(feeForm.tuition_fee),
        transport_fee: parseFloat(feeForm.transport_fee),
        activity_fee: parseFloat(feeForm.activity_fee),
        exam_fee: parseFloat(feeForm.exam_fee),
        other_fees: parseFloat(feeForm.other_fees),
        effective_date: feeForm.effective_date,
        notes: feeForm.notes,
        school_id: user?.school_id,
        updated_by: user?.id,
        updated_at: new Date().toISOString()
      };

      let error;
      if (selectedFee) {
        // Update existing fee
        const result = await supabase
          .from('fee_structure')
          .update(feeData)
          .eq('id', selectedFee.id);
        error = result.error;
      } else {
        // Create new fee structure
        const result = await supabase
          .from('fee_structure')
          .insert([feeData]);
        error = result.error;
      }

      if (error) throw error;

      toast.success(selectedFee ? 'Fee structure updated!' : 'Fee structure created!');
      setShowFeeModal(false);
      setSelectedFee(null);
      setFeeForm({
        grade: '',
        term: '',
        tuition_fee: 0,
        transport_fee: 0,
        activity_fee: 0,
        exam_fee: 0,
        other_fees: 0,
        effective_date: '',
        notes: ''
      });
      fetchAccountsData();
    } catch (error) {
      console.error('Error updating fee structure:', error);
      toast.error('Failed to update fee structure');
    }
  };

  const submitAdminRequest = async () => {
    try {
      if (!requestForm.title || !requestForm.description) {
        toast.error('Title and description are required');
        return;
      }

      const { error } = await supabase
        .from('financial_requests')
        .insert([{
          type: requestForm.type,
          title: requestForm.title,
          description: requestForm.description,
          priority: requestForm.priority,
          requested_changes: requestForm.requested_changes,
          requested_by: user?.id,
          school_id: user?.school_id,
          status: 'pending',
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      toast.success('Request submitted to admin successfully!');
      setShowRequestModal(false);
      setRequestForm({
        type: 'fee_change',
        title: '',
        description: '',
        priority: 'medium',
        requested_changes: {}
      });
      fetchAccountsData();
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Failed to submit request');
    }
  };

  const generateInvoice = async (studentId) => {
    try {
      const student = students.find(s => s.id === studentId);
      const fee = feeStructure.find(f => f.grade === student?.grade);
      
      if (!fee) {
        toast.error('No fee structure found for this grade');
        return;
      }

      const totalAmount = fee.tuition_fee + fee.transport_fee + fee.activity_fee + fee.exam_fee + fee.other_fees;
      const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

      const { error } = await supabase
        .from('invoices')
        .insert([{
          invoice_number: invoiceNumber,
          student_id: studentId,
          total_amount: totalAmount,
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
          status: 'pending',
          items: [
            { description: 'Tuition Fee', amount: fee.tuition_fee },
            { description: 'Transport Fee', amount: fee.transport_fee },
            { description: 'Activity Fee', amount: fee.activity_fee },
            { description: 'Exam Fee', amount: fee.exam_fee },
            { description: 'Other Fees', amount: fee.other_fees }
          ],
          school_id: user?.school_id,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      toast.success('Invoice generated successfully!');
      fetchAccountsData();
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast.error('Failed to generate invoice');
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    expected, 
    subtitle, 
    icon: Icon, 
    color = "blue", 
    trend, 
    visible = true,
    onToggleVisibility 
  }) => (
    <Card className={`p-6 hover:shadow-lg transition-all duration-200 border-2 ${
      visible ? 'border-gray-200' : 'border-gray-100 bg-gray-50'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleVisibility}
          className="h-6 w-6 p-0"
        >
          {visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </Button>
      </div>
      
      {visible ? (
        <>
          <div className="flex items-end justify-between mb-2">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <Icon className={`h-8 w-8 ${
              color === 'blue' ? 'text-blue-600' :
              color === 'green' ? 'text-green-600' :
              color === 'red' ? 'text-red-600' :
              'text-purple-600'
            }`} />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Expected</span>
              <span className="font-medium text-gray-700">{expected}</span>
            </div>
            
            {trend && (
              <div className={`flex items-center text-sm ${
                trend > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend > 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                {Math.abs(trend)}%
              </div>
            )}
            
            {subtitle && (
              <p className="text-xs text-gray-500">{subtitle}</p>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-4">
          <Lock className="h-6 w-6 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Statistic hidden</p>
        </div>
      )}
    </Card>
  );

  const FinancialChart = ({ data, title, color = "#3b82f6" }) => (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h4 className="font-semibold text-gray-900 mb-4">{title}</h4>
      <div className="flex items-end justify-between h-32 px-4">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div
              className="w-6 rounded-t transition-all duration-500"
              style={{ 
                height: `${(item.value / Math.max(...data.map(d => d.value))) * 80}%`,
                backgroundColor: color
              }}
            />
            <span className="text-xs text-gray-600 mt-2">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const PaymentStatusBadge = ({ status }) => {
    const config = {
      completed: { label: 'Paid', color: 'green' },
      pending: { label: 'Pending', color: 'yellow' },
      overdue: { label: 'Overdue', color: 'red' },
      cancelled: { label: 'Cancelled', color: 'gray' }
    }[status] || { label: 'Unknown', color: 'gray' };

    return (
      <Badge className={`bg-${config.color}-100 text-${config.color}-800`}>
        {config.label}
      </Badge>
    );
  };

  const refreshData = () => {
    setRefreshing(true);
    fetchAccountsData().finally(() => setRefreshing(false));
  };

  const exportFinancialReport = () => {
    toast.success('Preparing financial report...');
    // In a real app, this would generate and download a PDF/Excel report
    setTimeout(() => {
      toast.success('Financial report exported successfully!');
    }, 2000);
  };

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
      <DashboardHeader 
        title="Accounts & Finance Management" 
        subtitle="Comprehensive financial oversight and fee management"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowStats(!showStats)}
            >
              {showStats ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
              {showStats ? 'Hide Stats' : 'Show Stats'}
            </Button>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              onClick={() => setShowExpenseModal(true)}
              variant="outline"
            >
              <Receipt className="h-4 w-4 mr-2" />
              Record Expense
            </Button>
            <Button
              onClick={() => setShowRequestModal(true)}
              variant="outline"
            >
              <Send className="h-4 w-4 mr-2" />
              Request Admin
            </Button>
            <Button
              onClick={() => setShowFeeModal(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Set Fees
            </Button>
          </div>
        </div>

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center text-red-800">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Financial Alerts ({alerts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {alerts.slice(0, 3).map(alert => (
                  <div key={alert.id} className="flex items-center justify-between p-3 bg-white rounded border border-red-200">
                    <div>
                      <p className="font-medium text-gray-900">{alert.title}</p>
                      <p className="text-sm text-gray-600">{alert.message}</p>
                    </div>
                    <Badge variant="destructive">
                      {alert.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Financial Overview Stats */}
        {showStats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Monthly Revenue"
                value={`KSh ${financialStats.monthlyRevenue.real.toLocaleString()}`}
                expected={`KSh ${financialStats.monthlyRevenue.expected.toLocaleString()}`}
                icon={DollarSign}
                color="green"
                trend={financialStats.revenueGrowth.real}
                visible={financialStats.monthlyRevenue.visible}
                onToggleVisibility={() => toggleStatVisibility('monthlyRevenue')}
              />
              <StatCard
                title="Collection Rate"
                value={`${financialStats.collectionRate.real.toFixed(1)}%`}
                expected={`${financialStats.collectionRate.expected}%`}
                icon={Target}
                color="blue"
                visible={financialStats.collectionRate.visible}
                onToggleVisibility={() => toggleStatVisibility('collectionRate')}
              />
              <StatCard
                title="Pending Payments"
                value={financialStats.pendingPayments.real}
                expected={financialStats.pendingPayments.expected}
                icon={Clock}
                color="yellow"
                visible={financialStats.pendingPayments.visible}
                onToggleVisibility={() => toggleStatVisibility('pendingPayments')}
              />
              <StatCard
                title="Overdue Payments"
                value={financialStats.overduePayments.real}
                expected={financialStats.overduePayments.expected}
                icon={AlertTriangle}
                color="red"
                visible={financialStats.overduePayments.visible}
                onToggleVisibility={() => toggleStatVisibility('overduePayments')}
              />
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Accounts Receivable"
                value={`KSh ${financialStats.accountsReceivable.toLocaleString()}`}
                expected=""
                icon={Receipt}
                color="purple"
                visible={true}
                onToggleVisibility={() => {}}
              />
              <StatCard
                title="Cash Flow"
                value={`KSh ${financialStats.cashFlow.toLocaleString()}`}
                expected=""
                icon={TrendingUp}
                color={financialStats.cashFlow >= 0 ? "green" : "red"}
                visible={true}
                onToggleVisibility={() => {}}
              />
              <StatCard
                title="Profit Margin"
                value={`${financialStats.profitMargin.toFixed(1)}%`}
                expected=""
                icon={ChartBar}
                color="green"
                visible={true}
                onToggleVisibility={() => {}}
              />
              <StatCard
                title="Total Expenses"
                value={`KSh ${financialStats.totalExpenses.toLocaleString()}`}
                expected=""
                icon={Coins}
                color="orange"
                visible={true}
                onToggleVisibility={() => {}}
              />
            </div>
          </>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="fees">Fee Structure</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FinancialChart
                data={financialTrends.map(t => ({ label: t.month, value: t.revenue }))}
                title="Revenue Trend"
                color="#10b981"
              />
              <FinancialChart
                data={revenueByGrade.map(g => ({ label: g.grade, value: g.revenue }))}
                title="Revenue by Grade"
                color="#3b82f6"
              />
            </div>

            {/* Payment Methods Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {paymentMethods.map((method, index) => (
                    <div key={method.method} className="text-center p-4 border rounded-lg">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                        method.method === 'mpesa' ? 'bg-green-100' :
                        method.method === 'bank' ? 'bg-blue-100' :
                        method.method === 'cash' ? 'bg-yellow-100' : 'bg-purple-100'
                      }`}>
                        <CreditCard className={`h-6 w-6 ${
                          method.method === 'mpesa' ? 'text-green-600' :
                          method.method === 'bank' ? 'text-blue-600' :
                          method.method === 'cash' ? 'text-yellow-600' : 'text-purple-600'
                        }`} />
                      </div>
                      <h4 className="font-semibold capitalize">{method.method}</h4>
                      <p className="text-2xl font-bold text-gray-900">{method.percentage.toFixed(1)}%</p>
                      <p className="text-sm text-gray-600">
                        KSh {method.amount.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {payments.slice(0, 5).map(payment => (
                      <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{payment.student?.name}</p>
                          <p className="text-sm text-gray-600">{payment.payment_method}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">KSh {payment.amount.toLocaleString()}</p>
                          <PaymentStatusBadge status={payment.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pending Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingRequests.slice(0, 5).map(request => (
                      <div key={request.id} className="p-3 border rounded-lg">
                        <p className="font-medium">{request.title}</p>
                        <p className="text-sm text-gray-600 truncate">{request.description}</p>
                        <Badge variant="outline" className="mt-2 capitalize">
                          {request.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Payment Records</span>
                  <div className="flex space-x-2">
                    <Button onClick={exportFinancialReport} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button onClick={() => setShowPaymentModal(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Record Payment
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Student</th>
                        <th className="text-left p-3">Amount</th>
                        <th className="text-left p-3">Method</th>
                        <th className="text-left p-3">Date</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">Receipt</th>
                        <th className="text-left p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.slice(0, 10).map(payment => (
                        <tr key={payment.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <div>
                              <div className="font-medium">{payment.student?.name}</div>
                              <div className="text-sm text-gray-600">{payment.student?.grade}</div>
                            </div>
                          </td>
                          <td className="p-3 font-semibold">
                            KSh {payment.amount.toLocaleString()}
                          </td>
                          <td className="p-3">
                            <Badge variant="outline" className="capitalize">
                              {payment.payment_method}
                            </Badge>
                          </td>
                          <td className="p-3 text-sm">
                            {new Date(payment.paid_date).toLocaleDateString()}
                          </td>
                          <td className="p-3">
                            <PaymentStatusBadge status={payment.status} />
                          </td>
                          <td className="p-3 text-sm font-mono">
                            {payment.receipt_number}
                          </td>
                          <td className="p-3">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Student</th>
                        <th className="text-left p-3">Invoice #</th>
                        <th className="text-left p-3">Amount</th>
                        <th className="text-left p-3">Due Date</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.slice(0, 10).map(invoice => (
                        <tr key={invoice.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <div>
                              <div className="font-medium">{invoice.student?.name}</div>
                              <div className="text-sm text-gray-600">{invoice.student?.grade}</div>
                            </div>
                          </td>
                          <td className="p-3 font-mono text-sm">
                            {invoice.invoice_number}
                          </td>
                          <td className="p-3 font-semibold">
                            KSh {invoice.total_amount.toLocaleString()}
                          </td>
                          <td className="p-3 text-sm">
                            {new Date(invoice.due_date).toLocaleDateString()}
                          </td>
                          <td className="p-3">
                            <PaymentStatusBadge status={invoice.status} />
                          </td>
                          <td className="p-3">
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => generateInvoice(invoice.student_id)}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
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

          {/* Fee Structure Tab */}
          <TabsContent value="fees" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Fee Structure</span>
                  <Button onClick={() => setShowFeeModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Fee Structure
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Grade</th>
                        <th className="text-left p-3">Term</th>
                        <th className="text-left p-3">Tuition</th>
                        <th className="text-left p-3">Transport</th>
                        <th className="text-left p-3">Activities</th>
                        <th className="text-left p-3">Total</th>
                        <th className="text-left p-3">Effective Date</th>
                        <th className="text-left p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feeStructure.map(fee => {
                        const total = fee.tuition_fee + fee.transport_fee + fee.activity_fee + fee.exam_fee + fee.other_fees;
                        return (
                          <tr key={fee.id} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-medium">{fee.grade}</td>
                            <td className="p-3">{fee.term}</td>
                            <td className="p-3">KSh {fee.tuition_fee.toLocaleString()}</td>
                            <td className="p-3">KSh {fee.transport_fee.toLocaleString()}</td>
                            <td className="p-3">KSh {fee.activity_fee.toLocaleString()}</td>
                            <td className="p-3 font-semibold">
                              KSh {total.toLocaleString()}
                            </td>
                            <td className="p-3 text-sm">
                              {new Date(fee.effective_date).toLocaleDateString()}
                            </td>
                            <td className="p-3">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedFee(fee);
                                  setFeeForm({
                                    grade: fee.grade,
                                    term: fee.term,
                                    tuition_fee: fee.tuition_fee,
                                    transport_fee: fee.transport_fee,
                                    activity_fee: fee.activity_fee,
                                    exam_fee: fee.exam_fee,
                                    other_fees: fee.other_fees,
                                    effective_date: fee.effective_date,
                                    notes: fee.notes
                                  });
                                  setShowFeeModal(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="cursor-pointer hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Financial Summary</h3>
                      <p className="text-sm text-gray-600">Revenue, expenses & profit analysis</p>
                    </div>
                  </div>
                  <Button className="w-full mt-4" onClick={exportFinancialReport}>
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <Target className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Collection Report</h3>
                      <p className="text-sm text-gray-600">Payment collection analysis</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Student Balances</h3>
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

            {/* Expenses Table */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Category</th>
                        <th className="text-left p-3">Description</th>
                        <th className="text-left p-3">Amount</th>
                        <th className="text-left p-3">Date</th>
                        <th className="text-left p-3">Method</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.slice(0, 10).map(expense => (
                        <tr key={expense.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <Badge variant="outline" className="capitalize">
                              {expense.category}
                            </Badge>
                          </td>
                          <td className="p-3">{expense.description}</td>
                          <td className="p-3 font-semibold text-red-600">
                            KSh {expense.amount.toLocaleString()}
                          </td>
                          <td className="p-3 text-sm">
                            {new Date(expense.date).toLocaleDateString()}
                          </td>
                          <td className="p-3">
                            <span className="capitalize">{expense.payment_method}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Fee Structure Modal */}
        {showFeeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {selectedFee ? 'Edit Fee Structure' : 'Create Fee Structure'}
                </h3>
                <Button variant="ghost" onClick={() => setShowFeeModal(false)}>×</Button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); updateFeeStructure(); }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Grade *</label>
                    <select
                      value={feeForm.grade}
                      onChange={(e) => setFeeForm({...feeForm, grade: e.target.value})}
                      className="w-full p-2 border rounded"
                      required
                    >
                      <option value="">Select Grade</option>
                      {grades.map(grade => (
                        <option key={grade} value={grade}>{grade}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Term *</label>
                    <select
                      value={feeForm.term}
                      onChange={(e) => setFeeForm({...feeForm, term: e.target.value})}
                      className="w-full p-2 border rounded"
                      required
                    >
                      <option value="">Select Term</option>
                      {terms.map(term => (
                        <option key={term} value={term}>{term}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Tuition Fee *</label>
                    <Input
                      type="number"
                      value={feeForm.tuition_fee}
                      onChange={(e) => setFeeForm({...feeForm, tuition_fee: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Transport Fee</label>
                    <Input
                      type="number"
                      value={feeForm.transport_fee}
                      onChange={(e) => setFeeForm({...feeForm, transport_fee: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Activity Fee</label>
                    <Input
                      type="number"
                      value={feeForm.activity_fee}
                      onChange={(e) => setFeeForm({...feeForm, activity_fee: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Exam Fee</label>
                    <Input
                      type="number"
                      value={feeForm.exam_fee}
                      onChange={(e) => setFeeForm({...feeForm, exam_fee: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Other Fees</label>
                    <Input
                      type="number"
                      value={feeForm.other_fees}
                      onChange={(e) => setFeeForm({...feeForm, other_fees: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Effective Date *</label>
                    <Input
                      type="date"
                      value={feeForm.effective_date}
                      onChange={(e) => setFeeForm({...feeForm, effective_date: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Notes</label>
                  <textarea
                    value={feeForm.notes}
                    onChange={(e) => setFeeForm({...feeForm, notes: e.target.value})}
                    className="w-full p-2 border rounded"
                    rows={3}
                    placeholder="Additional notes about this fee structure..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button type="submit" className="flex-1">
                    {selectedFee ? 'Update Fees' : 'Create Fee Structure'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowFeeModal(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Record Payment</h3>
                <Button variant="ghost" onClick={() => setShowPaymentModal(false)}>×</Button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); processPayment(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Student *</label>
                  <select
                    value={paymentForm.student_id}
                    onChange={(e) => setPaymentForm({...paymentForm, student_id: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Select Student</option>
                    {students.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.name} - {student.grade}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Amount *</label>
                  <Input
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Payment Method *</label>
                  <select
                    value={paymentForm.payment_method}
                    onChange={(e) => setPaymentForm({...paymentForm, payment_method: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  >
                    {paymentMethodsList.map(method => (
                      <option key={method.value} value={method.value}>{method.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Transaction ID</label>
                  <Input
                    value={paymentForm.transaction_id}
                    onChange={(e) => setPaymentForm({...paymentForm, transaction_id: e.target.value})}
                    placeholder="e.g., MPE123456789"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Payment Date</label>
                  <Input
                    type="date"
                    value={paymentForm.payment_date}
                    onChange={(e) => setPaymentForm({...paymentForm, payment_date: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Notes</label>
                  <textarea
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
                    className="w-full p-2 border rounded"
                    rows={3}
                    placeholder="Additional notes about this payment..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button type="submit" className="flex-1">
                    Process Payment
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowPaymentModal(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Expense Modal */}
        {showExpenseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Record Expense</h3>
                <Button variant="ghost" onClick={() => setShowExpenseModal(false)}>×</Button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); recordExpense(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category *</label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({...expenseForm, category: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  >
                    {expenseCategories.map(category => (
                      <option key={category.value} value={category.value}>{category.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description *</label>
                  <Input
                    value={expenseForm.description}
                    onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
                    placeholder="Brief description of the expense"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Amount *</label>
                  <Input
                    type="number"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Date</label>
                  <Input
                    type="date"
                    value={expenseForm.date}
                    onChange={(e) => setExpenseForm({...expenseForm, date: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Payment Method</label>
                  <select
                    value={expenseForm.payment_method}
                    onChange={(e) => setExpenseForm({...expenseForm, payment_method: e.target.value})}
                    className="w-full p-2 border rounded"
                  >
                    {paymentMethodsList.map(method => (
                      <option key={method.value} value={method.value}>{method.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button type="submit" className="flex-1">
                    Record Expense
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowExpenseModal(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Admin Request Modal */}
        {showRequestModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Submit Request to Admin</h3>
                <Button variant="ghost" onClick={() => setShowRequestModal(false)}>×</Button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); submitAdminRequest(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Request Type</label>
                  <select
                    value={requestForm.type}
                    onChange={(e) => setRequestForm({...requestForm, type: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  >
                    {requestTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <Input
                    value={requestForm.title}
                    onChange={(e) => setRequestForm({...requestForm, title: e.target.value})}
                    placeholder="Brief title of your request"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description *</label>
                  <textarea
                    value={requestForm.description}
                    onChange={(e) => setRequestForm({...requestForm, description: e.target.value})}
                    className="w-full p-2 border rounded"
                    rows={4}
                    placeholder="Detailed description of your request..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Priority</label>
                  <select
                    value={requestForm.priority}
                    onChange={(e) => setRequestForm({...requestForm, priority: e.target.value})}
                    className="w-full p-2 border rounded"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button type="submit" className="flex-1">
                    <Send className="h-4 w-4 mr-2" />
                    Submit Request
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowRequestModal(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountsDashboard;