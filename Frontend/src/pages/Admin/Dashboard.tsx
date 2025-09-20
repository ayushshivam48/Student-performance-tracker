import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Users,
  BookOpen,
  GraduationCap,
  Calendar,
  Plus,
  X,
  CheckCircle,
  AlertCircle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Sidebar from "@/components/shared/Sidebar";
import api from "@/lib/api";
import { btechSubjectsBySemester, bcaSubjectsBySemester } from "@/lib/student";

// Types
interface Admin {
  name: string;
  email: string;
  post: string;
  institute: string;
  phone: string;
  dob: string;
  address: string;
  role: string;
}

interface Student {
  _id: string;
  name: string;
  enrollment: string;
  email: string;
}

interface Teacher {
  _id: string;
  name: string;
  userId: string;
  email: string;
}

interface Assignment {
  id: string;
  course: string;
  semester: number;
  subject: string;
  teacher: string;
}

interface Stats {
  students: number;
  teachers: number;
  courses: number;
  assignments: number;
}

// Mock data - replace with your API calls
const mockAdmin = {
  name: "Ayush Shivam",
  email: "ayush@gmail.com",
  post: "Administrator",
  institute: "Amity University",
  phone: "9876543210",
  dob: "1990-01-01",
  address: "Admin Office",
  role: "admin"
};

const mockStudents = [
  { _id: "1", name: "Emma Wilson", enrollment: "STU001", email: "emma@university.edu" },
  { _id: "2", name: "James Brown", enrollment: "STU002", email: "james@university.edu" },
  { _id: "3", name: "Sophia Davis", enrollment: "STU003", email: "sophia@university.edu" },
  { _id: "4", name: "Michael Miller", enrollment: "STU004", email: "michael@university.edu" },
];

const mockTeachers = [
  { _id: "1", name: "Dr. Robert Taylor", userId: "TCH001", email: "robert@institute.edu" },
  { _id: "2", name: "Prof. Jennifer Lee", userId: "TCH002", email: "jennifer@institute.edu" },
  { _id: "3", name: "Dr. Michael Chen", userId: "TCH003", email: "michael@institute.edu" },
];

const mockAssignments = [
  { id: "1", course: "B.Tech", semester: 3, subject: "Data Structures & Algorithms", teacher: "Dr. Robert Taylor" },
  { id: "2", course: "B.Tech", semester: 2, subject: "Data Structures using C", teacher: "Prof. Jennifer Lee" },
  { id: "3", course: "BCA", semester: 3, subject: "Web Development", teacher: "Dr. Michael Chen" },
];

export default function AdminDashboard() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [stats, setStats] = useState<Stats>({ students: 0, teachers: 0, courses: 0, assignments: 0 });

  const [form, setForm] = useState({
    course: "",
    semester: "",
    subject: "",
    teacher: ""
  });
  const [availableSemesters, setAvailableSemesters] = useState<string[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const [loading, setLoading] = useState({
    admin: false,
    students: false,
    teachers: false,
    assignments: false,
    stats: false
  });

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading({ admin: true, students: true, teachers: true, assignments: true, stats: true });

      try {
        // Fetch admin info
        const adminResponse = await api.get('/auth/me');
        setAdmin({ ...adminResponse.data, role: 'admin' });

        // Fetch stats
        const statsResponse = await api.get('/admin/dashboard');
        setStats(statsResponse.data);

        // Fetch students
        const studentsResponse = await api.get('/students');
        setStudents(studentsResponse.data);

        // Fetch teachers
        const teachersResponse = await api.get('/teachers');
        setTeachers(teachersResponse.data);

        // Fetch assignments
        const assignmentsResponse = await api.get('/assignments');
        setAssignments(assignmentsResponse.data);

        setLoading({ admin: false, students: false, teachers: false, assignments: false, stats: false });
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback to mock data if API fails
        setAdmin(mockAdmin);
        setStudents(mockStudents);
        setTeachers(mockTeachers);
        setAssignments(mockAssignments);
        setStats({ students: mockStudents.length, teachers: mockTeachers.length, courses: 0, assignments: mockAssignments.length });
        setLoading({ admin: false, students: false, teachers: false, assignments: false, stats: false });
      }
    };

    fetchData();
  }, []);

  // Update available semesters when course changes
  useEffect(() => {
    if (form.course === "B.Tech") {
      setAvailableSemesters(Array.from({ length: 8 }, (_, i) => (i + 1).toString()));
    } else if (form.course === "BCA") {
      setAvailableSemesters(Array.from({ length: 6 }, (_, i) => (i + 1).toString()));
    } else {
      setAvailableSemesters([]);
    }
    // Reset semester and subject when course changes
    setForm(prev => ({ ...prev, semester: "", subject: "" }));
    setAvailableSubjects([]);
  }, [form.course]);

  // Update available subjects when course and semester change
  useEffect(() => {
    if (form.course && form.semester) {
      const semesterNum = parseInt(form.semester);
      if (form.course === "B.Tech" && btechSubjectsBySemester[semesterNum as keyof typeof btechSubjectsBySemester]) {
        setAvailableSubjects(btechSubjectsBySemester[semesterNum as keyof typeof btechSubjectsBySemester]);
      } else if (form.course === "BCA" && bcaSubjectsBySemester[semesterNum as keyof typeof bcaSubjectsBySemester]) {
        setAvailableSubjects(bcaSubjectsBySemester[semesterNum as keyof typeof bcaSubjectsBySemester]);
      } else {
        setAvailableSubjects([]);
      }
      // Reset subject when semester changes
      setForm(prev => ({ ...prev, subject: "" }));
    }
  }, [form.course, form.semester]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setFormSubmitting(true);

    const { course, semester, subject, teacher } = form;

    if (!course.trim() || !semester.trim() || !subject.trim() || !teacher.trim()) {
      setFormError("Please fill out all fields.");
      setFormSubmitting(false);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      const newAssignment = {
        id: (assignments.length + 1).toString(),
        course: course.trim(),
        semester: parseInt(semester.trim()),
        subject: subject.trim(),
        teacher: teacher.trim()
      };

      setAssignments([...assignments, newAssignment]);
      setForm({ course: "", semester: "", subject: "", teacher: "" });
      setShowForm(false);
      setFormSuccess("Assignment added successfully!");
      setFormSubmitting(false);

      // Clear success message after 3 seconds
      setTimeout(() => setFormSuccess(""), 3000);
    }, 1000);
  };

  const toggleForm = () => {
    setShowForm(!showForm);
    if (showForm) {
      setForm({ course: "", semester: "", subject: "", teacher: "" });
      setFormError("");
      setFormSuccess("");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100">
      <div className="flex">
        <Sidebar userRole={(admin?.role || "admin") as "teacher" | "admin" | "student"} userName={admin?.name} />

        <main className="flex-1 p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back, {admin?.name || "Admin"}</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Admin Info Card - Improved Styling */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-2"
            >
              <Card className="h-full border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <User className="h-6 w-6 text-purple-600" />
                    </div>
                    Admin Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading.admin ? (
                    <div className="flex items-center justify-center h-48">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-5">
                        <div className="flex items-start gap-4">
                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex-shrink-0" />
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">{admin?.name || "N/A"}</h3>
                            <p className="text-gray-600">{admin?.post || "N/A"}</p>
                            <Badge className="mt-1" variant="secondary">{admin?.role || "admin"}</Badge>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500 mb-1">Institute</p>
                          <p className="font-medium">{admin?.institute || "N/A"}</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500 mb-1">Address</p>
                          <p className="font-medium">{admin?.address || "N/A"}</p>
                        </div>
                      </div>

                      <div className="space-y-5">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Contact Information</p>
                          <div className="space-y-2">
                            <p className="font-medium">{admin?.email || "N/A"}</p>
                            <p className="font-medium">{admin?.phone || "N/A"}</p>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500 mb-1">Personal Details</p>
                          <div className="space-y-2">
                            <p className="font-medium">
                              {admin?.dob ? formatDate(admin.dob) : "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Stats Cards - Improved Visibility */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white h-full">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="text-sm opacity-90">Total Students</p>
                        <p className="text-3xl font-bold mt-1">{stats.students}</p>
                        <p className="text-sm opacity-80 mt-2">Active this semester</p>
                      </div>
                      <div className="p-3 bg-white/20 rounded-full ml-4">
                        <GraduationCap className="h-8 w-8" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="border-0 shadow-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white h-full">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="text-sm opacity-90">Total Teachers</p>
                        <p className="text-3xl font-bold mt-1">{stats.teachers}</p>
                        <p className="text-sm opacity-80 mt-2">Teaching this term</p>
                      </div>
                      <div className="p-3 bg-white/20 rounded-full ml-4">
                        <Users className="h-8 w-8" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white h-full">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="text-sm opacity-90">Courses Assign</p>
                        <p className="text-3xl font-bold mt-1">{stats.assignments}</p>
                        <p className="text-sm opacity-80 mt-2">Created this month</p>
                      </div>
                      <div className="p-3 bg-white/20 rounded-full ml-4">
                        <BookOpen className="h-8 w-8" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Students Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm h-full">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2.5 bg-blue-100 rounded-xl">
                      <GraduationCap className="h-5 w-5 text-blue-600" />
                    </div>
                    Latest Students
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading.students ? (
                    <div className="flex items-center justify-center h-48">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    </div>
                  ) : students.length === 0 ? (
                    <p className="text-center py-8 text-gray-500">No students found</p>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                      {students.map((student) => (
                        <div
                          key={student._id}
                          className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${student.name}`} />
                            <AvatarFallback className="text-lg">{student.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{student.name}</p>
                            <p className="text-sm text-gray-500 truncate">{student.email}</p>
                          </div>
                          <Badge variant="secondary">{student.enrollment}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Teachers Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm h-full">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2.5 bg-green-100 rounded-xl">
                      <Users className="h-5 w-5 text-green-600" />
                    </div>
                    Latest Teachers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading.teachers ? (
                    <div className="flex items-center justify-center h-48">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
                    </div>
                  ) : teachers.length === 0 ? (
                    <p className="text-center py-8 text-gray-500">No teachers found</p>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                      {teachers.map((teacher) => (
                        <div
                          key={teacher._id}
                          className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${teacher.name}`} />
                            <AvatarFallback className="text-lg">{teacher.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{teacher.name}</p>
                            <p className="text-sm text-gray-500 truncate">{teacher.email}</p>
                          </div>
                          <Badge variant="outline">{teacher.userId}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Assignments Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2.5 bg-indigo-100 rounded-xl">
                      <BookOpen className="h-5 w-5 text-indigo-600" />
                    </div>
                    Course Assign
                  </CardTitle>
                  <Button
                    onClick={toggleForm}
                    className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2"
                  >
                    {showForm ? (
                      <>
                        <X className="mr-2 h-4 w-4" /> Cancel
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" /> Add Assignment
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 p-5 bg-gray-50 rounded-xl"
                  >
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                          <Select value={form.course} onValueChange={(value) => handleSelectChange("course", value)}>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Select a course" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="B.Tech">B.Tech</SelectItem>
                              <SelectItem value="BCA">BCA</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
                          <Select value={form.semester} onValueChange={(value) => handleSelectChange("semester", value)} disabled={!form.course}>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Select a semester" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableSemesters.map((sem) => (
                                <SelectItem key={sem} value={sem}>
                                  Semester {sem}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                          <Select value={form.subject} onValueChange={(value) => handleSelectChange("subject", value)} disabled={!form.semester}>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Select a subject" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableSubjects.map((subject) => (
                                <SelectItem key={subject} value={subject}>
                                  {subject}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Teacher</label>
                          <Input
                            name="teacher"
                            placeholder="e.g., Dr. Robert Taylor"
                            value={form.teacher}
                            onChange={handleChange}
                            required
                            className="h-11"
                          />
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <Button
                          type="submit"
                          disabled={formSubmitting}
                          className="bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5"
                        >
                          {formSubmitting ? (
                            <>
                              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                              Adding...
                            </>
                          ) : (
                            <>
                              <Plus className="mr-2 h-4 w-4" /> Add Assignment
                            </>
                          )}
                        </Button>
                        {formError && (
                          <div className="flex items-center text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
                            <AlertCircle className="mr-1.5 h-4 w-4 flex-shrink-0" /> {formError}
                          </div>
                        )}
                        {formSuccess && (
                          <div className="flex items-center text-green-600 text-sm bg-green-50 px-3 py-2 rounded-lg">
                            <CheckCircle className="mr-1.5 h-4 w-4 flex-shrink-0" /> {formSuccess}
                          </div>
                        )}
                      </div>
                    </form>
                  </motion.div>
                )}

                {loading.assignments ? (
                  <div className="flex items-center justify-center h-48">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                  </div>
                ) : assignments.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-3 text-lg font-medium text-gray-900">No assignments</h3>
                    <p className="mt-1 text-gray-500">Get started by adding a new assignment.</p>
                  </div>
                ) : (
                  <div className="border rounded-xl overflow-hidden">
                    <Table>
                      <TableHeader className="bg-gray-50">
                        <TableRow>
                          <TableHead className="font-semibold">Course</TableHead>
                          <TableHead className="font-semibold">Semester</TableHead>
                          <TableHead className="font-semibold">Subject</TableHead>
                          <TableHead className="font-semibold">Teacher</TableHead>
                          <TableHead className="font-semibold text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {assignments.map((assignment) => (
                          <TableRow key={assignment.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium py-4">
                              {assignment.course === "B.Tech" || assignment.course === "BCA"
                                ? assignment.course
                                : "Unknown Course"}
                            </TableCell>
                            <TableCell className="py-4">
                              <Badge variant="secondary" className="px-3 py-1.5">Semester {assignment.semester}</Badge>
                            </TableCell>
                            <TableCell className="py-4">
                              {assignment.subject && (btechSubjectsBySemester[assignment.semester as keyof typeof btechSubjectsBySemester]?.includes(assignment.subject) ||
                              bcaSubjectsBySemester[assignment.semester as keyof typeof bcaSubjectsBySemester]?.includes(assignment.subject))
                                ? assignment.subject
                                : "Unknown Subject"}
                            </TableCell>
                            <TableCell className="py-4">{assignment.teacher}</TableCell>
                            <TableCell className="text-right py-4">
                              <Button variant="outline" size="sm" className="border-gray-300 bg-white">
                                <Calendar className="h-4 w-4 mr-1.5 bg-white" /> Schedule
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
