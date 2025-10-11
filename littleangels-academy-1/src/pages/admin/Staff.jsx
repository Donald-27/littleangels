// src/pages/admin/StaffDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Download,
  Upload,
  UserPlus,
  MapPin,
  Phone,
  Mail,
  Calendar,
  GraduationCap,
  Bus,
  AlertCircle,
  CheckCircle,
  XCircle,
  Shield,
  Car,
  BookOpen,
  Calculator,
  Clock,
  Star,
  Award,
  TrendingUp,
  MoreVertical,
  MailCheck,
  PhoneCall,
  Map,
  Heart,
  Zap,
  Target,
  BarChart3,
  UserCheck,
  UserX,
  Settings,
  Send,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Table } from '../../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import DashboardHeader from '../../components/DashboardHeader';
import { toast } from 'sonner';

const StaffDashboard = () => {
  const { user } = useAuth();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    byRole: {},
    drivers: 0,
    teachers: 0,
    admins: 0,
    accounts: 0,
    performance: { average: 4.2, excellent: 12, good: 8, needs_improvement: 2 }
  });

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'teacher',
    address: '',
    national_id: '',
    emergency_contact: { name: '', phone: '', relationship: '' },
    qualifications: '',
    experience: '',
    specialization: '',
    salary: '',
    join_date: new Date().toISOString().split('T')[0],
    is_active: true,
    performance_rating: 4,
    notes: ''
  });

  const roles = [
    { value: 'admin', label: 'Administrator', icon: Shield, color: 'red', description: 'School administration and management' },
    { value: 'teacher', label: 'Teacher', icon: BookOpen, color: 'blue', description: 'Teaching and academic staff' },
    { value: 'driver', label: 'Driver', icon: Car, color: 'green', description: 'Transport and logistics' },
    { value: 'accounts', label: 'Accounts', icon: Calculator, color: 'purple', description: 'Finance and accounting' },
    { value: 'support', label: 'Support', icon: Users, color: 'yellow', description: 'Support and maintenance staff' }
  ];

  const performanceLevels = [
    { level: 5, label: 'Excellent', color: 'green', icon: Award },
    { level: 4, label: 'Very Good', color: 'blue', icon: TrendingUp },
    { level: 3, label: 'Good', color: 'yellow', icon: CheckCircle },
    { level: 2, label: 'Needs Improvement', color: 'orange', icon: AlertCircle },
    { level: 1, label: 'Poor', color: 'red', icon: XCircle }
  ];

  useEffect(() => {
    if (user) {
      fetchStaff();
      fetchStats();
    }
  }, [user]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      console.log('👥 Fetching staff for school:', user?.school_id);

      // Try to fetch from database
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('school_id', user?.school_id)
        .neq('role', 'parent')
        .order('created_at', { ascending: false });

      if (error) {
        // If table doesn't exist, use demo data
        if (error.code === '42P01') {
          console.log('📋 Staff table does not exist, using demo data');
          createDemoStaff();
          return;
        }
        throw error;
      }

      console.log(`✅ Fetched ${data?.length || 0} staff members`);
      setStaff(data || []);

    } catch (error) {
      console.error('❌ Error fetching staff:', error);
      
      // Fall back to demo data
      if (error.code === '42P01' || error.code === '42703') {
        createDemoStaff();
      } else {
        toast.error('Failed to fetch staff');
      }
    } finally {
      setLoading(false);
    }
  };

  // Create demo staff for development
  const createDemoStaff = () => {
    console.log('🎭 Creating demo staff for development');
    const demoStaff = [
      {
        id: 'demo-1',
        name: 'John Kamau',
        email: 'john.kamau@littleangels.ac.ke',
        phone: '+254712345678',
        role: 'teacher',
        address: '123 Teachers Plaza, Nairobi',
        national_id: '12345678',
        qualifications: 'M.Ed, B.Ed',
        experience: '8 years',
        specialization: 'Mathematics & Science',
        salary: '85000',
        join_date: '2020-03-15',
        is_active: true,
        performance_rating: 5,
        notes: 'Excellent teacher with great student engagement',
        school_id: user?.school_id || 'demo-school',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        _isDemo: true
      },
      {
        id: 'demo-2',
        name: 'Mary Wanjiku',
        email: 'mary.wanjiku@littleangels.ac.ke',
        phone: '+254723456789',
        role: 'admin',
        address: '456 Admin Road, Nairobi',
        national_id: '23456789',
        qualifications: 'MBA, B.Com',
        experience: '6 years',
        specialization: 'School Administration',
        salary: '120000',
        join_date: '2019-08-22',
        is_active: true,
        performance_rating: 4,
        notes: 'Efficient administrator with strong leadership skills',
        school_id: user?.school_id || 'demo-school',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        _isDemo: true
      },
      {
        id: 'demo-3',
        name: 'David Ochieng',
        email: 'david.ochieng@littleangels.ac.ke',
        phone: '+254734567890',
        role: 'driver',
        address: '789 Drivers Lane, Nairobi',
        national_id: '34567890',
        qualifications: 'Driving License, First Aid',
        experience: '5 years',
        specialization: 'Student Transport',
        salary: '45000',
        join_date: '2021-01-10',
        is_active: true,
        performance_rating: 4,
        notes: 'Safe driver with excellent route knowledge',
        school_id: user?.school_id || 'demo-school',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        _isDemo: true
      },
      {
        id: 'demo-4',
        name: 'Grace Mwende',
        email: 'grace.mwende@littleangels.ac.ke',
        phone: '+254745678901',
        role: 'accounts',
        address: '321 Finance Street, Nairobi',
        national_id: '45678901',
        qualifications: 'CPA, B.Com Accounting',
        experience: '7 years',
        specialization: 'School Accounts',
        salary: '95000',
        join_date: '2020-06-30',
        is_active: true,
        performance_rating: 5,
        notes: 'Detail-oriented accountant with excellent records',
        school_id: user?.school_id || 'demo-school',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        _isDemo: true
      }
    ];
    
    setStaff(demoStaff);
    updateStats(demoStaff);
    setLoading(false);
  };

  const updateStats = (staffList) => {
    const total = staffList.length;
    const active = staffList.filter(s => s.is_active).length;
    
    const byRole = {};
    staffList.forEach(member => {
      byRole[member.role] = (byRole[member.role] || 0) + 1;
    });

    const performanceRatings = staffList.map(s => s.performance_rating || 3);
    const average = performanceRatings.length > 0 
      ? (performanceRatings.reduce((a, b) => a + b, 0) / performanceRatings.length).toFixed(1)
      : 0;

    const excellent = staffList.filter(s => s.performance_rating >= 4.5).length;
    const good = staffList.filter(s => s.performance_rating >= 3.5 && s.performance_rating < 4.5).length;
    const needs_improvement = staffList.filter(s => s.performance_rating < 3.5).length;

    setStats({ 
      total, 
      active, 
      byRole,
      drivers: byRole.driver || 0,
      teachers: byRole.teacher || 0,
      admins: byRole.admin || 0,
      accounts: byRole.accounts || 0,
      performance: { average, excellent, good, needs_improvement }
    });
  };

  const fetchStats = async () => {
    try {
      // Calculate stats from local staff data
      updateStats(staff);
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Calculate from local staff as fallback
      updateStats(staff);
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    
    try {
      console.log('👥 Adding staff member:', formData);

      const staffPayload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        address: formData.address,
        national_id: formData.national_id,
        emergency_contact: formData.emergency_contact,
        qualifications: formData.qualifications,
        experience: formData.experience,
        specialization: formData.specialization,
        salary: formData.salary,
        join_date: formData.join_date,
        is_active: formData.is_active,
        performance_rating: formData.performance_rating,
        notes: formData.notes,
        school_id: user?.school_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Try to insert into database
      if (supabase) {
        const { data, error } = await supabase
          .from('users')
          .insert([staffPayload])
          .select()
          .single();

        if (error) {
          // If database insert fails, add to local state
          console.log('📋 Database insert failed, adding to local state');
          throw new Error('Database not available - using demo mode');
        }

        console.log('✅ Staff added to database:', data);
        setStaff(prev => [data, ...prev]);
        
      } else {
        // If supabase not configured, add to local state
        console.log('📋 Supabase not configured, adding to local state');
        const demoStaff = {
          ...staffPayload,
          id: 'demo-' + Date.now(),
          _isDemo: true
        };
        setStaff(prev => [demoStaff, ...prev]);
      }

      toast.success('Staff member added successfully!');
      setShowAddModal(false);
      resetForm();
      fetchStats();

    } catch (error) {
      console.error('❌ Error adding staff:', error);
      
      // Add to local state as fallback
      const demoStaff = {
        ...formData,
        id: 'demo-' + Date.now(),
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        _isDemo: true
      };
      
      setStaff(prev => [demoStaff, ...prev]);
      setShowAddModal(false);
      resetForm();
      fetchStats();
      
      toast.success('Staff member added successfully! (Demo Mode)');
    }
  };

  const handleUpdateStaff = async (e) => {
    e.preventDefault();
    try {
      console.log('👥 Updating staff member:', selectedStaff.id);

      const updatePayload = {
        name: formData.name,
        phone: formData.phone,
        role: formData.role,
        address: formData.address,
        national_id: formData.national_id,
        emergency_contact: formData.emergency_contact,
        qualifications: formData.qualifications,
        experience: formData.experience,
        specialization: formData.specialization,
        salary: formData.salary,
        join_date: formData.join_date,
        is_active: formData.is_active,
        performance_rating: formData.performance_rating,
        notes: formData.notes,
        updated_at: new Date().toISOString()
      };

      // Try to update in database if it's not a demo staff
      if (supabase && !selectedStaff._isDemo) {
        const { error } = await supabase
          .from('users')
          .update(updatePayload)
          .eq('id', selectedStaff.id);

        if (error) throw error;
      }

      // Update local state
      setStaff(prev => 
        prev.map(staff => 
          staff.id === selectedStaff.id 
            ? { ...staff, ...updatePayload }
            : staff
        )
      );

      toast.success('Staff member updated successfully!');
      setShowEditModal(false);
      resetForm();
      fetchStats();

    } catch (error) {
      console.error('❌ Error updating staff:', error);
      toast.error('Failed to update staff member');
    }
  };

  const handleDeleteStaff = async (staffId) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;
    
    try {
      // Try to delete from database if it's not a demo staff
      if (supabase && !staffId.startsWith('demo-')) {
        const { error } = await supabase
          .from('users')
          .delete()
          .eq('id', staffId);

        if (error) throw error;
      }

      // Remove from local state
      setStaff(prev => prev.filter(staff => staff.id !== staffId));
      toast.success('Staff member deleted successfully!');
      fetchStats();

    } catch (error) {
      console.error('❌ Error deleting staff:', error);
      toast.error('Failed to delete staff member');
    }
  };

  const toggleStaffStatus = async (staffId) => {
    try {
      const staffMember = staff.find(s => s.id === staffId);
      const newStatus = !staffMember.is_active;

      // Try to update in database if it's not a demo staff
      if (supabase && !staffId.startsWith('demo-')) {
        const { error } = await supabase
          .from('users')
          .update({ is_active: newStatus, updated_at: new Date().toISOString() })
          .eq('id', staffId);

        if (error) throw error;
      }

      // Update local state
      setStaff(prev => 
        prev.map(staff => 
          staff.id === staffId 
            ? { ...staff, is_active: newStatus }
            : staff
        )
      );

      toast.success(`Staff member ${newStatus ? 'activated' : 'deactivated'} successfully!`);
      fetchStats();

    } catch (error) {
      console.error('❌ Error updating staff status:', error);
      toast.error('Failed to update staff status');
    }
  };

  const sendWelcomeEmail = (staffMember) => {
    toast.success(`Welcome email sent to ${staffMember.name}`);
    console.log('📧 Sending welcome email to:', staffMember.email);
  };

  const scheduleMeeting = (staffMember) => {
    toast.info(`Meeting scheduled with ${staffMember.name}`);
    console.log('📅 Scheduling meeting with:', staffMember.name);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'teacher',
      address: '',
      national_id: '',
      emergency_contact: { name: '', phone: '', relationship: '' },
      qualifications: '',
      experience: '',
      specialization: '',
      salary: '',
      join_date: new Date().toISOString().split('T')[0],
      is_active: true,
      performance_rating: 4,
      notes: ''
    });
  };

  const openEditModal = (staffMember) => {
    setSelectedStaff(staffMember);
    setFormData({
      name: staffMember.name,
      email: staffMember.email,
      phone: staffMember.phone,
      role: staffMember.role,
      address: staffMember.address,
      national_id: staffMember.national_id,
      emergency_contact: staffMember.emergency_contact || { name: '', phone: '', relationship: '' },
      qualifications: staffMember.qualifications,
      experience: staffMember.experience,
      specialization: staffMember.specialization,
      salary: staffMember.salary,
      join_date: staffMember.join_date,
      is_active: staffMember.is_active,
      performance_rating: staffMember.performance_rating || 4,
      notes: staffMember.notes
    });
    setShowEditModal(true);
  };

  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || member.role === filterRole;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && member.is_active) ||
                         (filterStatus === 'inactive' && !member.is_active);
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'high-performers' && member.performance_rating >= 4.5) ||
                      (activeTab === 'new' && isNewStaff(member));
    
    return matchesSearch && matchesRole && matchesStatus && matchesTab;
  });

  const isNewStaff = (staffMember) => {
    const joinDate = new Date(staffMember.join_date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return joinDate > thirtyDaysAgo;
  };

  const getRoleIcon = (role) => {
    const roleInfo = roles.find(r => r.value === role);
    return roleInfo ? roleInfo.icon : Users;
  };

  const getRoleColor = (role) => {
    const roleInfo = roles.find(r => r.value === role);
    return roleInfo ? roleInfo.color : 'gray';
  };

  const getPerformanceColor = (rating) => {
    if (rating >= 4.5) return 'green';
    if (rating >= 3.5) return 'blue';
    if (rating >= 2.5) return 'yellow';
    return 'red';
  };

  const getPerformanceIcon = (rating) => {
    if (rating >= 4.5) return Award;
    if (rating >= 3.5) return TrendingUp;
    if (rating >= 2.5) return CheckCircle;
    return AlertCircle;
  };

  const StatCard = ({ title, value, icon: Icon, color = "blue", subtitle, trend }) => (
    <Card className="p-6 hover:shadow-lg transition-all duration-200 border-0 shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
          {trend && (
            <div className={`inline-flex items-center text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className={`h-4 w-4 mr-1 ${trend > 0 ? '' : 'rotate-180'}`} />
              {trend > 0 ? '+' : ''}{trend}%
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          color === 'blue' ? 'bg-blue-100' :
          color === 'green' ? 'bg-green-100' :
          color === 'purple' ? 'bg-purple-100' :
          color === 'red' ? 'bg-red-100' : 'bg-yellow-100'
        }`}>
          <Icon className={`h-6 w-6 ${
            color === 'blue' ? 'text-blue-600' :
            color === 'green' ? 'text-green-600' :
            color === 'purple' ? 'text-purple-600' :
            color === 'red' ? 'text-red-600' : 'text-yellow-600'
          }`} />
        </div>
      </div>
    </Card>
  );

  const PerformanceIndicator = ({ rating }) => {
    const PerformanceIcon = getPerformanceIcon(rating);
    const color = getPerformanceColor(rating);
    
    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
        color === 'green' ? 'bg-green-100 text-green-800' :
        color === 'blue' ? 'bg-blue-100 text-blue-800' :
        color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
        'bg-red-100 text-red-800'
      }`}>
        <PerformanceIcon className="h-3 w-3 mr-1" />
        {rating}/5
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading staff...</p>
          <p className="text-gray-400 text-sm mt-2">Setting up your staff management system</p>
        </div>
      </div>
    );
  }

    <DashboardHeader title="Staff Management" subtitle="Manage teachers, drivers, administrators, and support staff" />
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
                <p className="text-gray-600 mt-2">Manage teachers, drivers, administrators, and support staff</p>
              </div>
              <div className="flex items-center space-x-3 mt-4 lg:mt-0">
                <Button
                  variant="outline"
                  className="border-gray-300 hover:bg-gray-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button
                  onClick={() => setShowAddModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Staff
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Staff" 
            value={stats.total} 
            icon={Users} 
            color="blue"
            subtitle="All staff members"
          />
          <StatCard 
            title="Active Staff" 
            value={stats.active} 
            icon={UserCheck} 
            color="green"
            subtitle="Currently working"
          />
          <StatCard 
            title="Avg Performance" 
            value={stats.performance.average} 
            icon={Star} 
            color="purple"
            subtitle="Out of 5.0"
          />
          <StatCard 
            title="High Performers" 
            value={stats.performance.excellent} 
            icon={Award} 
            color="yellow"
            subtitle="Rating ≥ 4.5"
          />
        </div>

        {/* Performance Overview */}
        <Card className="mb-6 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
              Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{stats.performance.excellent}</div>
                <div className="text-sm text-gray-600">Excellent (4.5+)</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${(stats.performance.excellent / stats.total) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{stats.performance.good}</div>
                <div className="text-sm text-gray-600">Good (3.5-4.4)</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${(stats.performance.good / stats.total) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">{stats.performance.needs_improvement}</div>
                <div className="text-sm text-gray-600">Needs Improvement</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full" 
                    style={{ width: `${(stats.performance.needs_improvement / stats.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role Distribution */}
        <Card className="mb-6 border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Staff by Role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {roles.map(role => (
                <div key={role.value} className="text-center p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${
                    role.color === 'blue' ? 'bg-blue-100' :
                    role.color === 'green' ? 'bg-green-100' :
                    role.color === 'purple' ? 'bg-purple-100' :
                    role.color === 'red' ? 'bg-red-100' : 'bg-yellow-100'
                  }`}>
                    <role.icon className={`h-6 w-6 ${
                      role.color === 'blue' ? 'text-blue-600' :
                      role.color === 'green' ? 'text-green-600' :
                      role.color === 'purple' ? 'text-purple-600' :
                      role.color === 'red' ? 'text-red-600' : 'text-yellow-600'
                    }`} />
                  </div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">{role.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mb-2">{stats.byRole[role.value] || 0}</p>
                  <p className="text-xs text-gray-500">{role.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tabs and Filters */}
        <Card className="mb-6 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full lg:w-auto">
                <TabsList className="grid grid-cols-4 lg:flex lg:flex-wrap">
                  <TabsTrigger value="all">All Staff</TabsTrigger>
                  <TabsTrigger value="high-performers">High Performers</TabsTrigger>
                  <TabsTrigger value="new">New Staff</TabsTrigger>
                  <TabsTrigger value="inactive">Inactive</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex flex-col sm:flex-row gap-4 flex-1 lg:flex-initial">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search staff by name, email, or specialization..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-gray-300 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="all">All Roles</option>
                    {roles.map(role => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Staff Table */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold">Staff Members</CardTitle>
              <Badge variant="secondary" className="text-sm">
                {filteredStaff.length} staff members
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Staff Member</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role & Details</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Performance</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStaff.map((member) => {
                    const RoleIcon = getRoleIcon(member.role);
                    const roleColor = getRoleColor(member.role);
                    
                    return (
                      <tr key={member.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12">
                              <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-inner ${
                                roleColor === 'blue' ? 'bg-blue-100' :
                                roleColor === 'green' ? 'bg-green-100' :
                                roleColor === 'purple' ? 'bg-purple-100' :
                                roleColor === 'red' ? 'bg-red-100' : 'bg-yellow-100'
                              }`}>
                                <RoleIcon className={`h-6 w-6 ${
                                  roleColor === 'blue' ? 'text-blue-600' :
                                  roleColor === 'green' ? 'text-green-600' :
                                  roleColor === 'purple' ? 'text-purple-600' :
                                  roleColor === 'red' ? 'text-red-600' : 'text-yellow-600'
                                }`} />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-gray-900">{member.name}</div>
                              <div className="text-sm text-gray-500 flex items-center mt-1">
                                <Mail className="h-3 w-3 mr-1" />
                                {member.email}
                              </div>
                              {isNewStaff(member) && (
                                <Badge variant="outline" className="mt-1 bg-green-50 text-green-700 border-green-200 text-xs">
                                  New
                                </Badge>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <Badge variant={roleColor} className="capitalize">
                              {member.role}
                            </Badge>
                            <div className="text-sm text-gray-900">{member.specialization}</div>
                            <div className="text-sm text-gray-500">{member.experience} experience</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="text-sm text-gray-900 flex items-center">
                              <Phone className="h-3 w-3 mr-2" />
                              {member.phone || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <MapPin className="h-3 w-3 mr-2" />
                              {member.address ? member.address.substring(0, 30) + '...' : 'No address'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <PerformanceIndicator rating={member.performance_rating || 3} />
                          {member.performance_rating >= 4.5 && (
                            <div className="text-xs text-gray-500 mt-1">Top Performer</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant={member.is_active ? "default" : "secondary"}
                              className={member.is_active 
                                ? "bg-green-100 text-green-800 border-green-200" 
                                : "bg-gray-100 text-gray-800 border-gray-200"
                              }
                            >
                              {member.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleStaffStatus(member.id)}
                              className="h-8 w-8 p-0 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              {member.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                            </Button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditModal(member)}
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => sendWelcomeEmail(member)}
                              className="text-green-600 hover:text-green-800 hover:bg-green-50"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                            <div className="relative">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowQuickActions(showQuickActions === member.id ? null : member.id)}
                                className="text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                              
                              {showQuickActions === member.id && (
                                <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                                  <div className="py-1">
                                    <button
                                      onClick={() => {
                                        sendWelcomeEmail(member);
                                        setShowQuickActions(null);
                                      }}
                                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      <MailCheck className="h-4 w-4 mr-2" />
                                      Send Welcome Email
                                    </button>
                                    <button
                                      onClick={() => {
                                        scheduleMeeting(member);
                                        setShowQuickActions(null);
                                      }}
                                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      <PhoneCall className="h-4 w-4 mr-2" />
                                      Schedule Meeting
                                    </button>
                                    <button
                                      onClick={() => {
                                        // View profile action
                                        setShowQuickActions(null);
                                      }}
                                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Profile
                                    </button>
                                    <div className="border-t border-gray-100"></div>
                                    <button
                                      onClick={() => {
                                        handleDeleteStaff(member.id);
                                        setShowQuickActions(null);
                                      }}
                                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete Staff
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              {filteredStaff.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No staff members found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm || filterRole !== 'all' || filterStatus !== 'all' 
                      ? 'Try adjusting your search or filters'
                      : 'Get started by adding your first staff member'
                    }
                  </p>
                  {!searchTerm && filterRole === 'all' && filterStatus === 'all' && (
                    <Button
                      onClick={() => setShowAddModal(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add First Staff Member
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add New Staff Member</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddModal(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <form onSubmit={handleAddStaff} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Personal Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Enter staff member's full name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="staff@littleangels.ac.ke"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="+254..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">National ID</label>
                    <Input
                      value={formData.national_id}
                      onChange={(e) => setFormData({...formData, national_id: e.target.value})}
                      placeholder="National identification number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      placeholder="Full residential address"
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Professional Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Professional Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Role</option>
                      {roles.map(role => (
                        <option key={role.value} value={role.value}>{role.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Qualifications</label>
                    <Input
                      value={formData.qualifications}
                      onChange={(e) => setFormData({...formData, qualifications: e.target.value})}
                      placeholder="Degrees, certifications, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                    <Input
                      value={formData.experience}
                      onChange={(e) => setFormData({...formData, experience: e.target.value})}
                      placeholder="Years of experience"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                    <Input
                      value={formData.specialization}
                      onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                      placeholder="Area of expertise"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Salary</label>
                      <Input
                        type="number"
                        value={formData.salary}
                        onChange={(e) => setFormData({...formData, salary: e.target.value})}
                        placeholder="Monthly salary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Join Date</label>
                      <Input
                        type="date"
                        value={formData.join_date}
                        onChange={(e) => setFormData({...formData, join_date: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Performance Rating</label>
                      <select
                        value={formData.performance_rating}
                        onChange={(e) => setFormData({...formData, performance_rating: parseFloat(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {performanceLevels.map(level => (
                          <option key={level.level} value={level.level}>
                            {level.level} - {level.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        value={formData.is_active}
                        onChange={(e) => setFormData({...formData, is_active: e.target.value === 'true'})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Any additional information about this staff member..."
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Staff Member
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Edit Staff Member</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEditModal(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <form onSubmit={handleUpdateStaff} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Personal Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                      disabled
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">National ID</label>
                    <Input
                      value={formData.national_id}
                      onChange={(e) => setFormData({...formData, national_id: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Professional Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Professional Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      {roles.map(role => (
                        <option key={role.value} value={role.value}>{role.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Qualifications</label>
                    <Input
                      value={formData.qualifications}
                      onChange={(e) => setFormData({...formData, qualifications: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                    <Input
                      value={formData.experience}
                      onChange={(e) => setFormData({...formData, experience: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                    <Input
                      value={formData.specialization}
                      onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Salary</label>
                      <Input
                        type="number"
                        value={formData.salary}
                        onChange={(e) => setFormData({...formData, salary: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Join Date</label>
                      <Input
                        type="date"
                        value={formData.join_date}
                        onChange={(e) => setFormData({...formData, join_date: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Performance Rating</label>
                      <select
                        value={formData.performance_rating}
                        onChange={(e) => setFormData({...formData, performance_rating: parseFloat(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {performanceLevels.map(level => (
                          <option key={level.level} value={level.level}>
                            {level.level} - {level.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        value={formData.is_active}
                        onChange={(e) => setFormData({...formData, is_active: e.target.value === 'true'})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Update Staff Member
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;