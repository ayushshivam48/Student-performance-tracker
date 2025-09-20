import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Save,
  Users,
  AlertCircle
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Sidebar from "@/components/shared/Sidebar";
import { useAuthStore } from "@/store/auth";

interface Assignment {
  _id?: string;
  course: string;
  semester: string;
  subject: string;
  teacherId?: string;
  teacherName?: string;
}

interface Student {
  _id: string;
  name: string;
  enrollment: string;
  course?: string;
  semester?: string;
  currentSemester?: string;
  subject?: string;
}

interface Result {
  _id?: string;
  student: string | Student;
  course: string;
  semester: string;
  subject: string;
  internal?: number;
  external?: number;
  resultStatus?: string;
}

interface GradesState {
  [studentId: string]: {
    internal: number | string;
    external: number | string;
  };
}

// Mock API service with persistent storage
// eslint-disable-next-line prefer-const
let mockResultsStore: Result[] = [
  {
    _id: "r1",
    student: "s1",
    course: "B.Tech",
    semester: "1",
    subject: "Programming in C",
    internal: 8.5,
    external: 7.0
  },
  {
    _id: "r2",
    student: "s2",
    course: "B.Tech",
    semester: "1",
    subject: "Programming in C",
    internal: 9.0,
    external: 8.5
  },
  {
    _id: "r3",
    student: "s3",
    course: "B.Tech",
    semester: "2",
    subject: "Data Structures using C",
    internal: 7.5,
    external: 8.0
  }
];

const mockApi = {
  get: async (url: string): Promise<Assignment[] | Result[]> => {
    await new Promise(resolve => setTimeout(resolve, 800));

    if (url.includes('/assignments/filter')) {
      return [
        { _id: "1", course: "B.Tech", semester: "1", subject: "Programming in C" },
        { _id: "2", course: "B.Tech", semester: "2", subject: "Data Structures using C" },
        { _id: "3", course: "BCA", semester: "1", subject: "Programming in C" },
        { _id: "4", course: "BCA", semester: "2", subject: "Data Structures" }
      ];
    }

    if (url.includes('/results/filter') || url.includes('/results?')) {
      // Mock results based on filters
      const queryString = url.split('?')[1];
      if (!queryString) return mockResultsStore;

      const params = new URLSearchParams(queryString);
      const course = params.get('course');
      const semester = params.get('semester');
      const subject = params.get('subject');
      const student = params.get('student');

      // Filter results based on query parameters
      let filteredResults = mockResultsStore;

      if (course) {
        filteredResults = filteredResults.filter(r => r.course === course);
      }
      if (semester) {
        filteredResults = filteredResults.filter(r => r.semester === semester);
      }
      if (subject) {
        filteredResults = filteredResults.filter(r => r.subject === subject);
      }
      if (student) {
        filteredResults = filteredResults.filter(r => r.student === student);
      }

      return filteredResults;
    }

    return [];
  },

  put: async (url: string, data: Record<string, unknown>) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const id = url.split('/').pop();
    const index = mockResultsStore.findIndex(r => r._id === id);
    if (index !== -1) {
      mockResultsStore[index] = { ...mockResultsStore[index], ...data } as Result;
      return mockResultsStore[index];
    }
    return { ...data, _id: id };
  },

  post: async (_url: string, data: Record<string, unknown>) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newResult: Result = {
      ...(data as unknown as Result),
      _id: Math.random().toString(36).substr(2, 9)
    };
    mockResultsStore.push(newResult);
    return newResult;
  }
};

const GradeEntry = () => {
  const { user } = useAuthStore();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [students, setStudents] = useState<Student[]>([
    { _id: "s1", name: "John Doe", enrollment: "BT2023001" },
    { _id: "s2", name: "Jane Smith", enrollment: "BT2023002" },
    { _id: "s3", name: "Robert Johnson", enrollment: "BT2023003" },
    { _id: "s4", name: "Emily Davis", enrollment: "BT2023004" },
    { _id: "s5", name: "Michael Wilson", enrollment: "BCA2023001" }
  ]);
  const [grades, setGrades] = useState<GradesState>({});
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchAssignments = async () => {
      setLoadingAssignments(true);
      setErrorMsg('');
      try {
        const data = await mockApi.get('/assignments/filter');
        const assignmentsData = Array.isArray(data) ? data : [];
        setAssignments(assignmentsData);
        setSelectedAssignment(assignmentsData[0] ?? null);
      } catch {
        setAssignments([]);
        setSelectedAssignment(null);
        setErrorMsg('Error loading assignments.');
      } finally {
        setLoadingAssignments(false);
      }
    };
    fetchAssignments();
  }, []);

  useEffect(() => {
    if (!selectedAssignment) {
      setStudents([]);
      setGrades({});
      return;
    }

    const { course, semester } = selectedAssignment;
    const fetchGrades = async () => {
      setLoadingGrades(true);
      setErrorMsg('');
      setSuccessMsg('');

      try {
        const response = await mockApi.get(`/results/filter?course=${course}&semester=${semester}`);
        const data: Result[] = Array.isArray(response) ? response as Result[] : [];
        const studentIds = new Set<string>();
        const resultMap: {[key: string]: {internal: number | string; external: number | string}} = {};

        data.forEach((result: Result) => {
          const student = result.student;
          const studentId = typeof student === 'object' ? student._id : student;

          if (student && !studentIds.has(studentId)) {
            studentIds.add(studentId);
            resultMap[studentId] = {
              internal: (result.internal ?? '').toString(),
              external: (result.external ?? '').toString()
            };
          }
        });

        // Use static students array and filter by studentIds
        const uniqueStudents = [
          { _id: "s1", name: "John Doe", enrollment: "BT2023001" },
          { _id: "s2", name: "Jane Smith", enrollment: "BT2023002" },
          { _id: "s3", name: "Robert Johnson", enrollment: "BT2023003" },
          { _id: "s4", name: "Emily Davis", enrollment: "BT2023004" },
          { _id: "s5", name: "Michael Wilson", enrollment: "BCA2023001" }
        ].filter(student => studentIds.has(student._id));

        setStudents(uniqueStudents);
        const defaultGrades: GradesState = {};

        uniqueStudents.forEach((student: Student) => {
          const studentId = student._id;
          defaultGrades[studentId] = {
            internal: resultMap[studentId]?.internal ?? '',
            external: resultMap[studentId]?.external ?? '',
          };
        });

        setGrades(defaultGrades);
      } catch {
        setStudents([]);
        setGrades({});
        setErrorMsg('Error loading student grades.');
      } finally {
        setLoadingGrades(false);
      }
    };
    fetchGrades();
  }, [selectedAssignment]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>, studentId: string, field: 'internal' | 'external') => {
    const value = e.target.value;
    if (value === '') {
      setGrades((prev: GradesState) => ({
        ...prev,
        [studentId]: { ...prev[studentId], [field]: '' }
      }));
      return;
    }

    const numeric = parseFloat(value);
    if (isNaN(numeric)) {
      setGrades((prev: GradesState) => ({
        ...prev,
        [studentId]: { ...prev[studentId], [field]: '' }
      }));
      return;
    }

    const clampedValue = Math.min(Math.max(numeric, 0), 10);
    setGrades((prev: GradesState) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: clampedValue }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment || students.length === 0) return;
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    const { course, semester, subject } = selectedAssignment;

    try {
      const promises = students.map(async (student: Student) => {
        const studentId = student._id;
        const internalValue = grades[studentId]?.internal;
        const externalValue = grades[studentId]?.external;

        const internal = typeof internalValue === 'number' ? internalValue : parseFloat(internalValue as string || '0');
        const external = typeof externalValue === 'number' ? externalValue : parseFloat(externalValue as string || '0');

        const existingResults: Result[] = (await mockApi.get(`/results/filter?course=${course}&semester=${semester}&subject=${subject}&student=${studentId}`)) as Result[];
        const existingResult = existingResults.length > 0 ? existingResults[0] : null;

        const payload = {
          student: studentId,
          course,
          semester,
          subject,
          internal,
          external,
          resultStatus: internal >= 4 && external >= 4 ? 'Pass' : 'Fail'
        };

        if (existingResult && existingResult._id) {
          return mockApi.put(`/results/${existingResult._id}`, payload);
        } else {
          return mockApi.post('/results', payload);
        }
      });

      await Promise.all(promises);
      setSuccessMsg('✅ Grades saved successfully!');
    } catch {
      setErrorMsg('❌ Error saving grades.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="flex">
        <Sidebar userRole="teacher" userName={user?.name} />

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              Grade Entry Panel
            </h1>
            <p className="text-gray-600 mt-2">Enter and manage student grades for your courses</p>
          </div>

          {errorMsg && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorMsg}</AlertDescription>
            </Alert>
          )}

          {successMsg && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Success</AlertTitle>
              <AlertDescription className="text-green-700">{successMsg}</AlertDescription>
            </Alert>
          )}

          <Card className="mb-6 bg-white/90 backdrop-blur border border-white/30 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Select Course
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="assignment-select" className="text-gray-700">
                  Choose a course, semester, and subject to enter grades
                </Label>
                {loadingAssignments ? (
                  <p className="text-gray-500">Loading assignments...</p>
                ) : (
                  <Select
                    value={selectedAssignment ? selectedAssignment._id || '' : ''}
                    onValueChange={(value) => {
                      const assignment = assignments.find(a => a._id === value);
                      setSelectedAssignment(assignment || null);
                    }}
                  >
                    <SelectTrigger id="assignment-select" className="bg-white">
                      <SelectValue placeholder="Select course, semester, subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {assignments.map((a) => (
                        <SelectItem key={a._id} value={a._id || ''}>
                          {a.course} – Semester {a.semester} – {a.subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit}>
            <Card className="bg-white/90 backdrop-blur border border-white/30 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Student Grades
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Enter internal and external grades (0-10) for each student
                </p>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Student Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Enrollment</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Internal (0–10)</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">External (0–10)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingGrades ? (
                        <tr>
                          <td colSpan={4} className="text-center py-8 text-gray-500">
                            <div className="flex flex-col items-center justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                              Loading student grades...
                            </div>
                          </td>
                        </tr>
                      ) : students.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center py-8 text-gray-500">
                            <Users className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                            No students found for this course.
                          </td>
                        </tr>
                      ) : (
                        students.map((student: Student) => {
                          const studentGrades = grades[student._id] || { internal: '', external: '' };
                          const internalValue = studentGrades.internal;
                          const externalValue = studentGrades.external;

                          return (
                            <tr key={student._id} className="border-b border-gray-100 hover:bg-gray-50/50">
                              <td className="py-3 px-4 font-medium">{student.name}</td>
                              <td className="py-3 px-4">
                                <Badge variant="outline">{student.enrollment}</Badge>
                              </td>
                              <td className="py-3 px-4">
                                <Input
                                  type="number"
                                  min="0"
                                  max="10"
                                  step="0.1"
                                  value={internalValue}
                                  onChange={(e) => handleInput(e, student._id, 'internal')}
                                  className="w-24 bg-white"
                                  aria-label={`Internal grade for ${student.name}`}
                                />
                              </td>
                              <td className="py-3 px-4">
                                <Input
                                  type="number"
                                  min="0"
                                  max="10"
                                  step="0.1"
                                  value={externalValue}
                                  onChange={(e) => handleInput(e, student._id, 'external')}
                                  className="w-24 bg-white"
                                  aria-label={`External grade for ${student.name}`}
                                />
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 flex justify-end">
              <Button
                type="submit"
                disabled={saving || students.length === 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Grades
                  </>
                )}
              </Button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default GradeEntry;
