import { useEffect, useState, useCallback } from "react";
import { User, LogOut } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

import Sidebar from "@/components/shared/Sidebar";
import { useAuthStore } from "@/store/auth";
import api from "@/lib/api";
import { btechSubjectsBySemester, bcaSubjectsBySemester } from "@/lib/constants";

// Helper function to get subjects for a specific course and semester
const getSubjectsForSemester = (course: string, semester: number): string[] => {
  const subjectsData = course === 'B.Tech' ? btechSubjectsBySemester : bcaSubjectsBySemester;
  return subjectsData[semester as keyof typeof subjectsData] || [];
};



interface Student {
  _id: string;
  name: string;
  email: string;
  course?: string;
  enrollment?: string;
  dob?: string;
  phone?: string;
  address?: string;
  currentSemester?: number;
  sgpaHistory?: number[];
}



interface Result {
  subject: string;
  internal: number | null;
  external: number | null;
  semester: number;
}

interface Announcement {
  message: string;
  date?: string;
  createdAt?: string;
  semester?: number;
  subject?: string;
}

interface TimetableEntry {
  subjectName?: string;
  subject?: string;
  teacher?: string;
  semester: number;
}

interface WeeklyTimetable {
  [day: string]: {
    [timeSlot: string]: TimetableEntry;
  };
}

interface Attendance {
  subject: string;
  percentage: number;
  semester: number;
}

interface Subject {
  _id: string;
  name: string;
  code?: string;
  course: string;
  semester: number;
}

// Removed unused helper functions to fix eslint errors



const StudentDashboard = () => {
  const { user } = useAuthStore();
  const [student, setStudent] = useState<Student | null>(null);

  const [results, setResults] = useState<Result[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sgpaHistory, setSgpaHistory] = useState<number[]>([]);
  const [weeklyTimetable, setWeeklyTimetable] = useState<WeeklyTimetable>({});
  const [loadingTimetable, setLoadingTimetable] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [maxSemester, setMaxSemester] = useState<number>(8);

  const fetchData = useCallback(async () => {
    // Redirect to login if user is not authenticated
    if (!user) {
      window.location.href = '/login';
      return;
    }

    if (user.role !== 'student') {
      setError("Access denied. This dashboard is for students only. Please log in as a student.");
      setLoading(false);
      return;
    }

    if (!user?._id) {
      setError("User not authenticated. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // First fetch student data
      const studentData = await api.get<Student>(`/students/${user._id}`);
      const student = studentData.data;
      setStudent(student);

      if (student) {
        // Then fetch other data using student info
        const resultsPromise = api.get<Result[]>(`/results/filter?student=${student._id}`).catch(() => ({ data: [] }));
        const attendancePromise = api.get<Attendance[]>(`/attendances/student/${student._id}`).catch(() => ({ data: [] }));
        const announcementsPromise = api.get<Announcement[]>(`/announcements?course=${encodeURIComponent(student.course || '')}&semester=${student.currentSemester || ''}`).catch(() => ({ data: [] }));

        let timetablePromise;
        if (student.course && student.currentSemester) {
          timetablePromise = api.get<WeeklyTimetable>(`/timetables/filter?role=student&course=${encodeURIComponent(student.course)}&semester=${student.currentSemester}`).catch(() => ({ data: {} }));
        } else {
          timetablePromise = Promise.resolve({ data: {} });
        }

        let subjectsPromise;
        if (student.course && student.currentSemester) {
          subjectsPromise = api.get<Subject[]>(`/subjects/filter?course=${encodeURIComponent(student.course)}&semester=${student.currentSemester}`).catch(() => ({ data: [] }));
        } else if (student.course) {
          subjectsPromise = api.get<Subject[]>(`/subjects/filter?course=${encodeURIComponent(student.course)}`).catch(() => ({ data: [] }));
        } else {
          subjectsPromise = Promise.resolve({ data: [] });
        }

        const [resultsData, attendanceData, announcementsData, timetableData, subjectsData] = await Promise.all([
          resultsPromise,
          attendancePromise,
          announcementsPromise,
          timetablePromise,
          subjectsPromise
        ]);

        setResults(resultsData.data);
        setAttendance(attendanceData.data);
        setAnnouncements(announcementsData.data);
        setWeeklyTimetable(timetableData.data);
        setSubjects(subjectsData.data);
        setSgpaHistory(student.sgpaHistory || []);
        setSelectedSemester(student.currentSemester || 1);

        // Calculate max semester from data
        const allSemesters = [
          ...resultsData.data.map(r => r.semester),
          ...attendanceData.data.map(a => a.semester),
          ...subjectsData.data.map(s => s.semester)
        ];
        const maxSem = Math.max(...allSemesters, student.currentSemester || 1);
        setMaxSemester(maxSem);

        setLoadingTimetable(false);
      } else {
        setError("Student data not found. Please contact administrator.");
        setLoadingTimetable(false);
        setWeeklyTimetable({});
      }
    } catch (error) {
      setLoadingTimetable(false);
      setWeeklyTimetable({});
      setError(`Failed to load dashboard data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch timetable when selectedSemester changes
  useEffect(() => {
    const fetchTimetable = async () => {
      if (!student?.course) return;

      try {
        setLoadingTimetable(true);
        const timetableData = await api.get<WeeklyTimetable>(`/timetables/filter?role=student&course=${encodeURIComponent(student.course)}&semester=${selectedSemester}`).catch(() => ({ data: {} }));
        setWeeklyTimetable(timetableData.data);

        const announcementsData = await api.get<Announcement[]>(`/announcements?course=${encodeURIComponent(student.course)}&semester=${selectedSemester}`).catch(() => ({ data: [] }));
        setAnnouncements(announcementsData.data);

        const subjectsData = await api.get<Subject[]>(`/subjects/filter?course=${encodeURIComponent(student.course)}&semester=${selectedSemester}`).catch(() => ({ data: [] }));
        setSubjects(subjectsData.data);
      } catch {
        setWeeklyTimetable({});
        setAnnouncements([]);
        setSubjects([]);
      } finally {
        setLoadingTimetable(false);
      }
    };

    if (student) {
      fetchTimetable();
    }
  }, [selectedSemester, student?.course, student]);



  // Get subjects from constants for the selected semester and course
  const semesterSubjects = student?.course ? getSubjectsForSemester(student.course, selectedSemester) : [];

  // Filter results and attendance only for subjects in semesterSubjects (from constants)
  const filteredResults = results.filter(
    (item: Result) => item.semester === selectedSemester && semesterSubjects.includes(item.subject)
  );

  const filteredAttendance = attendance.filter(
    (a: Attendance) => a.semester === selectedSemester && semesterSubjects.includes(a.subject)
  );

  const filteredSubjects = subjects.filter(
    (s: Subject) => s.semester === selectedSemester
  );

  const filteredAnnouncements = announcements.filter(
    (a: Announcement) => !a.semester || a.semester === selectedSemester
  );

  const calculateSGPA = (resultList: Result[]) => {
    const validResults = resultList.filter(
      (r) => r.internal !== null && r.external !== null
    );

    if (!validResults.length) return 0;

    const totalPoints = validResults.reduce(
      (sum, r) => sum + (r.internal! + r.external!) / 2,
      0
    );

    return totalPoints / validResults.length;
  };

  const sgpa = parseFloat(calculateSGPA(filteredResults).toFixed(2));

  // Calculate CGPA (average of all semester SGPAs)
  const cgpa = sgpaHistory.length > 0
    ? parseFloat((sgpaHistory.reduce((sum, sgpa) => sum + sgpa, 0) / sgpaHistory.length).toFixed(2))
    : 0;



  // Custom colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg text-red-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 flex">
      <Sidebar userRole={(user?.role || "student") as "teacher" | "admin" | "student"} />

      <main className="flex-1 relative">
        {/* Logout button in top right corner */}
        <div className="absolute top-6 right-6 z-10">
          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              window.location.href = "/login";
            }}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-md"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>

        <div className="p-6 lg:p-8">
          <div className="flex flex-col md:flex-row md:items-center mb-8 gap-4">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <User className="text-blue-600" />
              </div>
              {student?.name || "Student"}
            </h1>
          </div>

          {/* Enhanced Info Card */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Student Information</h2>
            <div className="bg-white/90 backdrop-blur border border-white/30 rounded-2xl shadow-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                  <h3 className="text-sm font-semibold text-blue-800 mb-1">Course</h3>
                  <p className="text-lg font-bold text-gray-800">{student?.course || "N/A"}</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100">
                  <h3 className="text-sm font-semibold text-green-800 mb-1">Enrollment</h3>
                  <p className="text-lg font-bold text-gray-800">{student?.enrollment || "N/A"}</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-5 border border-purple-100">
                  <h3 className="text-sm font-semibold text-purple-800 mb-1">Current Semester</h3>
                  <p className="text-lg font-bold text-gray-800">Semester {student?.currentSemester || "N/A"}</p>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-5 border border-amber-100">
                  <h3 className="text-sm font-semibold text-amber-800 mb-1">Email</h3>
                  <p className="text-lg font-bold text-gray-800 truncate">{student?.email || "N/A"}</p>
                </div>

                <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-5 border border-rose-100">
                  <h3 className="text-sm font-semibold text-rose-800 mb-1">Phone</h3>
                  <p className="text-lg font-bold text-gray-800">{student?.phone || "N/A"}</p>
                </div>

                <div className="bg-gradient-to-br from-cyan-50 to-sky-50 rounded-xl p-5 border border-cyan-100">
                  <h3 className="text-sm font-semibold text-cyan-800 mb-1">Date of Birth</h3>
                  <p className="text-lg font-bold text-gray-800">
                    {student?.dob ? new Date(student.dob).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Address</h3>
                <p className="text-gray-800 font-medium">{student?.address || "N/A"}</p>
              </div>
            </div>
          </section>

          {/* Academic Overview Card */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Academic Overview</h2>
            <section className="bg-gradient-to-br from-slate-50 via-white to-blue-50/30 rounded-2xl p-8 border border-slate-200/60 shadow-xl">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                {/* Header Section */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xl">📚</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Academic Overview</h2>
                    <p className="text-sm text-gray-600">Comprehensive view of your academic progress</p>
                  </div>
                </div>

                {/* Enhanced Semester Selector */}
                <div className="flex items-center gap-4 bg-white/80 backdrop-blur rounded-xl p-4 border border-slate-200/50 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                      <span className="text-white font-bold text-sm">📅</span>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-black mb-1">Select Semester</label>
                      <select
                        value={selectedSemester}
                        onChange={(e) => setSelectedSemester(Number(e.target.value))}
                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400 text-black"
                      >
                        {Array.from({ length: maxSemester }).map((_, i) => (
                          <option key={i + 1} value={i + 1}>Semester {i + 1}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="hidden sm:block text-right">
                    <div className="text-xs text-gray-500">Current Selection</div>
                    <div className="text-lg font-bold text-blue-600">Sem {selectedSemester}</div>
                  </div>
                </div>
              </div>

              {/* Quick Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-medium text-blue-700 mb-1">Current SGPA</div>
                      <div className="text-xl font-bold text-blue-800">{sgpa}</div>
                    </div>
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">🎯</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-medium text-emerald-700 mb-1">Overall CGPA</div>
                      <div className="text-xl font-bold text-emerald-800">{cgpa}</div>
                    </div>
                    <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">🏆</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-medium text-purple-700 mb-1">Subjects</div>
                      <div className="text-xl font-bold text-purple-800">{filteredSubjects.length}</div>
                    </div>
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">📖</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-medium text-amber-700 mb-1">Announcements</div>
                      <div className="text-xl font-bold text-amber-800">{filteredAnnouncements.length}</div>
                    </div>
                    <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">📢</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Integration */}
              <div className="space-y-8">
            {/* Subject Details Section */}
            <section className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-lg">📚</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Subject Details</h3>
                  <p className="text-sm text-gray-600">Your subjects for the selected semester</p>
                </div>
              </div>

              <div className="space-y-4">
                {student?.course ? (
                  (() => {
                    const semesterSubjects = getSubjectsForSemester(student.course!, selectedSemester);
                    return semesterSubjects.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">No subjects available for this semester.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {semesterSubjects.map((subject, index) => (
                          <div key={index} className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg border border-teal-100">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center shadow-md">
                                <span className="text-white font-bold text-sm">{index + 1}</span>
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-gray-800 text-sm">{subject}</p>
                                <p className="text-xs text-gray-600">Semester {selectedSemester}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()
                ) : (
                  <p className="text-center text-gray-500 py-8">Course information not available.</p>
                )}
              </div>
            </section>

            {/* Subject-wise Results - Advanced Pie Chart */}
            <section className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-lg">📊</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Subject Results</h3>
                  <p className="text-sm text-gray-600">Your subjects and performance</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Results */}
                <div className="space-y-4">
                  {filteredResults.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No results available.</p>
                  ) : (
                    <div className="space-y-3">
                      {filteredResults.map((result, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            ></div>
                            <div>
                              <p className="font-medium text-gray-800 text-sm">{result.subject}</p>
                              <p className="text-xs text-gray-600">
                                Int: {result.internal ?? 'N/A'} | Ext: {result.external ?? 'N/A'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-purple-600">
                              {result.internal != null && result.external != null
                                ? ((result.internal + result.external) / 2).toFixed(1)
                                : 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500">Average</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Attendance Section */}
            <section className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-lg">📈</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Attendance Overview</h3>
                  <p className="text-sm text-gray-600">Your attendance percentage by subject</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-700 mb-3">Subject Attendance</h4>
                {filteredAttendance.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No attendance data available.</p>
                ) : (
                  <div className="flex flex-col lg:flex-row items-center gap-6">
                    <div className="w-full lg:w-1/2">
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={filteredAttendance.map((att, index) => ({
                              name: att.subject,
                              value: att.percentage,
                              semester: att.semester,
                              color: COLORS[index % COLORS.length]
                            }))}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ percent }) => percent ? `${(percent * 100).toFixed(0)}%` : ''}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {filteredAttendance.map((_entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: number, name: string) => [
                              `${value}%`,
                              name
                            ]}
                            labelStyle={{ color: '#333' }}
                            contentStyle={{
                              backgroundColor: '#f8f9fa',
                              border: '1px solid #dee2e6',
                              borderRadius: '8px',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                          />
                          <Legend
                            verticalAlign="bottom"
                            height={36}
                            formatter={(value, entry) => (
                              <span style={{ color: entry.color }}>
                                {value}
                              </span>
                            )}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-full lg:w-1/2 space-y-3">
                      <h5 className="font-medium text-gray-700 mb-3">Detailed Breakdown</h5>
                      {filteredAttendance.map((att, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            ></div>
                            <div>
                              <p className="font-medium text-gray-800 text-sm">{att.subject}</p>
                              <p className="text-xs text-gray-600">Semester {att.semester}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${att.percentage >= 75 ? 'text-green-600' : 'text-red-600'}`}>
                              {att.percentage}%
                            </p>
                            <p className="text-xs text-gray-500">Attendance</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Announcements Section */}
            <section className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-lg">📢</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Announcements</h3>
                  <p className="text-sm text-gray-600">Important notices and updates</p>
                </div>
              </div>

              <div className="space-y-4">
                {filteredAnnouncements.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No announcements available.</p>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {filteredAnnouncements.map((announcement, index) => (
                      <div key={index} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-gray-800 font-medium">{announcement.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {announcement.date ? new Date(announcement.date).toLocaleDateString() : 'No date'}
                            </p>
                          </div>
                          <div className="ml-4">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              📢 Announcement
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>


              {/* Weekly Timetable */}
              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Weekly Timetable</h2>
                <section className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
                      <span className="text-white font-bold text-lg">📅</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Weekly Timetable</h3>
                      <p className="text-sm text-gray-600">Your class schedule for the week</p>
                    </div>
                  </div>
                  {loadingTimetable ? (
                    <p className="text-center py-8 text-gray-500">Loading timetable...</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full table-auto">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="p-4 border border-black text-black">Day</th>
                            {["9-10 AM","10-11 AM","11-12 PM","12-1 PM","1-2 PM","2-3 PM"].map((slot, idx) => (
                              <th key={idx} className="p-4 border border-black text-center text-black">{slot}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map((day) => (
                            <tr key={day} className="border-b border-black text-black">
                              <td className="p-4 font-semibold bg-gray-50 border border-black">{day}</td>
                              {["9-10 AM","10-11 AM","11-12 PM","12-1 PM","1-2 PM","2-3 PM"].map((slot) => {
                                if (slot === "1-2 PM") {
                                  return (
                                    <td key={slot} className="p-4 bg-amber-50 border border-black text-center italic text-amber-700">
                                      Lunch Break
                                    </td>
                                  );
                                }

                                const entry = weeklyTimetable?.[day]?.[slot];
                                if (!entry || entry.semester > selectedSemester) {
                                  return (
                                    <td key={slot} className="p-4 bg-gray-50 border border-black text-center text-black italic">
                                      --
                                    </td>
                                  );
                                }

                                const subjectName = entry.subjectName || entry.subject || "";
                                const teacherName = entry.teacher || "";

                                return (
                                  <td
                                    key={slot}
                                    className="p-4 bg-blue-50 border border-black text-center"
                                    title={`Teacher: ${teacherName}`}
                                  >
                                    <div className="font-medium text-black">{subjectName}</div>
                                    <div className="text-xs text-black mt-1">{teacherName}</div>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              </section>



              </div>
            </section>
          </section>

        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
