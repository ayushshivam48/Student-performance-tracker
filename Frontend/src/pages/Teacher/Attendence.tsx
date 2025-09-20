import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, User, BookOpen, CheckCircle, XCircle, AlertCircle, Save, Check } from "lucide-react";
import { format } from "date-fns";
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

interface ApiResult {
  _id?: string;
  student: string | Student;
  course: string;
  semester: string;
  subject: string;
  internal?: number;
  external?: number;
  resultStatus?: string;
}



interface AttendanceState {
  [studentId: string]: 'present' | 'absent';
}

interface TeacherUser {
  _id: string;
  name: string;
  email: string;
  role: string;
}

// Mock API service for demonstration
const mockApi = {
  get: async (url: string) => {
    await new Promise(resolve => setTimeout(resolve, 800));

    if (url.includes('/assignments/filter')) {
      return [
        { course: "B.Tech", semester: "1", subject: "Programming in C", _id: "1" },
        { course: "B.Tech", semester: "2", subject: "Data Structures using C", _id: "2" },
        { course: "BCA", semester: "1", subject: "Programming in C", _id: "3" },
        { course: "BCA", semester: "2", subject: "Data Structures", _id: "4" }
      ];
    }

    if (url.includes('/results/filter')) {
      return [
        { student: { _id: "s1", name: "John Doe", enrollment: "BT2023001" }, course: "B.Tech", semester: "1", subject: "Programming in C" },
        { student: { _id: "s2", name: "Jane Smith", enrollment: "BT2023002" }, course: "B.Tech", semester: "1", subject: "Programming in C" },
        { student: { _id: "s3", name: "Robert Johnson", enrollment: "BT2023003" }, course: "B.Tech", semester: "1", subject: "Programming in C" },
        { student: { _id: "s4", name: "Emily Davis", enrollment: "BT2023004" }, course: "B.Tech", semester: "1", subject: "Programming in C" }
      ];
    }

    return [];
  },

  post: async (_url: string, data: Record<string, unknown>) => {
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
    return { success: true, data };
  }
};

const AttendanceEntry = ({ user }: { user?: TeacherUser }) => {
  const { user: authUser } = useAuthStore();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceState>({});
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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
        setErrorMsg('Error loading assignments. Please try again.');
        setAssignments([]);
        setSelectedAssignment(null);
      } finally {
        setLoadingAssignments(false);
      }
    };
    fetchAssignments();
  }, []);

  useEffect(() => {
    if (!selectedAssignment) {
      setStudents([]);
      setAttendance({});
      return;
    }

    const { course, semester } = selectedAssignment;
    const fetchStudents = async () => {
      setLoadingStudents(true);
      setErrorMsg('');
      try {
        const data = await mockApi.get(`/results/filter?course=${course}&semester=${semester}`) as ApiResult[];
        const uniqueStudents: Student[] = [];
        const studentIds = new Set<string>();

        data.forEach((result: ApiResult) => {
          if (result.student && !studentIds.has(typeof result.student === 'object' ? result.student._id : result.student)) {
            studentIds.add(typeof result.student === 'object' ? result.student._id : result.student);
            uniqueStudents.push(typeof result.student === 'object' ? result.student : { _id: result.student, name: 'Unknown', enrollment: 'Unknown' });
          }
        });

        setStudents(uniqueStudents);
        const defaultAttendance: AttendanceState = {};
        uniqueStudents.forEach((student: Student) => {
          defaultAttendance[student._id] = 'present';
        });
        setAttendance(defaultAttendance);
      } catch {
        setErrorMsg('Error loading students. Please try again.');
        setStudents([]);
        setAttendance({});
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchStudents();
  }, [selectedAssignment]);

  const toggleAttendance = (id: string) => {
    setAttendance((prev: AttendanceState) => ({
      ...prev,
      [id]: prev[id] === 'present' ? 'absent' : 'present'
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment || students.length === 0) return;
    setSaving(true);
    setErrorMsg('');
    setUploadSuccess(false);
    const { course, semester, subject } = selectedAssignment;

    try {
      const promises = students.map(async (student: Student) => {
        const studentId = student._id;
        const status = attendance[studentId] || 'present';
        const payload = {
          student: studentId,
          teacher: user?._id,
          subject,
          course,
          semester,
          date: selectedDate,
          status
        };
        return mockApi.post('/attendance', payload);
      });

      await Promise.all(promises);
      setUploadSuccess(true);

      // Reset success message after 3 seconds
      setTimeout(() => {
        setUploadSuccess(false);
      }, 3000);
    } catch {
      setErrorMsg('❌ Error saving attendance. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const presentCount = Object.values(attendance).filter(status => status === 'present').length;
  const absentCount = students.length - presentCount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex">
        <Sidebar userRole="teacher" userName={authUser?.name || user?.name} />

        <main className="flex-1 p-4 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Calendar className="text-blue-600" />
              </div>
              Attendance Entry
            </h1>
            <div className="bg-white/80 backdrop-blur border border-white/30 rounded-lg px-4 py-2 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <User className="h-4 w-4" />
                <span>{user?.name || "Teacher"}</span>
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {uploadSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2">
              <Check className="h-5 w-5 flex-shrink-0" />
              <span>Attendance successfully uploaded!</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card className="bg-white/90 backdrop-blur border border-white/30 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Select Course
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingAssignments ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-2"></div>
                    <span>Loading courses...</span>
                  </div>
                ) : assignments.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No courses available</p>
                ) : (
                  <div className="space-y-4">
                    <Select
                      value={selectedAssignment ? `${selectedAssignment.course}-${selectedAssignment.semester}-${selectedAssignment.subject}` : ''}
                      onValueChange={(value) => {
                        const assignment = assignments.find(a =>
                          `${a.course}-${a.semester}-${a.subject}` === value
                        );
                        setSelectedAssignment(assignment || null);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                      <SelectContent>
                        {assignments.map((assignment, idx) => (
                          <SelectItem
                            key={idx}
                            value={`${assignment.course}-${assignment.semester}-${assignment.subject}`}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">{assignment.subject}</span>
                              <span className="text-xs text-gray-500">
                                {assignment.course} - Semester {assignment.semester}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {selectedAssignment && (
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-800 mb-2">Selected Course</h3>
                        <div className="space-y-1 text-sm">
                          <p><span className="font-medium">Subject:</span> {selectedAssignment.subject}</p>
                          <p><span className="font-medium">Course:</span> {selectedAssignment.course}</p>
                          <p><span className="font-medium">Semester:</span> {selectedAssignment.semester}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur border border-white/30 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Select Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    max={new Date().toISOString().split('T')[0]}
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Selected: {format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
                </p>
              </CardContent>
            </Card>

            {selectedAssignment && (
              <Card className="bg-white/90 backdrop-blur border border-white/30 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-blue-700">{students.length}</p>
                      <p className="text-sm text-gray-600">Total Students</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-green-700">{presentCount}</p>
                      <p className="text-sm text-gray-600">Present</p>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-amber-700">{absentCount}</p>
                      <p className="text-sm text-gray-600">Absent</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-purple-700">
                        {students.length ? Math.round((presentCount / students.length) * 100) : 0}%
                      </p>
                      <p className="text-sm text-gray-600">Attendance Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <Card className="bg-white/90 backdrop-blur border border-white/30 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Student Attendance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100 text-gray-700">
                        <th className="text-left p-4 rounded-tl-lg">Student Name</th>
                        <th className="text-left p-4">Enrollment</th>
                        <th className="text-left p-4 rounded-tr-lg">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingStudents ? (
                        <tr>
                          <td colSpan={3} className="text-center p-8">
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-2"></div>
                              <span>Loading students...</span>
                            </div>
                          </td>
                        </tr>
                      ) : students.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="text-center p-8 text-gray-500">
                            <User className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                            <p>No students found for this course</p>
                          </td>
                        </tr>
                      ) : (
                        students.map((student: Student) => (
                          <tr
                            key={student._id}
                            className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                          >
                            <td className="p-4 font-medium text-gray-800">{student.name}</td>
                            <td className="p-4 text-gray-600">{student.enrollment}</td>
                            <td className="p-4">
                              <button
                                type="button"
                                onClick={() => toggleAttendance(student._id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all ${
                                  attendance[student._id] === 'present'
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                    : 'bg-red-100 text-red-600 hover:bg-red-200'
                                }`}
                                aria-pressed={attendance[student._id] === 'present'}
                                aria-label={`${attendance[student._id] === 'present' ? 'Mark as absent' : 'Mark as present'} for ${student.name}`}
                              >
                                {attendance[student._id] === 'present' ? (
                                  <>
                                    <CheckCircle className="h-4 w-4" />
                                    Present
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="h-4 w-4" />
                                    Absent
                                  </>
                                )}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-sm text-gray-600">
                    {students.length > 0 && (
                      <p>
                        {presentCount} of {students.length} students marked present ({Math.round((presentCount / students.length) * 100)}%)
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="flex items-center gap-2"
                    disabled={saving || students.length === 0 || loadingStudents}
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Upload Attendance
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default AttendanceEntry;
