// src/pages/admin/Students.jsx
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
  BookOpen,
  Home,
  Heart,
  Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Table } from '../../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from 'sonner';

const StudentsDashboard = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    withTransport: 0,
    byGrade: {}
  });

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    date_of_birth: '',
    grade: '',
    class: '',
    gender: 'male',
    address: '',
    medical_info: '',
    emergency_contact: '',
    parent_name: '',
    parent_phone: '',
    parent_email: '',
    needs_transport: false,
    transport_notes: ''
  });

  const grades = ['PP1', 'PP2', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8'];
  const classes = ['A', 'B', 'C', 'D', 'E'];

  useEffect(() => {
    if (user) {
      fetchStudents();
      fetchStats();
    }
  }, [user]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      console.log('📚 Fetching students for school:', user?.school_id);

      // Simple query without complex joins that might fail
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('school_id', user?.school_id)
        .order('created_at', { ascending: false });

      if (error) {
        // If table doesn't exist, use demo data
        if (error.code === '42P01') {
          console.log('📋 Students table does not exist, using demo data');
          createDemoStudents();
          return;
        }
        throw error;
      }

      console.log(`✅ Fetched ${data?.length || 0} students`);
      setStudents(data || []);

    } catch (error) {
      console.error('❌ Error fetching students:', error);
      
      // If there's any error, fall back to demo data
      if (error.code === '42P01' || error.code === '42703') {
        createDemoStudents();
      } else {
        toast.error('Failed to fetch students');
      }
    } finally {
      setLoading(false);
    }
  };

  // Create demo students for development
  const createDemoStudents = () => {
    console.log('🎭 Creating demo students for development');
    const demoStudents = [
      {
        id: 'demo-1',
        student_id: 'LAS-001',
        name: 'John Mwangi',
        date_of_birth: '2015-03-15',
        grade: 'Grade 3',
        class: 'A',
        gender: 'male',
        address: '123 Main Street, Nairobi',
        parent_name: 'Mary Mwangi',
        parent_phone: '+254712345678',
        parent_email: 'mary.mwangi@email.com',
        medical_info: 'No known allergies',
        emergency_contact: '+254723456789',
        needs_transport: true,
        transport_notes: 'Pick up at main gate',
        is_active: true,
        school_id: user?.school_id || 'demo-school',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'demo-2',
        student_id: 'LAS-002',
        name: 'Sarah Wanjiku',
        date_of_birth: '2016-07-22',
        grade: 'Grade 2',
        class: 'B',
        gender: 'female',
        address: '456 Oak Avenue, Nairobi',
        parent_name: 'James Wanjiku',
        parent_phone: '+254734567890',
        parent_email: 'james.wanjiku@email.com',
        medical_info: 'Asthma - carries inhaler',
        emergency_contact: '+254745678901',
        needs_transport: false,
        transport_notes: '',
        is_active: true,
        school_id: user?.school_id || 'demo-school',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'demo-3',
        student_id: 'LAS-003',
        name: 'David Ochieng',
        date_of_birth: '2014-11-08',
        grade: 'Grade 4',
        class: 'C',
        gender: 'male',
        address: '789 Pine Road, Nairobi',
        parent_name: 'Grace Ochieng',
        parent_phone: '+254756789012',
        parent_email: 'grace.ochieng@email.com',
        medical_info: 'Allergic to peanuts',
        emergency_contact: '+254767890123',
        needs_transport: true,
        transport_notes: 'Early drop-off required',
        is_active: true,
        school_id: user?.school_id || 'demo-school',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    setStudents(demoStudents);
    updateStats(demoStudents);
    setLoading(false);
  };

  const updateStats = (studentList) => {
    const total = studentList.length;
    const active = studentList.filter(s => s.is_active).length;
    const withTransport = studentList.filter(s => s.needs_transport).length;
    
    const byGrade = {};
    studentList.forEach(student => {
      byGrade[student.grade] = (byGrade[student.grade] || 0) + 1;
    });

    setStats({ total, active, withTransport, byGrade });
  };

  const fetchStats = async () => {
    try {
      // For now, calculate stats from local student data
      // This will be updated when we have real data
      updateStats(students);
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Calculate from local students as fallback
      updateStats(students);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    
    // Generate student ID
    const studentId = `LAS-${String(students.length + 1).padStart(3, '0')}`;
    
    try {
      console.log('📝 Adding student:', formData);

      const studentPayload = {
        student_id: studentId,
        name: formData.name,
        date_of_birth: formData.date_of_birth,
        grade: formData.grade,
        class: formData.class,
        gender: formData.gender,
        address: formData.address,
        medical_info: formData.medical_info,
        emergency_contact: formData.emergency_contact,
        parent_name: formData.parent_name,
        parent_phone: formData.parent_phone,
        parent_email: formData.parent_email,
        needs_transport: formData.needs_transport,
        transport_notes: formData.transport_notes,
        school_id: user?.school_id,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Try to insert into database
      if (supabase) {
        const { data, error } = await supabase
          .from('students')
          .insert([studentPayload])
          .select()
          .single();

        if (error) {
          // If database insert fails, add to local state
          console.log('📋 Database insert failed, adding to local state');
          throw new Error('Database not available - using demo mode');
        }

        console.log('✅ Student added to database:', data);
        setStudents(prev => [data, ...prev]);
        
      } else {
        // If supabase not configured, add to local state
        console.log('📋 Supabase not configured, adding to local state');
        const demoStudent = {
          ...studentPayload,
          id: 'demo-' + Date.now()
        };
        setStudents(prev => [demoStudent, ...prev]);
      }

      toast.success('Student added successfully!');
      setShowAddModal(false);
      resetForm();
      fetchStats();

    } catch (error) {
      console.error('❌ Error adding student:', error);
      
      // Add to local state as fallback
      const demoStudent = {
        ...formData,
        id: 'demo-' + Date.now(),
        student_id: studentId,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        _isDemo: true
      };
      
      setStudents(prev => [demoStudent, ...prev]);
      setShowAddModal(false);
      resetForm();
      fetchStats();
      
      toast.success('Student added successfully! (Demo Mode)');
    }
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    try {
      console.log('📝 Updating student:', selectedStudent.id);

      const updatePayload = {
        name: formData.name,
        date_of_birth: formData.date_of_birth,
        grade: formData.grade,
        class: formData.class,
        gender: formData.gender,
        address: formData.address,
        medical_info: formData.medical_info,
        emergency_contact: formData.emergency_contact,
        parent_name: formData.parent_name,
        parent_phone: formData.parent_phone,
        parent_email: formData.parent_email,
        needs_transport: formData.needs_transport,
        transport_notes: formData.transport_notes,
        updated_at: new Date().toISOString()
      };

      // Try to update in database
      if (supabase && !selectedStudent._isDemo) {
        const { error } = await supabase
          .from('students')
          .update(updatePayload)
          .eq('id', selectedStudent.id);

        if (error) throw error;
      }

      // Update local state
      setStudents(prev => 
        prev.map(student => 
          student.id === selectedStudent.id 
            ? { ...student, ...updatePayload }
            : student
        )
      );

      toast.success('Student updated successfully!');
      setShowEditModal(false);
      resetForm();
      fetchStats();

    } catch (error) {
      console.error('❌ Error updating student:', error);
      toast.error('Failed to update student');
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    
    try {
      // Try to delete from database if it's not a demo student
      if (supabase && !studentId.startsWith('demo-')) {
        const { error } = await supabase
          .from('students')
          .delete()
          .eq('id', studentId);

        if (error) throw error;
      }

      // Remove from local state
      setStudents(prev => prev.filter(student => student.id !== studentId));
      toast.success('Student deleted successfully!');
      fetchStats();

    } catch (error) {
      console.error('❌ Error deleting student:', error);
      toast.error('Failed to delete student');
    }
  };

  const toggleStudentStatus = async (studentId) => {
    try {
      const student = students.find(s => s.id === studentId);
      const newStatus = !student.is_active;

      // Try to update in database if it's not a demo student
      if (supabase && !studentId.startsWith('demo-')) {
        const { error } = await supabase
          .from('students')
          .update({ is_active: newStatus, updated_at: new Date().toISOString() })
          .eq('id', studentId);

        if (error) throw error;
      }

      // Update local state
      setStudents(prev => 
        prev.map(student => 
          student.id === studentId 
            ? { ...student, is_active: newStatus }
            : student
        )
      );

      toast.success(`Student ${newStatus ? 'activated' : 'deactivated'} successfully!`);
      fetchStats();

    } catch (error) {
      console.error('❌ Error updating student status:', error);
      toast.error('Failed to update student status');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      date_of_birth: '',
      grade: '',
      class: '',
      gender: 'male',
      address: '',
      medical_info: '',
      emergency_contact: '',
      parent_name: '',
      parent_phone: '',
      parent_email: '',
      needs_transport: false,
      transport_notes: ''
    });
  };

  const openEditModal = (student) => {
    setSelectedStudent(student);
    setFormData({
      name: student.name,
      date_of_birth: student.date_of_birth,
      grade: student.grade,
      class: student.class,
      gender: student.gender,
      address: student.address,
      medical_info: student.medical_info,
      emergency_contact: student.emergency_contact,
      parent_name: student.parent_name,
      parent_phone: student.parent_phone,
      parent_email: student.parent_email,
      needs_transport: student.needs_transport,
      transport_notes: student.transport_notes
    });
    setShowEditModal(true);
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.parent_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = filterGrade === 'all' || student.grade === filterGrade;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && student.is_active) ||
                         (filterStatus === 'inactive' && !student.is_active);
    
    return matchesSearch && matchesGrade && matchesStatus;
  });

  const StatCard = ({ title, value, icon: Icon, color = "blue", subtitle }) => (
    <Card className="p-6 hover:shadow-lg transition-all duration-200 border-0 shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          color === 'blue' ? 'bg-blue-100' :
          color === 'green' ? 'bg-green-100' :
          color === 'purple' ? 'bg-purple-100' : 'bg-yellow-100'
        }`}>
          <Icon className={`h-6 w-6 ${
            color === 'blue' ? 'text-blue-600' :
            color === 'green' ? 'text-green-600' :
            color === 'purple' ? 'text-purple-600' : 'text-yellow-600'
          }`} />
        </div>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading students...</p>
          <p className="text-gray-400 text-sm mt-2">Setting up your student management system</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-bold text-gray-900">Students Management</h1>
                <p className="text-gray-600 mt-2">Manage student records, attendance, and transport assignments</p>
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
                  <Plus className="h-4 w-4 mr-2" />
                  Add Student
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
            title="Total Students" 
            value={stats.total} 
            icon={Users} 
            color="blue"
            subtitle="All registered students"
          />
          <StatCard 
            title="Active Students" 
            value={stats.active} 
            icon={CheckCircle} 
            color="green"
            subtitle="Currently enrolled"
          />
          <StatCard 
            title="With Transport" 
            value={stats.withTransport} 
            icon={Bus} 
            color="purple"
            subtitle="Using school transport"
          />
          <StatCard 
            title="Transport Coverage" 
            value={`${stats.total > 0 ? Math.round((stats.withTransport / stats.total) * 100) : 0}%`} 
            icon={MapPin} 
            color="yellow"
            subtitle="Of total students"
          />
        </div>

        {/* Filters and Search */}
        <Card className="mb-6 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search students by name, ID, or parent..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-gray-300 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <select
                  value={filterGrade}
                  onChange={(e) => setFilterGrade(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="all">All Grades</option>
                  {grades.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
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
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold">Students List</CardTitle>
              <Badge variant="secondary" className="text-sm">
                {filteredStudents.length} students
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Grade/Class</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Parent</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Transport</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-inner">
                              <GraduationCap className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">{student.name}</div>
                            <div className="text-sm text-gray-500 flex items-center mt-1">
                              <BookOpen className="h-3 w-3 mr-1" />
                              ID: {student.student_id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{student.grade}</div>
                        <div className="text-sm text-gray-500">Class {student.class}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{student.parent_name}</div>
                        <div className="text-sm text-gray-500">{student.parent_email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.parent_phone}</div>
                        <div className="text-sm text-gray-500">{student.emergency_contact}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {student.needs_transport ? (
                          <div className="flex items-center">
                            <Bus className="h-4 w-4 text-green-500 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">Assigned</div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">{student.transport_notes}</div>
                            </div>
                          </div>
                        ) : (
                          <Badge variant="outline" className="border-gray-300 text-gray-600">
                            No Transport
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={student.is_active ? "default" : "secondary"}
                            className={student.is_active 
                              ? "bg-green-100 text-green-800 border-green-200" 
                              : "bg-gray-100 text-gray-800 border-gray-200"
                            }
                          >
                            {student.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleStudentStatus(student.id)}
                            className="h-8 w-8 p-0 hover:bg-gray-100"
                          >
                            {student.is_active ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                          </Button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(student)}
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteStudent(student.id)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredStudents.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm || filterGrade !== 'all' || filterStatus !== 'all' 
                      ? 'Try adjusting your search or filters'
                      : 'Get started by adding your first student'
                    }
                  </p>
                  {!searchTerm && filterGrade === 'all' && filterStatus === 'all' && (
                    <Button
                      onClick={() => setShowAddModal(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Student
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add New Student</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddModal(false)}
                className="h-8 w-8 p-0"
              >
                <XCircle className="h-5 w-5" />
              </Button>
            </div>
            
            <form onSubmit={handleAddStudent} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter student's full name"
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                  <Input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({...formData, grade: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Grade</option>
                    {grades.map(grade => (
                      <option key={grade} value={grade}>{grade}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                  <select
                    value={formData.class}
                    onChange={(e) => setFormData({...formData, class: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Class</option>
                    {classes.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Full residential address"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Medical Information</label>
                  <textarea
                    value={formData.medical_info}
                    onChange={(e) => setFormData({...formData, medical_info: e.target.value})}
                    placeholder="Allergies, conditions, medications, etc."
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Parent Name</label>
                  <Input
                    value={formData.parent_name}
                    onChange={(e) => setFormData({...formData, parent_name: e.target.value})}
                    placeholder="Parent/Guardian name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Parent Phone</label>
                  <Input
                    value={formData.parent_phone}
                    onChange={(e) => setFormData({...formData, parent_phone: e.target.value})}
                    placeholder="+254..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Parent Email</label>
                  <Input
                    type="email"
                    value={formData.parent_email}
                    onChange={(e) => setFormData({...formData, parent_email: e.target.value})}
                    placeholder="parent@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
                  <Input
                    value={formData.emergency_contact}
                    onChange={(e) => setFormData({...formData, emergency_contact: e.target.value})}
                    placeholder="Alternative emergency contact"
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.needs_transport}
                      onChange={(e) => setFormData({...formData, needs_transport: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="text-sm font-medium text-gray-700">Needs School Transport</label>
                  </div>
                </div>

                {formData.needs_transport && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Transport Notes</label>
                    <Input
                      value={formData.transport_notes}
                      onChange={(e) => setFormData({...formData, transport_notes: e.target.value})}
                      placeholder="Pickup location, special instructions, etc."
                    />
                  </div>
                )}
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
                  <Plus className="h-4 w-4 mr-2" />
                  Add Student
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Edit Student</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEditModal(false)}
                className="h-8 w-8 p-0"
              >
                <XCircle className="h-5 w-5" />
              </Button>
            </div>
            
            <form onSubmit={handleUpdateStudent} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                  <Input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({...formData, grade: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Grade</option>
                    {grades.map(grade => (
                      <option key={grade} value={grade}>{grade}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                  <select
                    value={formData.class}
                    onChange={(e) => setFormData({...formData, class: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Class</option>
                    {classes.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Medical Information</label>
                  <textarea
                    value={formData.medical_info}
                    onChange={(e) => setFormData({...formData, medical_info: e.target.value})}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Parent Name</label>
                  <Input
                    value={formData.parent_name}
                    onChange={(e) => setFormData({...formData, parent_name: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Parent Phone</label>
                  <Input
                    value={formData.parent_phone}
                    onChange={(e) => setFormData({...formData, parent_phone: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Parent Email</label>
                  <Input
                    type="email"
                    value={formData.parent_email}
                    onChange={(e) => setFormData({...formData, parent_email: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
                  <Input
                    value={formData.emergency_contact}
                    onChange={(e) => setFormData({...formData, emergency_contact: e.target.value})}
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.needs_transport}
                      onChange={(e) => setFormData({...formData, needs_transport: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="text-sm font-medium text-gray-700">Needs School Transport</label>
                  </div>
                </div>

                {formData.needs_transport && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Transport Notes</label>
                    <Input
                      value={formData.transport_notes}
                      onChange={(e) => setFormData({...formData, transport_notes: e.target.value})}
                    />
                  </div>
                )}
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
                  Update Student
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsDashboard;