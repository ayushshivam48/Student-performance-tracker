import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Edit,
  Trash2,
  User,
  Mail,
  BookOpen,
  Calendar,
  Save,
  X
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Sidebar from "@/components/shared/Sidebar";
import { useAuthStore } from "@/store/auth";

// Define types for our data structures
interface Student {
  _id: string;
  name: string;
  enrollment: string;
  email: string;
  course: string;
  semester: number;
}

const courses = ["B.Tech", "BCA"];

const SearchStudents = () => {
	const { user: authUser } = useAuthStore();
	const [students, setStudents] = useState<Student[]>([]);
	const [query, setQuery] = useState('');
	const [editingStudent, setEditingStudent] = useState<Student | null>(null);
	const [loading, setLoading] = useState(false);
	const [errorMsg, setErrorMsg] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

	useEffect(() => {
		const fetchStudents = async () => {
			setLoading(true);
			setErrorMsg('');
			try {
				// Simulating API call with mock data
        const mockData: Student[] = [
          {
            _id: "1",
            name: "Alex Johnson",
            enrollment: "STU001",
            email: "alex.johnson@university.edu",
            course: "B.Tech",
            semester: 3
          },
          {
            _id: "2",
            name: "Maria Garcia",
            enrollment: "STU002",
            email: "maria.garcia@university.edu",
            course: "BCA",
            semester: 2
          },
          {
            _id: "3",
            name: "James Wilson",
            enrollment: "STU003",
            email: "james.wilson@university.edu",
            course: "B.Tech",
            semester: 4
          }
        ];
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
				setStudents(mockData);
			} catch {
				setStudents([]);
				setErrorMsg('Failed to load students.');
			} finally {
				setLoading(false);
			}
		};
		fetchStudents();
	}, []);

	const filteredStudents = students.filter((student) => {
		const nameLower = (student.name || '').toLowerCase();
		const enrollmentLower = (student.enrollment || '').toLowerCase();
		const q = query.toLowerCase();
		return nameLower.includes(q) || enrollmentLower.includes(q);
	});

	const handleDelete = async (id: string) => {
		// Simulate API call
		await new Promise(resolve => setTimeout(resolve, 500));
		setStudents((prev) => prev.filter((student) => student._id !== id));
		if (editingStudent && editingStudent._id === id) setEditingStudent(null);
    setIsDeleteDialogOpen(false);
    setStudentToDelete(null);
	};

	const handleEdit = (student: Student) => {
		setEditingStudent({ ...student });
    setIsEditDialogOpen(true);
	};

	const handleUpdate = async () => {
		if (!editingStudent || !editingStudent._id) return;
		if (!editingStudent.name?.trim() || !editingStudent.enrollment?.trim() || !editingStudent.email?.trim() || !editingStudent.course?.trim() || !editingStudent.semester || isNaN(editingStudent.semester)) {
			alert('Please fill all fields correctly.');
			return;
		}

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
		setStudents((prev) => prev.map((student) => (student._id === editingStudent._id ? editingStudent : student)));
    setIsEditDialogOpen(false);
		setEditingStudent(null);
	};

  const openDeleteDialog = (student: Student) => {
    setStudentToDelete(student);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setStudentToDelete(null);
  };

  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingStudent(null);
  };

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
			<div className="flex">
				<Sidebar userRole="admin" userName={authUser?.name} />
				<main className="flex-1 p-4 md:p-8">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
						className="mb-8"
					>
						<h1 className="text-3xl md:text-4xl font-bold text-gray-800">🎓 Student Management</h1>
						<p className="text-gray-600 mt-2">Manage and search student records</p>
					</motion.div>

					<div className="grid grid-cols-1 gap-6">
          {/* Search Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-blue-600" />
                  Search Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Search by name or enrollment..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="pl-10 py-5"
                    />
                  </div>
                  <Button className="px-6 py-5">
                    <Search className="mr-2 h-4 w-4" /> Search
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Edit Student Modal */}
          {isEditDialogOpen && editingStudent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-md"
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Edit className="h-5 w-5 text-blue-600" />
                      Edit Student
                    </h3>
                    <Button variant="ghost" size="sm" onClick={closeEditDialog}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="edit-name">Name</Label>
                      <div className="relative mt-1">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="edit-name"
                          value={editingStudent.name}
                          onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="edit-enrollment">Enrollment</Label>
                      <div className="relative mt-1">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">#</span>
                        <Input
                          id="edit-enrollment"
                          value={editingStudent.enrollment}
                          onChange={(e) => setEditingStudent({ ...editingStudent, enrollment: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="edit-email">Email</Label>
                      <div className="relative mt-1">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="edit-email"
                          type="email"
                          value={editingStudent.email}
                          onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="edit-course">Course</Label>
                      <div className="relative mt-1">
                        <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Select
                          value={editingStudent.course}
                          onValueChange={(value) => setEditingStudent({ ...editingStudent, course: value })}
                        >
                          <SelectTrigger className="pl-10">
                            <SelectValue placeholder="Select course" />
                          </SelectTrigger>
                          <SelectContent>
                            {courses.map((course) => (
                              <SelectItem key={course} value={course}>
                                {course}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="edit-semester">Semester</Label>
                      <div className="relative mt-1">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Select
                          value={editingStudent.semester.toString()}
                          onValueChange={(value) => setEditingStudent({ ...editingStudent, semester: parseInt(value) })}
                        >
                          <SelectTrigger className="pl-10">
                            <SelectValue placeholder="Select semester" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: editingStudent.course === "B.Tech" ? 8 : 6 }, (_, i) => i + 1).map((sem) => (
                              <SelectItem key={sem} value={sem.toString()}>
                                Semester {sem}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <Button variant="outline" onClick={closeEditDialog}>
                      <X className="mr-2 h-4 w-4" /> Cancel
                    </Button>
                    <Button onClick={handleUpdate}>
                      <Save className="mr-2 h-4 w-4" /> Save Changes
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Delete Confirmation Modal */}
          {isDeleteDialogOpen && studentToDelete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-md"
              >
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-red-100 rounded-full">
                      <Trash2 className="h-5 w-5 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold">Confirm Deletion</h3>
                  </div>

                  <p className="text-gray-600 mb-6">
                    Are you sure you want to delete <span className="font-semibold">{studentToDelete.name}</span>?
                    This action cannot be undone.
                  </p>

                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={closeDeleteDialog}>
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(studentToDelete._id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Students Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Student Records
                  <span className="ml-auto text-sm font-normal text-gray-500">
                    {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {errorMsg && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{errorMsg}</AlertDescription>
                  </Alert>
                )}

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                  </div>
                ) : filteredStudents.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[200px]">Name</TableHead>
                          <TableHead>Enrollment</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Course</TableHead>
                          <TableHead>Semester</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStudents.map((student) => (
                          <TableRow key={student._id}>
                            <TableCell className="font-medium">{student.name}</TableCell>
                            <TableCell>
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                {student.enrollment}
                              </span>
                            </TableCell>
                            <TableCell>{student.email}</TableCell>
                            <TableCell>{student.course}</TableCell>
                            <TableCell>
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                Semester {student.semester}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(student)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openDeleteDialog(student)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <User className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {query ? 'No students match your search.' : 'Get started by adding new students.'}
                    </p>
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
};

export default SearchStudents;
