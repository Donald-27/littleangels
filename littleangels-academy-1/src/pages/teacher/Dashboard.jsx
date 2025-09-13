import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  TrendingUp,
  Bell,
  Eye,
  Plus,
  Edit,
  Download,
  BarChart3,
  GraduationCap,
  User,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from 'sonner';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    attendanceRate: 0,
    upcomingEvents: 0,
    totalAssignments: 0,
    gradedAssignments: 0,
    averageGrade: 0
  });
  
  // New state for grading functionality
  const [subjects, setSubjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [grades, setGrades] = useState([]);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // Form state for new assignments
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    subject_id: '',
    assignment_type: 'homework',
    total_marks: 100,
    due_date: ''
  });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch assigned students
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select(`
          *,
          parent:users!students_parent_id_fkey(name, phone, email),
          route:routes(name, vehicle:vehicles(plate_number, driver:users!vehicles_driver_id_fkey(name, phone)))
        `)
        .eq('teacher_id', user?.id)
        .eq('is_active', true)
        .order('name');

      if (studentsError) throw studentsError;
      setStudents(studentsData || []);

      // Fetch attendance for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select(`
          *,
          student:students(name, grade, class),
          route:routes(name),
          vehicle:vehicles(plate_number)
        `)
        .in('student_id', studentsData?.map(s => s.id) || [])
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (attendanceError) throw attendanceError;
      setAttendance(attendanceData || []);

      // Fetch notifications
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .contains('recipients', [user?.id])
        .order('created_at', { ascending: false })
        .limit(10);

      if (notificationsError) throw notificationsError;
      setNotifications(notificationsData || []);

      // Fetch subjects
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('*')
        .eq('school_id', user?.school_id)
        .eq('is_active', true)
        .order('name');

      if (subjectsError) throw subjectsError;
      setSubjects(subjectsData || []);

      // Fetch assignments created by this teacher
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('assignments')
        .select(`
          *,
          subject:subjects(name, color),
          term:terms(name)
        `)
        .eq('teacher_id', user?.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (assignmentsError) throw assignmentsError;
      setAssignments(assignmentsData || []);

      // Fetch grades for teacher's assignments
      // First get assignment IDs for this teacher, then fetch grades for those assignments
      const assignmentIds = assignmentsData?.map(a => a.id) || [];
      const { data: gradesData, error: gradesError } = assignmentIds.length > 0 ? await supabase
        .from('grades')
        .select(`
          *,
          student:students(name, student_id, grade, class),
          assignment:assignments(title, total_marks, subject:subjects(name, color))
        `)
        .in('assignment_id', assignmentIds)
        .order('graded_at', { ascending: false }) : { data: [], error: null };

      if (gradesError) throw gradesError;
      setGrades(gradesData || []);

      // Calculate enhanced stats
      const today = new Date().toISOString().split('T')[0];
      const todayAttendance = attendanceData?.filter(a => a.date === today) || [];
      const presentToday = todayAttendance.filter(a => a.status === 'present').length;
      
      const totalAttendanceDays = attendanceData?.length || 0;
      const presentDays = attendanceData?.filter(a => a.status === 'present').length || 0;
      const attendanceRate = totalAttendanceDays > 0 ? (presentDays / totalAttendanceDays) * 100 : 0;

      // Calculate grading stats
      const totalAssignments = assignmentsData?.length || 0;
      const totalGrades = gradesData?.length || 0;
      const expectedGrades = totalAssignments * (studentsData?.length || 0);
      const gradingProgress = expectedGrades > 0 ? (totalGrades / expectedGrades) * 100 : 0;
      const averageGrade = gradesData?.length > 0 ? 
        gradesData.reduce((sum, g) => sum + parseFloat(g.marks_obtained), 0) / gradesData.length : 0;

      setStats({
        totalStudents: studentsData?.length || 0,
        presentToday,
        attendanceRate: Math.round(attendanceRate * 100) / 100,
        upcomingEvents: 0,
        totalAssignments,
        gradedAssignments: Math.round(gradingProgress),
        averageGrade: Math.round(averageGrade * 100) / 100
      });

    } catch (error) {
      console.error('Error fetching teacher data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
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
          vehicle_id: null, // Teacher marking attendance at school
          driver_id: null,
          date: today,
          pickup_time: new Date().toISOString(),
          status: status,
          notes: notes,
          school_id: user?.school_id
        }]);

      if (error) throw error;
      
      toast.success(`Attendance marked as ${status}`);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error('Failed to mark attendance');
    }
  };

  // Assignment CRUD Operations
  const createAssignment = async () => {
    try {
      // Validation
      if (!assignmentForm.title.trim()) {
        toast.error('Assignment title is required');
        return;
      }
      if (!assignmentForm.subject_id) {
        toast.error('Please select a subject');
        return;
      }
      if (!assignmentForm.due_date) {
        toast.error('Due date is required');
        return;
      }
      if (assignmentForm.total_marks <= 0) {
        toast.error('Total marks must be greater than 0');
        return;
      }

      let error;
      if (selectedAssignment) {
        // Update existing assignment
        const result = await supabase
          .from('assignments')
          .update({
            title: assignmentForm.title.trim(),
            description: assignmentForm.description.trim(),
            subject_id: assignmentForm.subject_id,
            assignment_type: assignmentForm.assignment_type,
            total_marks: assignmentForm.total_marks,
            due_date: assignmentForm.due_date
          })
          .eq('id', selectedAssignment.id)
          .eq('teacher_id', user?.id);
        error = result.error;
      } else {
        // Create new assignment
        const result = await supabase
          .from('assignments')
          .insert([{
            title: assignmentForm.title.trim(),
            description: assignmentForm.description.trim(),
            subject_id: assignmentForm.subject_id,
            assignment_type: assignmentForm.assignment_type,
            total_marks: assignmentForm.total_marks,
            due_date: assignmentForm.due_date,
            teacher_id: user?.id,
            school_id: user?.school_id,
            is_active: true
          }]);
        error = result.error;
      }

      if (error) throw error;
      
      toast.success(selectedAssignment ? 'Assignment updated successfully' : 'Assignment created successfully');
      setShowAssignmentModal(false);
      setSelectedAssignment(null);
      setAssignmentForm({
        title: '',
        description: '',
        subject_id: '',
        assignment_type: 'homework',
        total_marks: 100,
        due_date: ''
      });
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error saving assignment:', error);
      toast.error(selectedAssignment ? 'Failed to update assignment' : 'Failed to create assignment');
    }
  };

  const updateAssignment = async (assignmentId, updates) => {
    try {
      const { error } = await supabase
        .from('assignments')
        .update(updates)
        .eq('id', assignmentId)
        .eq('teacher_id', user?.id); // Ensure teacher owns this assignment

      if (error) throw error;
      
      toast.success('Assignment updated successfully');
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error updating assignment:', error);
      toast.error('Failed to update assignment');
    }
  };

  const deleteAssignment = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this assignment? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('assignments')
        .update({ is_active: false })
        .eq('id', assignmentId)
        .eq('teacher_id', user?.id); // Ensure teacher owns this assignment

      if (error) throw error;
      
      toast.success('Assignment deleted successfully');
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast.error('Failed to delete assignment');
    }
  };

  // Grading Operations
  const gradeStudent = async (assignmentId, studentId, marksObtained, feedback = '') => {
    try {
      // Validation
      const assignment = assignments.find(a => a.id === assignmentId);
      if (!assignment) {
        toast.error('Assignment not found');
        return;
      }
      
      if (marksObtained < 0 || marksObtained > assignment.total_marks) {
        toast.error(`Marks must be between 0 and ${assignment.total_marks}`);
        return;
      }

      const gradeData = {
        assignment_id: assignmentId,
        student_id: studentId,
        marks_obtained: parseFloat(marksObtained),
        feedback: feedback.trim(),
        graded_at: new Date().toISOString(),
        school_id: user?.school_id
      };

      // Check if grade already exists
      const { data: existingGrade } = await supabase
        .from('grades')
        .select('id')
        .eq('assignment_id', assignmentId)
        .eq('student_id', studentId)
        .single();

      let error;
      if (existingGrade) {
        // Update existing grade
        const { error: updateError } = await supabase
          .from('grades')
          .update(gradeData)
          .eq('id', existingGrade.id);
        error = updateError;
      } else {
        // Create new grade
        const { error: insertError } = await supabase
          .from('grades')
          .insert([gradeData]);
        error = insertError;
      }

      if (error) throw error;
      
      toast.success('Grade saved successfully');
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error saving grade:', error);
      toast.error('Failed to save grade');
    }
  };

  const gradeMultipleStudents = async (grades) => {
    try {
      for (const grade of grades) {
        await gradeStudent(grade.assignmentId, grade.studentId, grade.marksObtained, grade.feedback);
      }
      setShowGradeModal(false);
      setSelectedAssignment(null);
    } catch (error) {
      console.error('Error grading students:', error);
      toast.error('Failed to grade students');
    }
  };

  const StatCard = ({ title, value, icon: Icon, color = "blue", description, trend }) => (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
          {trend && (
            <p className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '+' : ''}{trend}% from last week
            </p>
          )}
        </div>
        <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </Card>
  );

  const getAttendanceStatus = (status) => {
    switch (status) {
      case 'present':
        return { color: 'green', icon: CheckCircle, text: 'Present' };
      case 'absent':
        return { color: 'red', icon: XCircle, text: 'Absent' };
      case 'late':
        return { color: 'yellow', icon: Clock, text: 'Late' };
      case 'early_pickup':
        return { color: 'blue', icon: Clock, text: 'Early Pickup' };
      default:
        return { color: 'gray', icon: AlertTriangle, text: 'Unknown' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
                <p className="text-gray-600 mt-1">Welcome back, {user?.name}</p>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  <BookOpen className="h-3 w-3 mr-1" />
                  {stats.totalStudents} Students
                </Badge>
                <Button variant="outline" size="sm">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications ({notifications.length})
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="My Students" 
            value={stats.totalStudents} 
            icon={Users} 
            color="blue"
            description="Assigned to me"
          />
          <StatCard 
            title="Present Today" 
            value={stats.presentToday} 
            icon={CheckCircle} 
            color="green"
            description={`Out of ${stats.totalStudents} students`}
          />
          <StatCard 
            title="Total Assignments" 
            value={stats.totalAssignments} 
            icon={BookOpen} 
            color="purple"
            description="Created this term"
          />
          <StatCard 
            title="Average Grade" 
            value={`${stats.averageGrade}%`} 
            icon={GraduationCap} 
            color="yellow"
            description={`${stats.gradedAssignments}% graded`}
          />
        </div>

        <Tabs defaultValue="students" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="students">My Students</TabsTrigger>
            <TabsTrigger value="gradebook">Grade Book</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Students ({students.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade/Class</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transport</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {students.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-sm font-medium text-blue-600">
                                    {student.name.split(' ').map(n => n[0]).join('')}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                <div className="text-sm text-gray-500">ID: {student.student_id}</div>
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
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {student.route ? (
                              <div>
                                <div className="text-sm text-gray-900">{student.route.name}</div>
                                <div className="text-sm text-gray-500">
                                  {student.route.vehicle?.plate_number} - {student.route.vehicle?.driver?.name}
                                </div>
                              </div>
                            ) : (
                              <Badge variant="secondary">No Transport</Badge>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              Active
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAttendance(student.id, 'present')}
                                className="text-green-600 hover:text-green-900"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAttendance(student.id, 'absent')}
                                className="text-red-600 hover:text-red-900"
                              >
                                <XCircle className="h-4 w-4" />
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

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Today's Attendance</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {students.map((student) => {
                      const todayRecord = attendance.find(a => 
                        a.student_id === student.id && 
                        a.date === new Date().toISOString().split('T')[0]
                      );
                      const status = todayRecord?.status || 'not_marked';
                      
                      return (
                        <Card key={student.id} className={`p-4 ${
                          status === 'present' ? 'border-green-200 bg-green-50' :
                          status === 'absent' ? 'border-red-200 bg-red-50' :
                          status === 'late' ? 'border-yellow-200 bg-yellow-50' :
                          'border-gray-200'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{student.name}</p>
                              <p className="text-sm text-gray-500">{student.grade} - Class {student.class}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAttendance(student.id, 'present')}
                                className={`text-green-600 hover:text-green-900 ${
                                  status === 'present' ? 'bg-green-100' : ''
                                }`}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAttendance(student.id, 'absent')}
                                className={`text-red-600 hover:text-red-900 ${
                                  status === 'absent' ? 'bg-red-100' : ''
                                }`}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAttendance(student.id, 'late')}
                                className={`text-yellow-600 hover:text-yellow-900 ${
                                  status === 'late' ? 'bg-yellow-100' : ''
                                }`}
                              >
                                <Clock className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          {status !== 'not_marked' && (
                            <div className="mt-2">
                              <Badge variant={getAttendanceStatus(status).color}>
                                {getAttendanceStatus(status).text}
                              </Badge>
                            </div>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Attendance Records</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {attendance.slice(0, 20).map((record) => {
                          const statusInfo = getAttendanceStatus(record.status);
                          return (
                            <tr key={record.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(record.date).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {record.student?.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge variant={statusInfo.color} className="flex items-center w-fit">
                                  <statusInfo.icon className="h-3 w-3 mr-1" />
                                  {statusInfo.text}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {record.pickup_time ? new Date(record.pickup_time).toLocaleTimeString() : 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {record.notes || '-'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Attendance Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Total Students</span>
                      <span className="text-2xl font-bold text-gray-900">{stats.totalStudents}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Present Today</span>
                      <span className="text-2xl font-bold text-green-600">{stats.presentToday}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Absent Today</span>
                      <span className="text-2xl font-bold text-red-600">{stats.totalStudents - stats.presentToday}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Attendance Rate</span>
                      <span className="text-2xl font-bold text-blue-600">{stats.attendanceRate}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Download className="h-5 w-5 mr-2" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Export Attendance Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="h-4 w-4 mr-2" />
                      View Monthly Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Generate Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Grade Book Tab */}
          <TabsContent value="gradebook" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Grade Book</h3>
                <p className="text-gray-600">View and manage student grades across all assignments</p>
              </div>
              <Button onClick={() => setShowGradeModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Grade Assignment
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Student Grades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignment</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Graded</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {grades.map((grade) => (
                        <tr key={grade.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-xs font-medium text-blue-600">
                                    {grade.student?.name?.split(' ').map(n => n[0]).join('')}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">{grade.student?.name}</div>
                                <div className="text-sm text-gray-500">{grade.student?.grade} {grade.student?.class}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {grade.assignment?.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge 
                              variant="secondary" 
                              className="text-xs"
                              style={{ backgroundColor: `${grade.assignment?.subject?.color}20`, color: grade.assignment?.subject?.color }}
                            >
                              {grade.assignment?.subject?.name}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                            {grade.marks_obtained}/{grade.assignment?.total_marks}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className={`text-sm font-medium ${
                                (grade.marks_obtained / grade.assignment?.total_marks) * 100 >= 80 ? 'text-green-600' :
                                (grade.marks_obtained / grade.assignment?.total_marks) * 100 >= 60 ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {Math.round((grade.marks_obtained / grade.assignment?.total_marks) * 100)}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(grade.graded_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
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

          {/* Assignments Tab */}
          <TabsContent value="assignments" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">My Assignments</h3>
                <p className="text-gray-600">Create and manage assignments for your students</p>
              </div>
              <Button onClick={() => setShowAssignmentModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Assignment
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assignments.map((assignment) => (
                <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{assignment.title}</CardTitle>
                      <Badge 
                        variant="secondary"
                        style={{ backgroundColor: `${assignment.subject?.color}20`, color: assignment.subject?.color }}
                      >
                        {assignment.subject?.name}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">{assignment.description}</p>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Type:</span>
                        <Badge variant="outline" className="capitalize">
                          {assignment.assignment_type}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Total Marks:</span>
                        <span className="font-medium">{assignment.total_marks}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Due Date:</span>
                        <span className="font-medium">
                          {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'No due date'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Graded:</span>
                        <span className="font-medium">
                          {grades.filter(g => g.assignment_id === assignment.id).length} / {students.length}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2 pt-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => {
                            setSelectedAssignment(assignment);
                            setShowGradeModal(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Grade
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedAssignment(assignment);
                            setAssignmentForm({
                              title: assignment.title,
                              description: assignment.description,
                              subject_id: assignment.subject_id,
                              assignment_type: assignment.assignment_type,
                              total_marks: assignment.total_marks,
                              due_date: assignment.due_date
                            });
                            setShowAssignmentModal(true);
                          }}
                          title="Edit Assignment"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteAssignment(assignment.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Assignment"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {assignments.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Assignments Yet</h3>
                <p className="text-gray-600 mb-4">Create your first assignment to start grading students</p>
                <Button onClick={() => setShowAssignmentModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Assignment
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div key={notification.id} className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex-shrink-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            notification.type === 'info' ? 'bg-blue-100' :
                            notification.type === 'warning' ? 'bg-yellow-100' :
                            notification.type === 'success' ? 'bg-green-100' :
                            notification.type === 'error' ? 'bg-red-100' : 'bg-gray-100'
                          }`}>
                            <Bell className={`h-4 w-4 ${
                              notification.type === 'info' ? 'text-blue-600' :
                              notification.type === 'warning' ? 'text-yellow-600' :
                              notification.type === 'success' ? 'text-green-600' :
                              notification.type === 'error' ? 'text-red-600' : 'text-gray-600'
                            }`} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(notification.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <Badge variant="secondary" className="capitalize">
                            {notification.type}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Notifications</h3>
                      <p className="text-gray-500">You're all caught up! No new notifications.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Assignment Creation/Edit Modal */}
      {showAssignmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedAssignment ? 'Edit Assignment' : 'Create New Assignment'}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowAssignmentModal(false);
                  setSelectedAssignment(null);
                  setAssignmentForm({
                    title: '',
                    description: '',
                    subject_id: '',
                    assignment_type: 'homework',
                    total_marks: 100,
                    due_date: ''
                  });
                }}
              >
                ×
              </Button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); createAssignment(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assignment Title *
                </label>
                <input
                  type="text"
                  value={assignmentForm.title}
                  onChange={(e) => setAssignmentForm({...assignmentForm, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter assignment title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={assignmentForm.description}
                  onChange={(e) => setAssignmentForm({...assignmentForm, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Assignment description (optional)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <select
                  value={assignmentForm.subject_id}
                  onChange={(e) => setAssignmentForm({...assignmentForm, subject_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assignment Type
                </label>
                <select
                  value={assignmentForm.assignment_type}
                  onChange={(e) => setAssignmentForm({...assignmentForm, assignment_type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="homework">Homework</option>
                  <option value="quiz">Quiz</option>
                  <option value="test">Test</option>
                  <option value="exam">Exam</option>
                  <option value="project">Project</option>
                  <option value="activity">Activity</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Marks *
                </label>
                <input
                  type="number"
                  value={assignmentForm.total_marks}
                  onChange={(e) => setAssignmentForm({...assignmentForm, total_marks: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="1000"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date *
                </label>
                <input
                  type="date"
                  value={assignmentForm.due_date}
                  onChange={(e) => setAssignmentForm({...assignmentForm, due_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              
              <div className="flex items-center space-x-3 pt-4">
                <Button type="submit" className="flex-1">
                  {selectedAssignment ? 'Update Assignment' : 'Create Assignment'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowAssignmentModal(false);
                    setSelectedAssignment(null);
                    setAssignmentForm({
                      title: '',
                      description: '',
                      subject_id: '',
                      assignment_type: 'homework',
                      total_marks: 100,
                      due_date: ''
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grading Modal */}
      {showGradeModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Grade Assignment: {selectedAssignment.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedAssignment.subject?.name} • Total Marks: {selectedAssignment.total_marks}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowGradeModal(false);
                  setSelectedAssignment(null);
                }}
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-4">
              {students.map((student) => {
                const existingGrade = grades.find(g => 
                  g.assignment_id === selectedAssignment.id && g.student_id === student.id
                );
                
                return (
                  <div key={student.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-600">
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          <div className="text-xs text-gray-500">{student.grade} {student.class}</div>
                        </div>
                      </div>
                      {existingGrade && (
                        <Badge variant="secondary">
                          Graded: {existingGrade.marks_obtained}/{selectedAssignment.total_marks}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Marks Obtained (out of {selectedAssignment.total_marks})
                        </label>
                        <input
                          type="number"
                          defaultValue={existingGrade?.marks_obtained || ''}
                          min="0"
                          max={selectedAssignment.total_marks}
                          step="0.5"
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Enter marks"
                          id={`marks-${student.id}`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Feedback (optional)
                        </label>
                        <input
                          type="text"
                          defaultValue={existingGrade?.feedback || ''}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Add feedback"
                          id={`feedback-${student.id}`}
                        />
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const marksInput = document.getElementById(`marks-${student.id}`);
                          const feedbackInput = document.getElementById(`feedback-${student.id}`);
                          
                          if (!marksInput.value) {
                            toast.error('Please enter marks for ' + student.name);
                            return;
                          }
                          
                          gradeStudent(
                            selectedAssignment.id, 
                            student.id, 
                            parseFloat(marksInput.value), 
                            feedbackInput.value
                          );
                        }}
                        className="w-full"
                      >
                        {existingGrade ? 'Update Grade' : 'Save Grade'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="flex items-center space-x-3 pt-6 border-t border-gray-200">
              <Button 
                onClick={() => {
                  setShowGradeModal(false);
                  setSelectedAssignment(null);
                }}
                variant="outline"
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;