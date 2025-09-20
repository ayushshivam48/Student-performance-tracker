import { useState, useEffect } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash, Plus, Calendar, BookOpen, User, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/shared/Sidebar";
import { btechSubjectsBySemester, bcaSubjectsBySemester } from "@/lib/student";

// Types
interface Assignment {
  id: string;
  course: string;
  semester: string;
  subject: string;
  title: string;
  dueDate: string;
  teacherName: string;
  teacherId: string;
}

interface FormData {
  course: string;
  semester: string;
  subject: string;
  title: string;
  dueDate: string;
  teacherName: string;
  teacherId: string;
}

// Mock data for initial state
const initialAssignments: Assignment[] = [
  {
    id: "1",
    course: "B.Tech",
    semester: "1",
    subject: "Programming in C",
    title: "Sorting Implementation",
    dueDate: "2023-10-15",
    teacherName: "Dr. Smith",
    teacherId: "T001",
  },
  {
    id: "2",
    course: "B.Tech",
    semester: "2",
    subject: "Data Structures using C",
    title: "Integration Techniques",
    dueDate: "2024-03-22",
    teacherName: "Prof. Johnson",
    teacherId: "T002",
  },
];

const courses = ["B.Tech", "BCA"];
const semesters = ["1", "2", "3", "4", "5", "6", "7", "8"];
const teachers = [
  { id: "T001", name: "Dr. Smith" },
  { id: "T002", name: "Prof. Johnson" },
  { id: "T003", name: "Dr. Williams" },
  { id: "T004", name: "Prof. Brown" },
];

export default function AssignmentManager() {
  // State
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);
  const [formData, setFormData] = useState<FormData>({
    course: "",
    semester: "",
    subject: "",
    title: "",
    dueDate: "",
    teacherName: "",
    teacherId: "",
  });
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSubjects, setFilteredSubjects] = useState<string[]>([]);

  // Filter assignments based on search term
  const filteredAssignments = assignments.filter(assignment =>
    assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.teacherName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Update filteredSubjects when course or semester changes
  useEffect(() => {
    if (formData.course && formData.semester) {
      let subjectsList: string[] = [];
      const semesterNum = parseInt(formData.semester);
      if (formData.course === "B.Tech") {
        subjectsList = btechSubjectsBySemester[semesterNum as keyof typeof btechSubjectsBySemester] || [];
      } else if (formData.course === "BCA") {
        subjectsList = bcaSubjectsBySemester[semesterNum as keyof typeof bcaSubjectsBySemester] || [];
      }
      setFilteredSubjects(subjectsList);
      // Reset subject if not in new list
      if (!subjectsList.includes(formData.subject)) {
        setFormData(prev => ({ ...prev, subject: "" }));
      }
    } else {
      setFilteredSubjects([]);
      setFormData(prev => ({ ...prev, subject: "" }));
    }
  }, [formData.course, formData.semester, formData.subject]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });

    // Clear error when user selects an option
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.course) newErrors.course = "Course is required";
    if (!formData.semester) newErrors.semester = "Semester is required";
    if (!formData.subject) newErrors.subject = "Subject is required";
    if (!formData.title) newErrors.title = "Title is required";
    if (!formData.dueDate) newErrors.dueDate = "Due date is required";
    if (!formData.teacherName) newErrors.teacherName = "Teacher name is required";
    if (!formData.teacherId) newErrors.teacherId = "Teacher ID is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (isEditing) {
      // Update existing assignment
      setAssignments(assignments.map(assignment =>
        assignment.id === isEditing ? { ...formData, id: isEditing } : assignment
      ));
      setIsEditing(null);
    } else {
      // Add new assignment
      const newAssignment: Assignment = {
        ...formData,
        id: Date.now().toString(),
      };
      setAssignments([...assignments, newAssignment]);
    }

    // Reset form
    setFormData({
      course: "",
      semester: "",
      subject: "",
      title: "",
      dueDate: "",
      teacherName: "",
      teacherId: "",
    });
  };

  // Handle edit
  const handleEdit = (assignment: Assignment) => {
    setFormData({
      course: assignment.course,
      semester: assignment.semester,
      subject: assignment.subject,
      title: assignment.title,
      dueDate: assignment.dueDate,
      teacherName: assignment.teacherName,
      teacherId: assignment.teacherId,
    });
    setIsEditing(assignment.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle delete
  const handleDelete = (id: string) => {
    setAssignments(assignments.filter(assignment => assignment.id !== id));
    if (isEditing === id) {
      setIsEditing(null);
      setFormData({
        course: "",
        semester: "",
        subject: "",
        title: "",
        dueDate: "",
        teacherName: "",
        teacherId: "",
      });
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setIsEditing(null);
    setFormData({
      course: "",
      semester: "",
      subject: "",
      title: "",
      dueDate: "",
      teacherName: "",
      teacherId: "",
    });
    setErrors({});
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get days until due
  const getDaysUntilDue = (dateString: string) => {
    const dueDate = new Date(dateString);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get status badge based on due date
  const getStatusBadge = (dateString: string) => {
    const days = getDaysUntilDue(dateString);

    if (days < 0) {
      return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Overdue</span>;
    } else if (days === 0) {
      return <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">Due Today</span>;
    } else if (days <= 3) {
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Due Soon</span>;
    } else {
      return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Scheduled</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="flex">
        <Sidebar userRole="admin" />
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <motion.h1
                className="text-4xl font-bold text-gray-800 mb-2"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Assignment Manager
              </motion.h1>
              <motion.p
                className="text-gray-600 max-w-2xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                Organize and track all your course assignments in one place
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Plus className="h-5 w-5 text-blue-600" />
                    </div>
                    {isEditing ? "Edit Assignment" : "Add New Assignment"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="course" className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-blue-500" />
                          Course *
                        </Label>
                        <Select
                          value={formData.course}
                          onValueChange={(value) => handleSelectChange("course", value)}
                        >
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select course" />
                          </SelectTrigger>
                          <SelectContent>
                            {courses.map(course => (
                              <SelectItem key={course} value={course}>{course}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.course && <p className="text-sm text-red-500">{errors.course}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="semester" className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          Semester *
                        </Label>
                        <Select
                          value={formData.semester}
                          onValueChange={(value) => handleSelectChange("semester", value)}
                        >
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select semester" />
                          </SelectTrigger>
                          <SelectContent>
                            {semesters
                              .filter((semester) => {
                                // Show semesters only if course is selected
                                if (!formData.course) return false;
                                // For B.Tech: semesters 1-8, for BCA: semesters 1-6
                                const semesterNum = parseInt(semester);
                                if (formData.course === "B.Tech") {
                                  return semesterNum >= 1 && semesterNum <= 8;
                                } else if (formData.course === "BCA") {
                                  return semesterNum >= 1 && semesterNum <= 6;
                                }
                                return false;
                              })
                              .map(semester => (
                                <SelectItem key={semester} value={semester}>{semester}</SelectItem>
                              ))
                            }
                          </SelectContent>
                        </Select>
                        {errors.semester && <p className="text-sm text-red-500">{errors.semester}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject" className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-blue-500" />
                          Subject *
                        </Label>
                        <Select
                          value={formData.subject}
                          onValueChange={(value) => handleSelectChange("subject", value)}
                        >
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                          <SelectContent>
                            {filteredSubjects.length > 0 ? (
                              filteredSubjects.map(subject => (
                                <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-subjects" disabled>No subjects available</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        {errors.subject && <p className="text-sm text-red-500">{errors.subject}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="title" className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-blue-500" />
                          Assignment Title *
                        </Label>
                        <Input
                          id="title"
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          placeholder="Enter assignment title"
                          className="h-12"
                        />
                        {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dueDate" className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-500" />
                          Due Date *
                        </Label>
                        <Input
                          id="dueDate"
                          name="dueDate"
                          type="date"
                          value={formData.dueDate}
                          onChange={handleChange}
                          className="h-12"
                        />
                        {errors.dueDate && <p className="text-sm text-red-500">{errors.dueDate}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="teacherName" className="flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-500" />
                          Teacher *
                        </Label>
                        <Select
                          value={formData.teacherName}
                          onValueChange={(value) => {
                            handleSelectChange("teacherName", value);
                            const teacher = teachers.find(t => t.name === value);
                            if (teacher) {
                              handleSelectChange("teacherId", teacher.id);
                            }
                          }}
                        >
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select teacher" />
                          </SelectTrigger>
                          <SelectContent>
                            {teachers.map(teacher => (
                              <SelectItem key={teacher.id} value={teacher.name}>{teacher.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.teacherName && <p className="text-sm text-red-500">{errors.teacherName}</p>}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button
                        type="submit"
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 transition-colors"
                      >
                        {isEditing ? "Update Assignment" : "Add Assignment"}
                      </Button>
                      {isEditing && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancel}
                          className="px-6 py-3 border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <Calendar className="h-5 w-5 text-indigo-600" />
                      </div>
                      Assignments
                    </CardTitle>
                    <div className="relative w-full md:w-64">
                      <Input
                        placeholder="Search assignments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-10"
                      />
                      <svg
                        className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredAssignments.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Calendar className="h-12 w-12 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No assignments found</h3>
                      <p className="text-gray-500">
                        {searchTerm ? "Try a different search term" : "Add your first assignment to get started"}
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-black overflow-hidden">
                      <Table>
                        <TableHeader className="bg-gray-50">
                          <TableRow>
                            <TableHead className="font-medium">Assignment</TableHead>
                            <TableHead className="font-medium">Course</TableHead>
                            <TableHead className="font-medium">Due Date</TableHead>
                            <TableHead className="font-medium">Teacher</TableHead>
                            <TableHead className="font-medium text-right">Status</TableHead>
                            <TableHead className="font-medium text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <AnimatePresence>
                            {filteredAssignments.map((assignment) => (
                              <motion.tr
                                key={assignment.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="border-b border-gray-100 hover:bg-gray-50"
                              >
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-3">
                                    <div className="bg-blue-100 p-2 rounded-lg">
                                      <BookOpen className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                      <div className="font-medium">{assignment.title}</div>
                                      <div className="text-sm text-gray-500">{assignment.subject}</div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="font-medium">{assignment.course}</div>
                                  <div className="text-sm text-gray-500">{assignment.semester}</div>
                                </TableCell>
                                <TableCell>
                                  <div className="font-medium">{formatDate(assignment.dueDate)}</div>
                                  <div className="text-sm text-gray-500">
                                    {getDaysUntilDue(assignment.dueDate) < 0
                                      ? `${Math.abs(getDaysUntilDue(assignment.dueDate))} days ago`
                                      : `${getDaysUntilDue(assignment.dueDate)} days left`}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div className="bg-gray-100 p-1.5 rounded-full">
                                      <User className="h-4 w-4 text-gray-600" />
                                    </div>
                                    <div>
                                      <div className="font-medium">{assignment.teacherName}</div>
                                      <div className="text-sm text-gray-500">ID: {assignment.teacherId}</div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  {getStatusBadge(assignment.dueDate)}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleEdit(assignment)}
                                      className="border-gray-300 hover:bg-gray-50"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDelete(assignment.id)}
                                      className="border-red-300 text-red-600 hover:bg-red-50"
                                    >
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </motion.tr>
                            ))}
                          </AnimatePresence>
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
