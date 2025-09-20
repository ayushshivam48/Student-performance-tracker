import { useEffect, useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Mail,
  Phone,
  MapPin,
  User,
  BookOpen,
  Filter,
  Users,
  Award,
  CalendarDays
} from "lucide-react";
import { format } from "date-fns";
import Sidebar from "@/components/shared/Sidebar";
import { useAuthStore } from "@/store/auth";

interface Teacher {
  _id: string;
  name: string;
  email: string;
  teacherId?: string;
  userId?: string;
  specialization?: string;
  phone?: string;
  dob?: string;
  address?: string;
}

interface Assignment {
  course: string;
  semester: string;
  subject: string;
  _id?: string;
  teacherId?: string;
  teacherName?: string;
}

interface Student {
  _id: string;
  name: string;
  enrollment: string;
  course: string;
  semester?: string;
  currentSemester?: string;
  subject?: string;
  attendance?: string;
}

interface TimetableEntry {
  day: string;
  period: string;
  subjectName?: string;
  subject?: string;
  course: string;
  semester: string;
  _id?: string;
}

interface Filter {
  course: string;
  semester: string;
  subject: string;
}

const mockApi = {
  get: async (url: string) => {
    await new Promise(resolve => setTimeout(resolve, 800));

    if (url.includes('/teachers')) {
      return {
        _id: "t1",
        name: "Dr. Sarah Johnson",
        email: "sarah.johnson@university.edu",
        teacherId: "TCH001",
        specialization: "Computer Science",
        phone: "+1 (555) 123-4567",
        dob: "1985-06-15",
        address: "123 University Ave, Campus City"
      } as Teacher;
    }

    if (url.includes('/assignments/filter')) {
      return [
        { course: "B.Tech", semester: "1", subject: "Programming in C", _id: "a1" },
        { course: "B.Tech", semester: "2", subject: "Data Structures using C", _id: "a2" },
        { course: "BCA", semester: "1", subject: "Programming in C", _id: "a3" },
        { course: "BCA", semester: "2", subject: "Data Structures", _id: "a4" }
      ] as Assignment[];
    }

    if (url.includes('/timetables/filter')) {
      return [
        { day: "Monday", period: "9:00-10:00", subject: "Programming in C", course: "B.Tech", semester: "1" },
        { day: "Monday", period: "11:00-12:00", subject: "Data Structures using C", course: "B.Tech", semester: "2" },
        { day: "Tuesday", period: "10:00-11:00", subject: "Programming in C", course: "BCA", semester: "1" },
        { day: "Wednesday", period: "14:00-15:00", subject: "Data Structures", course: "BCA", semester: "2" },
        { day: "Thursday", period: "9:00-10:00", subject: "Programming in C", course: "B.Tech", semester: "1" },
        { day: "Friday", period: "11:00-12:00", subject: "Data Structures using C", course: "B.Tech", semester: "2" }
      ] as TimetableEntry[];
    }

    return [];
  }
};

const TeacherDashboard = ({ user }: { user?: Teacher }) => {
  const { user: authUser } = useAuthStore();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const students = useMemo(() => [
    { _id: "s1", name: "John Doe", enrollment: "BT2023001", course: "B.Tech", semester: "1", subject: "Programming in C", attendance: "92%" },
    { _id: "s2", name: "Jane Smith", enrollment: "BT2023002", course: "B.Tech", semester: "1", subject: "Programming in C", attendance: "87%" },
    { _id: "s3", name: "Robert Johnson", enrollment: "BT2023003", course: "B.Tech", semester: "2", subject: "Data Structures using C", attendance: "95%" },
    { _id: "s4", name: "Emily Davis", enrollment: "BT2023004", course: "B.Tech", semester: "2", subject: "Data Structures using C", attendance: "88%" },
    { _id: "s5", name: "Michael Wilson", enrollment: "BCA2023001", course: "BCA", semester: "1", subject: "Programming in C", attendance: "91%" }
  ], []);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [timetableDay, setTimetableDay] = useState<string>("all");
  const [filter, setFilter] = useState<Filter>({ course: "all", semester: "all", subject: "all" });
  const [loading, setLoading] = useState(true);

  const filteredTimetable = timetableDay === "all" ? timetable : timetable.filter((slot) => slot.day === timetableDay);

  useEffect(() => {
    const fetchTeacherData = async () => {
      setLoading(true);
      try {
        // Fetch teacher data
        const teacherData = await mockApi.get(`/teachers/${user?._id || authUser?._id}`);
        if (teacherData && typeof teacherData === 'object' && '_id' in teacherData) {
          setTeacher(teacherData as Teacher);
        } else {
          setTeacher(null);
        }
      } catch {
        if (user) {
          setTeacher(user);
        } else {
          setTeacher(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, [user, authUser]);

  useEffect(() => {
    const fetchAssignmentsAndTimetable = async () => {
      if (!teacher || !teacher.teacherId) {
        setAssignments([]);
        setTimetable([]);
        return;
      }
      setLoading(true);
      try {
        // Fetch assignments
        const teacherId = teacher.teacherId;
        const assignmentsData = await mockApi.get(`/assignments/filter?teacher=${teacherId}`);
        if (assignmentsData && Array.isArray(assignmentsData) && assignmentsData.every(item => typeof item === 'object' && 'course' in item && 'semester' in item && 'subject' in item)) {
          setAssignments(assignmentsData as Assignment[]);
        } else {
          setAssignments([]);
        }

        // Fetch timetable
        const timetableData = await mockApi.get(`/timetables/filter?role=teacher&teacher=${teacherId}`);
        if (timetableData && Array.isArray(timetableData) && timetableData.every(item => typeof item === 'object' && 'day' in item && 'period' in item && 'course' in item && 'semester' in item)) {
          setTimetable(timetableData as TimetableEntry[]);
        } else {
          setTimetable([]);
        }
      } catch {
        setAssignments([]);
        setTimetable([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignmentsAndTimetable();
  }, [teacher]);

  useEffect(() => {
    const { course, semester, subject } = filter;
    const filtered = students.filter((s: Student) => {
      const sSemester = s.semester ?? s.currentSemester ?? "";
      const sSubject = s.subject ?? "";
      return (
        (course === "all" || s.course === course) &&
        (semester === "all" || sSemester === semester) &&
        (subject === "all" || sSubject === subject)
      );
    });
    setFilteredStudents(filtered);
  }, [filter, students]);

  const courseOptions = ["all", ...Array.from(new Set(assignments.map((a) => a.course)))];
  const semesterOptions = ["all", ...Array.from(new Set(assignments.map((a) => a.semester)))];
  const subjectOptions = ["all", ...Array.from(new Set(assignments.map((a) => a.subject)))];

  const daysOfWeek = ["all", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100">
      <div className="flex">
        <Sidebar userRole="teacher" userName={authUser?.name || teacher?.name} />

        <main className="flex-1 p-4 md:p-8">
          <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Welcome back, {teacher?.name || user?.name || "Teacher"}
              </h1>
              <p className="text-gray-600 mt-1">Here's what's happening with your classes today</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm text-black">Today</p>
                <p className="font-medium text-black">{format(new Date(), "EEE, MMM d")}</p>
              </div>
              <div className="flex items-center gap-3 bg-white/80 backdrop-blur border border-white/30 rounded-xl px-4 py-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="https://github.com/shadcn.png" alt="Teacher" />
                  <AvatarFallback className="bg-blue-100 text-blue-800">
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm text-black">{teacher?.name || user?.name}</p>
                  <p className="text-xs text-black">Teacher</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 mb-6">
            <div className="flex-2 space-y-6">
              <Card className="bg-white/90 backdrop-blur border border-white/30 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    Your Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {teacher ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="bg-blue-50 p-2 rounded-lg">
                            <Mail className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                            <p className="font-medium">{teacher.email}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="bg-blue-50 p-2 rounded-lg">
                            <Award className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Specialization</p>
                            <p className="font-medium">{teacher.specialization || "N/A"}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="bg-blue-50 p-2 rounded-lg">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Teacher ID</p>
                            <p className="font-medium">{teacher.teacherId || teacher.userId || "N/A"}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="bg-blue-50 p-2 rounded-lg">
                            <Phone className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Phone</p>
                            <p className="font-medium">{teacher.phone || "N/A"}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="bg-blue-50 p-2 rounded-lg">
                            <Calendar className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Date of Birth</p>
                            <p className="font-medium">
                              {teacher.dob ? format(new Date(teacher.dob), "MMM d, yyyy") : "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="bg-blue-50 p-2 rounded-lg">
                            <MapPin className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Address</p>
                            <p className="font-medium max-w-xs">{teacher.address || "N/A"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <User className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">Profile information not available</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <Users className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-lg">Student Overview</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <div className="bg-white/20 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold">{filteredStudents.length}</p>
                      <p className="text-xs opacity-80">Total</p>
                    </div>
                    <div className="bg-white/20 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold">
                        {filteredStudents.filter((s) => s.attendance && parseInt(s.attendance) >= 90).length}
                      </p>
                      <p className="text-xs opacity-80">High</p>
                    </div>
                    <div className="bg-white/20 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold">
                        {filteredStudents.filter((s) => s.attendance && parseInt(s.attendance) < 75).length}
                      </p>
                      <p className="text-xs opacity-80">At Risk</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex-1">
              <Card className="bg-white/90 backdrop-blur border border-white/30 shadow-lg h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    Assigned Courses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {assignments.length > 0 ? (
                    <div className="space-y-4">
                      {assignments.map((assignment, idx) => (
                        <div key={idx} className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-blue-800">{assignment.subject}</h3>
                              <p className="text-sm text-gray-600 mt-1">{assignment.course}</p>
                            </div>
                            <Badge variant="secondary">Sem {assignment.semester}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <BookOpen className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">No assignments found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="bg-white/90 backdrop-blur border border-white/30 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <CalendarDays className="h-5 w-5 text-blue-600" />
                  </div>
                  Weekly Timetable
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Select value={timetableDay} onValueChange={setTimetableDay}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by day" />
                    </SelectTrigger>
                    <SelectContent>
                      {daysOfWeek.map(day => (
                        <SelectItem key={day} value={day === 'all' ? 'all' : day}>
                          {day === 'all' ? 'All Days' : day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {filteredTimetable.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No timetable entries found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredTimetable.map((slot, i) => (
                      <div key={i} className="p-4 border rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold">{slot.subjectName || slot.subject}</h3>
                            <p className="text-sm text-gray-600 mt-1">{slot.course} • Semester {slot.semester}</p>
                          </div>
                          <Badge variant="outline">{slot.period}</Badge>
                        </div>
                        <div className="flex items-center gap-1 mt-3 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          <span>{slot.day}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur border border-white/30 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Filter className="h-5 w-5 text-blue-600" />
                  </div>
                  Filter Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Course</label>
                    <Select
                      value={filter.course}
                      onValueChange={(value) => setFilter(prev => ({ ...prev, course: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Courses" />
                      </SelectTrigger>
                      <SelectContent>
                        {courseOptions.map(course => (
                          <SelectItem key={course} value={course === 'all' ? 'all' : course}>
                            {course === 'all' ? 'All Courses' : course}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Semester</label>
                    <Select
                      value={filter.semester}
                      onValueChange={(value) => setFilter(prev => ({ ...prev, semester: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Semesters" />
                      </SelectTrigger>
                      <SelectContent>
                        {semesterOptions.map(semester => (
                          <SelectItem key={semester} value={semester === 'all' ? 'all' : semester}>
                            {semester === 'all' ? 'All Semesters' : semester}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Subject</label>
                    <Select
                      value={filter.subject}
                      onValueChange={(value) => setFilter(prev => ({ ...prev, subject: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Subjects" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjectOptions.map(subject => (
                          <SelectItem key={subject} value={subject === 'all' ? 'all' : subject}>
                            {subject === 'all' ? 'All Subjects' : subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <div className="bg-blue-100 p-1.5 rounded-lg">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    Filtered Students ({filteredStudents.length})
                  </h3>

                  {filteredStudents.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No students match your filters</p>
                    </div>
                  ) : (
                    <div className="space-y-3 overflow-y-auto pr-2">
                      {filteredStudents.map((student, i) => (
                        <div key={i} className="p-4 border rounded-xl hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold">{student.name}</h4>
                              <p className="text-sm text-gray-600">{student.enrollment}</p>
                            </div>
                            <Badge variant="outline">Sem {student.semester || student.currentSemester}</Badge>
                          </div>
                          <div className="flex justify-between text-sm mt-3">
                            <span className="text-gray-600">{student.course}</span>
                            <Badge
                              variant={student.attendance && parseInt(student.attendance) > 90 ? "default" : "secondary"}
                            >
                              {student.attendance || 'N/A'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-2">{student.subject}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeacherDashboard;
