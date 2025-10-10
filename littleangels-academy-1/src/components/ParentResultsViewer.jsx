import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { TrendingUp, TrendingDown, Minus, Award, BarChart3 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

export default function ParentResultsViewer() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [results, setResults] = useState([]);
  const [analytics, setAnalytics] = useState([]);

  useEffect(() => {
    if (user) {
      fetchStudents();
    }
  }, [user]);

  useEffect(() => {
    if (selectedStudent) {
      fetchStudentResults(selectedStudent.id);
      fetchStudentAnalytics(selectedStudent.id);
    }
  }, [selectedStudent]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('parent_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
      
      const studentsList = data || [];
      setStudents(studentsList);
      if (studentsList.length > 0) {
        setSelectedStudent(studentsList[0]);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentResults = async (studentId) => {
    try {
      const { data, error } = await supabase
        .from('student_results')
        .select('*')
        .eq('student_id', studentId)
        .order('posted_at', { ascending: false });

      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error('Error fetching results:', error);
    }
  };

  const fetchStudentAnalytics = async (studentId) => {
    try {
      const { data, error } = await supabase
        .from('result_analytics')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnalytics(data || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const getGradeColor = (grade) => {
    const colors = {
      'A': 'bg-green-500',
      'B': 'bg-blue-500',
      'C': 'bg-yellow-500',
      'D': 'bg-orange-500',
      'E': 'bg-red-500'
    };
    return colors[grade] || 'bg-gray-500';
  };

  const getTrendIcon = (trend) => {
    if (trend === 'improving') return <TrendingUp className="h-5 w-5 text-green-600" />;
    if (trend === 'declining') return <TrendingDown className="h-5 w-5 text-red-600" />;
    return <Minus className="h-5 w-5 text-gray-600" />;
  };

  const subjectPerformanceData = results.reduce((acc, result) => {
    const existing = acc.find(item => item.subject === result.subject);
    if (existing) {
      existing.marks = result.marks;
      existing.maxMarks = result.max_marks;
    } else {
      acc.push({
        subject: result.subject,
        marks: result.marks,
        maxMarks: result.max_marks,
        percentage: (result.marks / result.max_marks) * 100
      });
    }
    return acc;
  }, []);

  const performanceTrendData = analytics.map(analytic => ({
    term: analytic.term,
    average: parseFloat(analytic.average_marks),
    improvement: parseFloat(analytic.improvement_percentage)
  }));

  if (loading) {
    return <div className="text-center py-8">Loading results...</div>;
  }

  if (students.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-gray-500">
            <Award className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>No students found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Student Results & Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          {students.length > 1 && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Select Student</label>
              <select
                value={selectedStudent?.id || ''}
                onChange={(e) => {
                  const student = students.find(s => s.id === e.target.value);
                  setSelectedStudent(student);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} - {student.grade} {student.class}
                  </option>
                ))}
              </select>
            </div>
          )}
        </CardContent>
      </Card>

      {analytics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {analytics[0] && (
                <>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Current Average</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {analytics[0].average_marks?.toFixed(1)}%
                    </p>
                    <Badge className="mt-2">{analytics[0].grade}</Badge>
                  </div>
                  <div className={`p-4 rounded-lg ${
                    analytics[0].trend === 'improving' ? 'bg-green-50' :
                    analytics[0].trend === 'declining' ? 'bg-red-50' : 'bg-gray-50'
                  }`}>
                    <p className="text-sm text-gray-600">Performance Trend</p>
                    <div className="flex items-center gap-2 mt-2">
                      {getTrendIcon(analytics[0].trend)}
                      <p className="text-xl font-bold capitalize">{analytics[0].trend}</p>
                    </div>
                    <p className="text-sm mt-1">
                      {analytics[0].improvement_percentage > 0 ? '+' : ''}
                      {analytics[0].improvement_percentage?.toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Class Rank</p>
                    <p className="text-2xl font-bold text-purple-600">
                      #{analytics[0].class_rank || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {analytics[0].term} - {analytics[0].academic_year}
                    </p>
                  </div>
                </>
              )}
            </div>

            {performanceTrendData.length > 1 && (
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Performance Trend Over Time</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={performanceTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="term" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="average" stroke="#3b82f6" strokeWidth={2} name="Average %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {subjectPerformanceData.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Subject Performance</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={subjectPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="subject" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="percentage" fill="#8b5cf6" name="Percentage %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {results.slice(0, 10).map((result) => (
              <div
                key={result.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 ${getGradeColor(result.grade)} rounded-full flex items-center justify-center text-white font-bold`}>
                      {result.grade}
                    </div>
                    <div>
                      <p className="font-semibold">{result.subject}</p>
                      <p className="text-sm text-gray-600">
                        {result.exam_type} • {result.term} {result.academic_year}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{result.marks}/{result.max_marks}</p>
                  <p className="text-sm text-gray-600">
                    {((result.marks / result.max_marks) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}

            {results.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>No results posted yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
