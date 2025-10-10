import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { TrendingUp, Plus, Save, X } from 'lucide-react';
import { toast } from 'sonner';

export default function StudentResultsPosting() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [academicYear, setAcademicYear] = useState('2024');
  const [term, setTerm] = useState('Term 1');
  const [subject, setSubject] = useState('');
  const [examType, setExamType] = useState('End Term Exam');
  const [marks, setMarks] = useState('');
  const [maxMarks, setMaxMarks] = useState('100');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);

  const subjects = [
    'Mathematics', 'English', 'Kiswahili', 'Science', 'Social Studies',
    'Religious Education', 'Creative Arts', 'Physical Education'
  ];

  const examTypes = [
    'End Term Exam', 'Mid Term Exam', 'C.A.T 1', 'C.A.T 2', 'Assignment'
  ];

  useEffect(() => {
    fetchStudents();
  }, [user]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('teacher_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateGrade = (marks, max) => {
    const percentage = (marks / max) * 100;
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'E';
  };

  const handlePostResult = async (e) => {
    e.preventDefault();
    
    if (!selectedStudent || !subject || !marks) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setPosting(true);
      const marksNum = parseFloat(marks);
      const maxMarksNum = parseFloat(maxMarks);
      const grade = calculateGrade(marksNum, maxMarksNum);

      const { data, error } = await supabase
        .from('student_results')
        .insert({
          student_id: selectedStudent.id,
          teacher_id: user.id,
          subject: subject,
          academic_year: academicYear,
          term: term,
          exam_type: examType,
          marks: marksNum,
          max_marks: maxMarksNum,
          grade: grade,
          remarks: remarks,
          school_id: user.school_id
        })
        .select()
        .single();

      if (error) throw error;

      toast.success(`✅ Results posted for ${selectedStudent.name} - ${subject}: ${grade} (${marksNum}/${maxMarksNum})`);
      
      setSelectedStudent(null);
      setSubject('');
      setMarks('');
      setRemarks('');
    } catch (error) {
      console.error('Error posting results:', error);
      toast.error('Failed to post results');
    } finally {
      setPosting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Post Student Results
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePostResult} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Student *</label>
              <select
                value={selectedStudent?.id || ''}
                onChange={(e) => {
                  const student = students.find(s => s.id === e.target.value);
                  setSelectedStudent(student);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Choose a student</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} - {student.grade} {student.class}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Subject *</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select subject</option>
                {subjects.map((subj) => (
                  <option key={subj} value={subj}>{subj}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Academic Year</label>
              <Input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="2024"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Term</label>
              <select
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Term 1">Term 1</option>
                <option value="Term 2">Term 2</option>
                <option value="Term 3">Term 3</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Exam Type</label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {examTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Marks Obtained *</label>
              <Input
                type="number"
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
                placeholder="85"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Max Marks</label>
              <Input
                type="number"
                value={maxMarks}
                onChange={(e) => setMaxMarks(e.target.value)}
                placeholder="100"
                min="1"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Teacher's Remarks</label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Optional remarks about student's performance..."
              />
            </div>
          </div>

          {selectedStudent && marks && maxMarks && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Preview:</strong> {selectedStudent.name} will receive{' '}
                <strong className="text-lg">{calculateGrade(parseFloat(marks), parseFloat(maxMarks))}</strong>
                {' '}({marks}/{maxMarks}) in {subject}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={posting || !selectedStudent || !subject || !marks}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {posting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Posting...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Post Results
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSelectedStudent(null);
                setSubject('');
                setMarks('');
                setRemarks('');
              }}
            >
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>
          </div>
        </form>

        {loading && (
          <div className="text-center py-8 text-gray-500">
            Loading students...
          </div>
        )}

        {!loading && students.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No students assigned to you yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
