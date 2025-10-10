import React, { useState, useEffect, useMemo, useCallback } from 'react';
import DashboardHeader from '../../components/DashboardHeader';
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
  MapPin,
  MessageCircle,
  FileText,
  Settings,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  Zap,
  Sparkles,
  Crown,
  Award,
  Target,
  PieChart,
  LineChart,
  BarChart,
  Battery,
  Wifi,
  BatteryCharging,
  Cloud,
  Sun,
  CloudRain,
  Thermometer,
  Star,
  Heart,
  Rocket,
  Timer,
  BatteryLow,
  Filter,
  Search,
  MoreVertical,
  Upload,
  DownloadCloud,
  QrCode,
  Shield,
  Lock,
  Unlock,
  Send,
  Smartphone
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';
import { toast } from 'sonner';
import FloatingChat from '../../components/FloatingChat';

// Simple chart components for teacher metrics
const LineChartSimple = ({ data, color = "#3b82f6", height = 80, title }) => {
  if (!data || data.length === 0) return (
    <div className="h-full flex items-center justify-center text-gray-400">
      <div className="text-center">
        <TrendingUp className="h-6 w-6 mx-auto mb-1 opacity-50" />
        <p className="text-xs">No data available</p>
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
      {title && <p className="text-gray-600 text-xs mb-1 font-medium">{title}</p>}
      <svg width="100%" height={height} viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    </div>
  );
};

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [realTimeData, setRealTimeData] = useState({
    lastUpdate: new Date(),
    systemStatus: 'operational',
    activeClasses: 0,
    pendingTasks: 0
  });
  const [teacherStats, setTeacherStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    attendanceRate: 0,
    upcomingEvents: 0,
    totalAssignments: 0,
    gradedAssignments: 0,
    averageGrade: 0,
    teachingHours: 0,
    parentEngagement: 0,
    studentPerformance: 0,
    resourceUtilization: 0,
    classAverage: 0
  });
  
  // Enhanced state for comprehensive educational features
  const [subjects, setSubjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [grades, setGrades] = useState([]);
  const [classSchedule, setClassSchedule] = useState([]);
  const [learningResources, setLearningResources] = useState([]);
  const [parentCommunications, setParentCommunications] = useState([]);
  const [quickActions, setQuickActions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [expandedSections, setExpandedSections] = useState({});
  const [selectedTab, setSelectedTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('30d');
  
  // Modal states
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [showCommunicationModal, setShowCommunicationModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedResource, setSelectedResource] = useState(null);
  
  // Form states
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    subject_id: '',
    assignment_type: 'homework',
    total_marks: 100,
    due_date: '',
    instructions: '',
    attachments: []
  });

  const [resourceForm, setResourceForm] = useState({
    title: '',
    description: '',
    subject_id: '',
    resource_type: 'document',
    file_url: '',
    access_level: 'class'
  });

  const [communicationForm, setCommunicationForm] = useState({
    student_id: '',
    message: '',
    priority: 'normal',
    communication_type: 'general'
  });

  // Real-time data subscription
  useEffect(() => {
    if (!user?.id) return;

    const subscription = supabase
      .channel('teacher-dashboard')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          tables: ['attendance', 'notifications', 'assignments', 'grades', 'communications'],
          filter: `teacher_id=eq.${user.id}`
        },
        (payload) => {
          // Refresh data for significant changes
          if (['INSERT', 'UPDATE', 'DELETE'].includes(payload.eventType)) {
            fetchData();
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id]);

  // Real-time status polling
  useEffect(() => {
    const pollRealTimeData = () => {
      setRealTimeData(prev => ({
        ...prev,
        lastUpdate: new Date(),
        activeClasses: Math.floor(Math.random() * 3) + 1,
        pendingTasks: Math.floor(Math.random() * 5) + 2
      }));
    };

    const interval = setInterval(pollRealTimeData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchData();
  }, [user, timeRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      
      // Fetch comprehensive teacher data
      const [
        studentsRes,
        attendanceRes,
        notificationsRes,
        subjectsRes,
        assignmentsRes,
        gradesRes,
        scheduleRes,
        resourcesRes,
        communicationsRes,
        schoolInfoRes
      ] = await Promise.all([
        // Fetch assigned students with comprehensive data
        supabase
          .from('students')
          .select(`
            *,
            parent:users!students_parent_id_fkey(
              name, 
              phone, 
              email,
              profile_picture,
              preferred_language
            ),
            route:routes(
              name, 
              description,
              vehicle:vehicles(
                plate_number, 
                make, 
                model,
                driver:users!vehicles_driver_id_fkey(name, phone)
              )
            ),
            emergency_contacts(*),
            medical_info(*),
            learning_style(*),
            previous_grades(*)
          `)
          .eq('teacher_id', user?.id)
          .eq('is_active', true)
          .order('name', { ascending: true }),

        // Fetch attendance with detailed analytics
        supabase
          .from('attendance')
          .select(`
            *,
            student:students(name, grade, class, photo_url),
            route:routes(name),
            vehicle:vehicles(plate_number),
            trip:trips(start_time, end_time, actual_duration)
          `)
          .in('student_id', students.map(s => s.id).length > 0 ? 
            students.map(s => s.id) : [''])
          .gte('date', getDateRange().startDate.toISOString().split('T')[0])
          .order('date', { ascending: false })
          .limit(200),

        // Fetch notifications with enhanced filtering
        supabase
          .from('notifications')
          .select('*')
          .contains('recipients', [user?.id])
          .or(`target_audience.cs.{teachers},target_audience.is.null`)
          .order('created_at', { ascending: false })
          .limit(20),

        // Fetch subjects with curriculum data
        supabase
          .from('subjects')
          .select(`
            *,
            curriculum:curriculums(*),
            resources:learning_resources(count)
          `)
          .eq('school_id', user?.school_id)
          .eq('is_active', true)
          .order('name', { ascending: true }),

        // Fetch assignments with submission data
        supabase
          .from('assignments')
          .select(`
            *,
            subject:subjects(name, color, code),
            term:terms(name, start_date, end_date),
            submissions:assignment_submissions(count),
            grades:grades(count)
          `)
          .eq('teacher_id', user?.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false }),

        // Fetch comprehensive grade data
        supabase
          .from('grades')
          .select(`
            *,
            student:students(name, student_id, grade, class, photo_url),
            assignment:assignments(
              title, 
              total_marks, 
              subject:subjects(name, color),
              assignment_type
            )
          `)
          .in('assignment_id', assignments.map(a => a.id).length > 0 ? 
            assignments.map(a => a.id) : [''])
          .order('graded_at', { ascending: false })
          .limit(500),

        // Fetch class schedule
        supabase
          .from('class_schedule')
          .select(`
            *,
            subject:subjects(name, color),
            classroom:classrooms(name, location)
          `)
          .eq('teacher_id', user?.id)
          .gte('date', new Date().toISOString().split('T')[0])
          .order('start_time', { ascending: true })
          .limit(20),

        // Fetch learning resources
        supabase
          .from('learning_resources')
          .select(`
            *,
            subject:subjects(name, color),
            teacher:users(name)
          `)
          .eq('teacher_id', user?.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(50),

        // Fetch parent communications
        supabase
          .from('communications')
          .select(`
            *,
            student:students(name, grade, class),
            parent:users(name, phone),
            teacher:users(name)
          `)
          .eq('teacher_id', user?.id)
          .order('created_at', { ascending: false })
          .limit(50),

        // Fetch school information
        supabase
          .from('schools')
          .select('*')
          .eq('id', user?.school_id)
          .single()
      ]);

      const studentsData = studentsRes.data || [];
      const attendanceData = attendanceRes.data || [];
      const notificationsData = notificationsRes.data || [];
      const subjectsData = subjectsRes.data || [];
      const assignmentsData = assignmentsRes.data || [];
      const gradesData = gradesRes.data || [];
      const scheduleData = scheduleRes.data || [];
      const resourcesData = resourcesRes.data || [];
      const communicationsData = communicationsRes.data || [];
      const schoolInfo = schoolInfoRes.data || {};

      setStudents(studentsData);
      setAttendance(attendanceData);
      setNotifications(notificationsData);
      setSubjects(subjectsData);
      setAssignments(assignmentsData);
      setGrades(gradesData);
      setClassSchedule(scheduleData);
      setLearningResources(resourcesData);
      setParentCommunications(communicationsData);

      // Calculate comprehensive teacher statistics
      const today = new Date().toISOString().split('T')[0];
      const todayAttendance = attendanceData.filter(a => a.date === today);
      const presentToday = todayAttendance.filter(a => a.status === 'present').length;
      
      const totalAttendanceDays = attendanceData.length;
      const presentDays = attendanceData.filter(a => a.status === 'present').length;
      const attendanceRate = totalAttendanceDays > 0 ? (presentDays / totalAttendanceDays) * 100 : 0;

      // Enhanced grading statistics
      const totalAssignments = assignmentsData.length;
      const totalGrades = gradesData.length;
      const expectedGrades = totalAssignments * studentsData.length;
      const gradingProgress = expectedGrades > 0 ? (totalGrades / expectedGrades) * 100 : 0;
      
      const averageGrade = gradesData.length > 0 ? 
        gradesData.reduce((sum, g) => sum + parseFloat(g.marks_obtained), 0) / gradesData.length : 0;

      // Calculate class average
      const studentAverages = studentsData.map(student => {
        const studentGrades = gradesData.filter(g => g.student_id === student.id);
        return studentGrades.length > 0 ? 
          studentGrades.reduce((sum, g) => sum + (g.marks_obtained / g.assignment.total_marks * 100), 0) / studentGrades.length : 0;
      });
      const classAverage = studentAverages.length > 0 ? 
        studentAverages.reduce((sum, avg) => sum + avg, 0) / studentAverages.length : 0;

      // Calculate teaching hours (mock calculation based on schedule)
      const teachingHours = scheduleData.reduce((hours, session) => {
        if (session.start_time && session.end_time) {
          const start = new Date(session.start_time);
          const end = new Date(session.end_time);
          return hours + (end - start) / (1000 * 60 * 60);
        }
        return hours;
      }, 0);

      // Calculate parent engagement (based on communications)
      const parentEngagement = studentsData.length > 0 ? 
        (new Set(communicationsData.map(c => c.parent_id)).size / studentsData.length) * 100 : 0;

      // Calculate student performance (based on grade trends)
      const studentPerformance = classAverage;

      // Calculate resource utilization
      const resourceUtilization = studentsData.length > 0 ? 
        (resourcesData.length / studentsData.length) * 10 : 0; // Normalized metric

      setTeacherStats({
        totalStudents: studentsData.length,
        presentToday,
        attendanceRate: Math.round(attendanceRate * 100) / 100,
        upcomingEvents: scheduleData.filter(s => new Date(s.date) >= new Date()).length,
        totalAssignments,
        gradedAssignments: Math.round(gradingProgress),
        averageGrade: Math.round(averageGrade * 100) / 100,
        teachingHours: Math.round(teachingHours),
        parentEngagement: Math.round(parentEngagement * 100) / 100,
        studentPerformance: Math.round(studentPerformance * 100) / 100,
        resourceUtilization: Math.round(resourceUtilization * 100) / 100,
        classAverage: Math.round(classAverage * 100) / 100
      });

      // Generate quick actions based on current state
      generateQuickActions(studentsData, assignmentsData, communicationsData);
      
      // Generate alerts based on students, assignments, and schedule
      generateAlerts(studentsData, attendanceData, assignmentsData, scheduleData);

    } catch (error) {
      console.error('Error fetching teacher data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getDateRange = () => {
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
  };

  const generateQuickActions = (studentsData, assignmentsData, communicationsData) => {
    const hasUngradedAssignments = assignmentsData.some(a => 
      a.grades?.count < studentsData.length
    );
    const hasUnreadCommunications = communicationsData.some(c => !c.read_by_teacher);
    const hasUpcomingClasses = classSchedule.some(s => 
      new Date(s.date) >= new Date()
    );

    const actions = [
      {
        id: 'take-attendance',
        title: 'Take Attendance',
        description: 'Mark today\'s student attendance',
        icon: CheckCircle,
        color: 'green',
        path: '/teacher/attendance',
        available: true,
        urgent: studentsData.length > 0
      },
      {
        id: 'create-assignment',
        title: 'Create Assignment',
        description: 'Create new learning assignment',
        icon: BookOpen,
        color: 'blue',
        path: '/teacher/assignments/new',
        available: true
      },
      {
        id: 'grade-assignments',
        title: 'Grade Assignments',
        description: 'Review and grade student work',
        icon: GraduationCap,
        color: 'purple',
        path: '/teacher/gradebook',
        available: true,
        urgent: hasUngradedAssignments
      },
      {
        id: 'message-parents',
        title: 'Message Parents',
        description: 'Communicate with student parents',
        icon: MessageCircle,
        color: 'orange',
        path: '/teacher/communications',
        available: true,
        urgent: hasUnreadCommunications
      },
      {
        id: 'upload-resource',
        title: 'Upload Resource',
        description: 'Share learning materials',
        icon: Upload,
        color: 'indigo',
        path: '/teacher/resources/new',
        available: true
      },
      {
        id: 'view-schedule',
        title: 'View Schedule',
        description: 'Check upcoming classes',
        icon: Calendar,
        color: 'red',
        path: '/teacher/schedule',
        available: true,
        urgent: hasUpcomingClasses
      }
    ];

    setQuickActions(actions.filter(action => action.available));
  };

  const generateAlerts = (studentsData, attendanceData, assignmentsData, scheduleData) => {
    const alerts = [];

    // Attendance alerts
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = attendanceData.filter(a => a.date === today);
    
    studentsData.forEach(student => {
      const studentTodayAttendance = todayAttendance.find(a => a.student_id === student.id);
      if (!studentTodayAttendance || studentTodayAttendance.status === 'absent') {
        alerts.push({
          id: `attendance-${student.id}`,
          type: 'warning',
          title: 'Attendance Concern',
          message: `${student.name} is absent today`,
          priority: 'medium',
          studentId: student.id
        });
      }
    });

    // Assignment grading alerts
    assignmentsData.forEach(assignment => {
      const gradedCount = grades.filter(g => g.assignment_id === assignment.id).length;
      if (gradedCount < studentsData.length && new Date(assignment.due_date) < new Date()) {
        alerts.push({
          id: `grading-${assignment.id}`,
          type: 'error',
          title: 'Assignment Grading Overdue',
          message: `${assignment.title} needs to be graded`,
          priority: 'high',
          assignmentId: assignment.id
        });
      }
    });

    // Schedule alerts
    const now = new Date();
    const upcomingClasses = scheduleData.filter(session => 
      new Date(session.date + 'T' + session.start_time) > now &&
      new Date(session.date + 'T' + session.start_time) < new Date(now.getTime() + 30 * 60 * 1000) // Next 30 minutes
    );
    
    upcomingClasses.forEach(session => {
      alerts.push({
        id: `schedule-${session.id}`,
        type: 'info',
        title: 'Upcoming Class',
        message: `${session.subject?.name} starts soon`,
        priority: 'medium',
        sessionId: session.id
      });
    });

    // Student performance alerts
    studentsData.forEach(student => {
      const studentGrades = grades.filter(g => g.student_id === student.id);
      if (studentGrades.length > 0) {
        const average = studentGrades.reduce((sum, g) => sum + (g.marks_obtained / g.assignment.total_marks * 100), 0) / studentGrades.length;
        if (average < 60) {
          alerts.push({
            id: `performance-${student.id}`,
            type: 'warning',
            title: 'Student Performance',
            message: `${student.name} is struggling academically`,
            priority: 'medium',
            studentId: student.id
          });
        }
      }
    });

    setAlerts(alerts);
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
          vehicle_id: null,
          driver_id: null,
          date: today,
          pickup_time: new Date().toISOString(),
          status: status,
          notes: notes,
          school_id: user?.school_id,
          marked_by: user?.id,
          marked_by_role: 'teacher'
        }], {
          onConflict: 'student_id,date'
        });

      if (error) throw error;
      
      // Send notification to parent if marked absent
      if (status === 'absent' && student?.parent) {
        // In production, integrate with notification service
        console.log(`Notifying parent of ${student.name} about absence`);
      }
      
      toast.success(`${student?.name} marked as ${status}`);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error('Failed to mark attendance');
    }
  };

  // Enhanced Assignment Management
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
            due_date: assignmentForm.due_date,
            instructions: assignmentForm.instructions.trim(),
            updated_at: new Date().toISOString()
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
            instructions: assignmentForm.instructions.trim(),
            teacher_id: user?.id,
            school_id: user?.school_id,
            is_active: true,
            created_at: new Date().toISOString()
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
        due_date: '',
        instructions: '',
        attachments: []
      });
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error saving assignment:', error);
      toast.error(selectedAssignment ? 'Failed to update assignment' : 'Failed to create assignment');
    }
  };

  // Enhanced Grading System
  const gradeStudent = async (assignmentId, studentId, marksObtained, feedback = '') => {
    try {
      const assignment = assignments.find(a => a.id === assignmentId);
      if (!assignment) {
        toast.error('Assignment not found');
        return;
      }
      
      if (marksObtained < 0 || marksObtained > assignment.total_marks) {
        toast.error(`Marks must be between 0 and ${assignment.total_marks}`);
        return;
      }

      const percentage = (marksObtained / assignment.total_marks) * 100;
      const gradeData = {
        assignment_id: assignmentId,
        student_id: studentId,
        marks_obtained: parseFloat(marksObtained),
        percentage: Math.round(percentage * 100) / 100,
        feedback: feedback.trim(),
        graded_at: new Date().toISOString(),
        graded_by: user?.id,
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

  // Learning Resource Management
  const saveLearningResource = async () => {
    try {
      if (!resourceForm.title.trim()) {
        toast.error('Resource title is required');
        return;
      }
      if (!resourceForm.subject_id) {
        toast.error('Please select a subject');
        return;
      }

      let error;
      if (selectedResource) {
        // Update existing resource
        const result = await supabase
          .from('learning_resources')
          .update({
            title: resourceForm.title.trim(),
            description: resourceForm.description.trim(),
            subject_id: resourceForm.subject_id,
            resource_type: resourceForm.resource_type,
            file_url: resourceForm.file_url.trim(),
            access_level: resourceForm.access_level,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedResource.id)
          .eq('teacher_id', user?.id);
        error = result.error;
      } else {
        // Create new resource
        const result = await supabase
          .from('learning_resources')
          .insert([{
            title: resourceForm.title.trim(),
            description: resourceForm.description.trim(),
            subject_id: resourceForm.subject_id,
            resource_type: resourceForm.resource_type,
            file_url: resourceForm.file_url.trim(),
            access_level: resourceForm.access_level,
            teacher_id: user?.id,
            school_id: user?.school_id,
            is_active: true,
            created_at: new Date().toISOString()
          }]);
        error = result.error;
      }

      if (error) throw error;
      
      toast.success(selectedResource ? 'Resource updated successfully' : 'Resource created successfully');
      setShowResourceModal(false);
      setSelectedResource(null);
      setResourceForm({
        title: '',
        description: '',
        subject_id: '',
        resource_type: 'document',
        file_url: '',
        access_level: 'class'
      });
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error saving resource:', error);
      toast.error(selectedResource ? 'Failed to update resource' : 'Failed to create resource');
    }
  };

  // Parent Communication
  const sendCommunication = async () => {
    try {
      if (!communicationForm.student_id) {
        toast.error('Please select a student');
        return;
      }
      if (!communicationForm.message.trim()) {
        toast.error('Message is required');
        return;
      }

      const student = students.find(s => s.id === communicationForm.student_id);
      
      const { error } = await supabase
        .from('communications')
        .insert([{
          student_id: communicationForm.student_id,
          parent_id: student?.parent_id,
          teacher_id: user?.id,
          message: communicationForm.message.trim(),
          priority: communicationForm.priority,
          communication_type: communicationForm.communication_type,
          school_id: user?.school_id,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;
      
      toast.success('Message sent to parent successfully');
      setShowCommunicationModal(false);
      setCommunicationForm({
        student_id: '',
        message: '',
        priority: 'normal',
        communication_type: 'general'
      });
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error sending communication:', error);
      toast.error('Failed to send message');
    }
  };

  const StatCard = ({ title, value, icon: Icon, color = "blue", description, trend, glow = false, onClick }) => (
    <Card 
      className={`p-6 hover:shadow-lg transition-all duration-300 cursor-pointer border-2 ${
        glow ? `border-${color}-200 bg-${color}-50` : 'border-gray-200'
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
                {trend > 0 ? <TrendingUp size={14} /> : <TrendingUp size={14} className="transform rotate-180" />}
                <span className="text-xs font-medium ml-1">{Math.abs(trend)}%</span>
              </div>
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
        <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
      </div>
    </Card>
  );

  const RealTimeStatus = () => (
    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-gray-700">System: Operational</span>
        </div>
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4 text-blue-500" />
          <span className="text-sm text-gray-600">{realTimeData.activeClasses} active classes</span>
        </div>
        <div className="flex items-center space-x-2">
          <Bell className="h-4 w-4 text-orange-500" />
          <span className="text-sm text-gray-600">{realTimeData.pendingTasks} pending tasks</span>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs text-gray-500">Last update</p>
        <p className="text-sm font-medium text-gray-700">
          {realTimeData.lastUpdate.toLocaleTimeString()}
        </p>
      </div>
    </div>
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading your teacher dashboard...</p>
          <p className="text-gray-500 text-sm mt-2">Preparing your classroom tools and analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
    <DashboardHeader title="Teacher Dashboard" subtitle="Manage your students and classroom activities" />
      {/* Enhanced Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
                  <p className="text-gray-600 mt-1">Welcome back, {user?.name}!
                    <span className="ml-2 text-blue-600">
                      • Teaching {teacherStats.totalStudents} Students
                    </span>
                  </p>
                </div>
                <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-700">Live Updates</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 border border-blue-200">
                  <BookOpen className="h-3 w-3 mr-1" />
                  {teacherStats.totalStudents} Students
                </Badge>
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
                  onClick={fetchData}
                  variant="outline"
                  size="sm"
                  disabled={refreshing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Real-time Status Bar */}
        <RealTimeStatus />

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-6">
          <StatCard 
            title="My Students" 
            value={teacherStats.totalStudents} 
            icon={Users} 
            color="blue"
            description="In my classes"
            glow
          />
          <StatCard 
            title="Class Average" 
            value={`${teacherStats.classAverage}%`} 
            icon={GraduationCap} 
            color="purple"
            description="Overall performance"
            trend={2.5}
          />
          <StatCard 
            title="Parent Engagement" 
            value={`${teacherStats.parentEngagement}%`} 
            icon={MessageCircle} 
            color="green"
            description="Communication rate"
          />
          <StatCard 
            title="Teaching Hours" 
            value={teacherStats.teachingHours} 
            icon={Clock} 
            color="orange"
            description="This week"
          />
        </div>

        {/* Secondary Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Present Today" 
            value={teacherStats.presentToday} 
            icon={CheckCircle} 
            color="green"
            description={`${Math.round((teacherStats.presentToday / teacherStats.totalStudents) * 100)}% attendance`}
          />
          <StatCard 
            title="Assignments" 
            value={teacherStats.totalAssignments} 
            icon={BookOpen} 
            color="blue"
            description={`${teacherStats.gradedAssignments}% graded`}
          />
          <StatCard 
            title="Resources" 
            value={learningResources.length} 
            icon={FileText} 
            color="indigo"
            description="Learning materials"
          />
          <StatCard 
            title="Performance" 
            value={`${teacherStats.studentPerformance}%`} 
            icon={TrendingUp} 
            color="yellow"
            description="Student success rate"
          />
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center">
              <PieChart className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Students
            </TabsTrigger>
            <TabsTrigger value="gradebook" className="flex items-center">
              <GraduationCap className="h-4 w-4 mr-2" />
              Grade Book
            </TabsTrigger>
            <TabsTrigger value="assignments" className="flex items-center">
              <BookOpen className="h-4 w-4 mr-2" />
              Assignments
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Resources
            </TabsTrigger>
            <TabsTrigger value="communications" className="flex items-center">
              <MessageCircle className="h-4 w-4 mr-2" />
              Communications
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          {selectedTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Quick Actions */}
                <div className="lg:col-span-1">
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                      <Zap className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div className="space-y-4">
                      {quickActions.map((action) => (
                        <QuickActionCard
                          key={action.id}
                          title={action.title}
                          description={action.description}
                          icon={action.icon}
                          color={action.color}
                          urgent={action.urgent}
                          onClick={() => window.location.href = action.path}
                        />
                      ))}
                    </div>
                  </Card>

                  {/* Alerts Panel */}
                  {alerts.length > 0 && (
                    <Card className="p-6 mt-6 border-red-200 bg-red-50">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-red-800">Important Alerts</h2>
                        <Badge variant="destructive">{alerts.length}</Badge>
                      </div>
                      <div className="space-y-3">
                        {alerts.slice(0, 3).map((alert) => (
                          <div key={alert.id} className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-red-200">
                            <AlertTriangle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                              alert.priority === 'high' ? 'text-red-600' : 'text-yellow-600'
                            }`} />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{alert.title}</p>
                              <p className="text-sm text-gray-700">{alert.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Today's Schedule */}
                  <Card className="p-6 mt-6">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Calendar className="h-5 w-5 mr-2" />
                        Today's Schedule
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {classSchedule.filter(session => 
                          session.date === new Date().toISOString().split('T')[0]
                        ).map((session) => (
                          <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">{session.subject?.name}</p>
                              <p className="text-sm text-gray-600">
                                {session.start_time} - {session.end_time}
                              </p>
                              <p className="text-xs text-gray-500">{session.classroom?.name}</p>
                            </div>
                            <Badge variant="outline">
                              {session.session_type}
                            </Badge>
                          </div>
                        ))}
                        {classSchedule.filter(session => 
                          session.date === new Date().toISOString().split('T')[0]
                        ).length === 0 && (
                          <p className="text-center text-gray-500 py-4">No classes scheduled for today</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Analytics & Recent Activity */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Performance Analytics */}
                  <Card className="p-6">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Class Performance Analytics</span>
                        <Badge variant="outline">Real-time</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="text-center">
                          <LineChartSimple 
                            data={[
                              {value: 75}, {value: 78}, {value: 82}, 
                              {value: 85}, {value: teacherStats.classAverage}
                            ]}
                            color="#10b981"
                            height={80}
                          />
                          <p className="text-sm font-medium text-gray-900 mt-2">Class Average</p>
                          <p className="text-xs text-gray-600">Trending up</p>
                        </div>
                        <div className="text-center">
                          <LineChartSimple 
                            data={[
                              {value: 88}, {value: 85}, {value: 90}, 
                              {value: 92}, {value: teacherStats.attendanceRate}
                            ]}
                            color="#3b82f6"
                            height={80}
                          />
                          <p className="text-sm font-medium text-gray-900 mt-2">Attendance</p>
                          <p className="text-xs text-gray-600">This month</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Student Activity */}
                  <Card className="p-6">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Recent Student Activity</span>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View All
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {students.slice(0, 5).map((student) => {
                          const recentGrades = grades
                            .filter(g => g.student_id === student.id)
                            .slice(0, 3);
                          const recentAttendance = attendance
                            .filter(a => a.student_id === student.id)
                            .slice(0, 2);

                          return (
                            <div key={student.id} className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-gray-50">
                              <div className="flex-shrink-0">
                                {student.photo_url ? (
                                  <img className="h-10 w-10 rounded-full" src={student.photo_url} alt={student.name} />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span className="text-sm font-medium text-blue-600">
                                      {student.name.split(' ').map(n => n[0]).join('')}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 truncate">{student.name}</h4>
                                <div className="flex items-center space-x-2 mt-1">
                                  {recentGrades.map((grade, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {grade.assignment?.subject?.name}: {grade.percentage}%
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Assignment Progress */}
                  <Card className="p-6">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BookOpen className="h-5 w-5 mr-2" />
                        Assignment Progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {assignments.slice(0, 3).map((assignment) => {
                          const gradedCount = grades.filter(g => g.assignment_id === assignment.id).length;
                          const progress = (gradedCount / students.length) * 100;
                          
                          return (
                            <div key={assignment.id} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-900 truncate">
                                  {assignment.title}
                                </span>
                                <span className="text-sm text-gray-600">
                                  {gradedCount}/{students.length}
                                </span>
                              </div>
                              <Progress value={progress} className="h-2" />
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                                <span>{Math.round(progress)}% graded</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* Students Tab - Enhanced with analytics */}
          <TabsContent value="students" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">My Students</h3>
                <p className="text-gray-600">Manage and track student progress and performance</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {students.map((student) => {
                const studentGrades = grades.filter(g => g.student_id === student.id);
                const averageGrade = studentGrades.length > 0 ? 
                  studentGrades.reduce((sum, g) => sum + g.percentage, 0) / studentGrades.length : 0;
                const attendanceRate = attendance.filter(a => 
                  a.student_id === student.id && a.status === 'present'
                ).length / attendance.filter(a => a.student_id === student.id).length * 100;

                return (
                  <Card key={student.id} className="hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        {student.photo_url ? (
                          <img className="h-12 w-12 rounded-full" src={student.photo_url} alt={student.name} />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-lg font-medium text-blue-600">
                              {student.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                        )}
                        <div>
                          <CardTitle className="text-lg">{student.name}</CardTitle>
                          <p className="text-sm text-gray-500">
                            {student.grade} - Class {student.class}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Student ID</span>
                          <span className="font-medium">{student.student_id}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Average Grade</span>
                          <span className={`font-medium ${
                            averageGrade >= 80 ? 'text-green-600' :
                            averageGrade >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {Math.round(averageGrade)}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Attendance</span>
                          <span className="font-medium">{Math.round(attendanceRate)}%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Parent</span>
                          <span className="font-medium">{student.parent?.name}</span>
                        </div>
                      </div>
                      
                      {student.medical_info?.allergies && (
                        <div className="pt-3 border-t">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Medical Alert</span>
                            <Badge variant="outline" className="bg-red-50 text-red-700">
                              Allergies
                            </Badge>
                          </div>
                        </div>
                      )}

                      <div className="flex space-x-2 pt-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => {
                            setSelectedStudent(student);
                            setShowCommunicationModal(true);
                          }}
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Message
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-1" />
                          Profile
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Grade Book Tab - Enhanced with analytics */}
          <TabsContent value="gradebook" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Grade Book</h3>
                <p className="text-gray-600">Comprehensive grading and performance tracking</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button onClick={() => setShowGradeModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Grade Assignment
                </Button>
                <Button variant="outline">
                  <DownloadCloud className="h-4 w-4 mr-2" />
                  Export Grades
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Student Grades Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                        {subjects.slice(0, 5).map((subject) => (
                          <th key={subject.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {subject.name}
                          </th>
                        ))}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {students.map((student) => {
                        const studentGrades = grades.filter(g => g.student_id === student.id);
                        const subjectAverages = subjects.map(subject => {
                          const subjectGrades = studentGrades.filter(g => g.assignment?.subject?.id === subject.id);
                          return subjectGrades.length > 0 ? 
                            subjectGrades.reduce((sum, g) => sum + g.percentage, 0) / subjectGrades.length : null;
                        });
                        const overallAverage = subjectAverages.filter(avg => avg !== null).length > 0 ?
                          subjectAverages.filter(avg => avg !== null).reduce((sum, avg) => sum + avg, 0) / 
                          subjectAverages.filter(avg => avg !== null).length : 0;

                        return (
                          <tr key={student.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-8 w-8">
                                  {student.photo_url ? (
                                    <img className="h-8 w-8 rounded-full" src={student.photo_url} alt={student.name} />
                                  ) : (
                                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                      <span className="text-xs font-medium text-blue-600">
                                        {student.name.split(' ').map(n => n[0]).join('')}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                  <div className="text-sm text-gray-500">{student.grade} {student.class}</div>
                                </div>
                              </div>
                            </td>
                            {subjectAverages.slice(0, 5).map((average, index) => (
                              <td key={index} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {average !== null ? (
                                  <span className={`font-medium ${
                                    average >= 80 ? 'text-green-600' :
                                    average >= 60 ? 'text-yellow-600' : 'text-red-600'
                                  }`}>
                                    {Math.round(average)}%
                                  </span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                            ))}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`text-sm font-medium ${
                                overallAverage >= 80 ? 'text-green-600' :
                                overallAverage >= 60 ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {Math.round(overallAverage)}%
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <LineChartSimple 
                                data={[
                                  {value: 75}, {value: 78}, {value: 82}, 
                                  {value: 85}, {value: overallAverage}
                                ]}
                                color="#10b981"
                                height={30}
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <Button variant="ghost" size="sm">
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

          {/* Assignments Tab - Enhanced with submission tracking */}
          <TabsContent value="assignments" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Assignments</h3>
                <p className="text-gray-600">Create, manage, and track student assignments</p>
              </div>
              <Button onClick={() => setShowAssignmentModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Assignment
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assignments.map((assignment) => {
                const gradedCount = grades.filter(g => g.assignment_id === assignment.id).length;
                const progress = (gradedCount / students.length) * 100;
                const isOverdue = new Date(assignment.due_date) < new Date();
                
                return (
                  <Card key={assignment.id} className="hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg truncate">{assignment.title}</CardTitle>
                        <Badge 
                          variant="secondary"
                          style={{ backgroundColor: `${assignment.subject?.color}20`, color: assignment.subject?.color }}
                        >
                          {assignment.subject?.name}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-gray-600 line-clamp-2">{assignment.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Due Date</span>
                          <span className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                            {new Date(assignment.due_date).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Type</span>
                          <Badge variant="outline" className="capitalize">
                            {assignment.assignment_type}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Total Marks</span>
                          <span className="font-medium">{assignment.total_marks}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Grading Progress</span>
                          <span className="font-medium">{Math.round(progress)}%</span>
                        </div>
                        
                        <Progress value={progress} className="h-2" />
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
                          {gradedCount > 0 ? 'Continue Grading' : 'Start Grading'}
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
                              due_date: assignment.due_date,
                              instructions: assignment.instructions,
                              attachments: assignment.attachments || []
                            });
                            setShowAssignmentModal(true);
                          }}
                          title="Edit Assignment"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            {assignments.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Assignments Yet</h3>
                <p className="text-gray-600 mb-6">Create your first assignment to start tracking student progress</p>
                <Button onClick={() => setShowAssignmentModal(true)} size="lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Assignment
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Learning Resources</h3>
                <p className="text-gray-600">Share educational materials with your students</p>
              </div>
              <Button onClick={() => setShowResourceModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Resource
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {learningResources.map((resource) => (
                <Card key={resource.id} className="hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg truncate">{resource.title}</CardTitle>
                      <Badge variant="outline" className="capitalize">
                        {resource.resource_type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600 line-clamp-3">{resource.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Subject</span>
                        <Badge 
                          variant="secondary"
                          style={{ backgroundColor: `${resource.subject?.color}20`, color: resource.subject?.color }}
                        >
                          {resource.subject?.name}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Access</span>
                        <Badge variant="outline" className="capitalize">
                          {resource.access_level}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Created</span>
                        <span className="font-medium">
                          {new Date(resource.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 pt-3">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Communications Tab */}
          <TabsContent value="communications" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Parent Communications</h3>
                <p className="text-gray-600">Stay connected with student parents and guardians</p>
              </div>
              <Button onClick={() => setShowCommunicationModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Message
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Communications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {parentCommunications.map((communication) => (
                    <div key={communication.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          communication.priority === 'high' ? 'bg-red-100' :
                          communication.priority === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
                        }`}>
                          <MessageCircle className={`h-4 w-4 ${
                            communication.priority === 'high' ? 'text-red-600' :
                            communication.priority === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                          }`} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900">
                            {communication.student?.name} • {communication.parent?.name}
                          </h4>
                          <Badge variant="secondary" className="capitalize">
                            {communication.communication_type}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{communication.message}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(communication.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {parentCommunications.length === 0 && (
                    <div className="text-center py-8">
                      <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Communications Yet</h3>
                      <p className="text-gray-500">Start a conversation with student parents</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

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

      {/* Assignment Modal */}
      {showAssignmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
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
                    due_date: '',
                    instructions: '',
                    attachments: []
                  });
                }}
              >
                ×
              </Button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); createAssignment(); }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  placeholder="Assignment description and objectives"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instructions & Guidelines
                </label>
                <textarea
                  value={assignmentForm.instructions}
                  onChange={(e) => setAssignmentForm({...assignmentForm, instructions: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Detailed instructions for students..."
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
                      due_date: '',
                      instructions: '',
                      attachments: []
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
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
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
                        {student.photo_url ? (
                          <img className="h-10 w-10 rounded-full" src={student.photo_url} alt={student.name} />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {student.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                        )}
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

      {/* Communication Modal */}
      {showCommunicationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Message Parent</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowCommunicationModal(false);
                  setCommunicationForm({
                    student_id: '',
                    message: '',
                    priority: 'normal',
                    communication_type: 'general'
                  });
                }}
              >
                ×
              </Button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); sendCommunication(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Student *
                </label>
                <select
                  value={communicationForm.student_id}
                  onChange={(e) => setCommunicationForm({...communicationForm, student_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Choose a student</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} • Parent: {student.parent?.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  value={communicationForm.message}
                  onChange={(e) => setCommunicationForm({...communicationForm, message: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Type your message to the parent..."
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={communicationForm.priority}
                    onChange={(e) => setCommunicationForm({...communicationForm, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={communicationForm.communication_type}
                    onChange={(e) => setCommunicationForm({...communicationForm, communication_type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="general">General</option>
                    <option value="academic">Academic</option>
                    <option value="behavior">Behavior</option>
                    <option value="attendance">Attendance</option>
                    <option value="achievement">Achievement</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 pt-4">
                <Button type="submit" className="flex-1">
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowCommunicationModal(false);
                    setCommunicationForm({
                      student_id: '',
                      message: '',
                      priority: 'normal',
                      communication_type: 'general'
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
      {/* Floating Chat - WhatsApp-like messaging */}
      <FloatingChat />
    </div>
  );
};

export default TeacherDashboard;