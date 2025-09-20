import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Edit,
  Trash2,
  User,
  Mail,
  IdCard,
  BookOpen,
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
import { btechSubjectsBySemester, bcaSubjectsBySemester } from "@/lib/student";

// Define types for our data structures
interface Teacher {
  _id: string;
  name: string;
  email: string;
  teacherId: string;
  specialization: string;
}

const getAllSubjects = () => {
  const subjects = new Set<string>();

  // Add B.Tech subjects
  Object.values(btechSubjectsBySemester).forEach(semesterSubjects => {
    semesterSubjects.forEach(subject => subjects.add(subject));
  });

  // Add BCA subjects
  Object.values(bcaSubjectsBySemester).forEach(semesterSubjects => {
    semesterSubjects.forEach(subject => subjects.add(subject));
  });

  return Array.from(subjects).sort();
};

const SearchTeachers = () => {
	const [searchTerm, setSearchTerm] = useState("");
	const [teachers, setTeachers] = useState<Teacher[]>([]);
	const [filtered, setFiltered] = useState<Teacher[]>([]);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [formData, setFormData] = useState({ name: "", email: "", teacherId: "", specialization: "" });
	const [loading, setLoading] = useState(false);
	const [errorMsg, setErrorMsg] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

	useEffect(() => {
		const fetchTeachers = async () => {
			setLoading(true);
			setErrorMsg("");
			try {
				// Simulating API call with mock data
        const mockData: Teacher[] = [
          {
            _id: "1",
            name: "Dr. Sarah Johnson",
            email: "sarah.johnson@university.edu",
            teacherId: "TCH001",
            specialization: "Data Structures & Algorithms"
          },
          {
            _id: "2",
            name: "Prof. Michael Chen",
            email: "michael.chen@university.edu",
            teacherId: "TCH002",
            specialization: "Data Structures using C"
          },
          {
            _id: "3",
            name: "Dr. Emily Rodriguez",
            email: "emily.rodriguez@university.edu",
            teacherId: "TCH003",
            specialization: "Web Development"
          },
          {
            _id: "4",
            name: "Prof. David Wilson",
            email: "david.wilson@university.edu",
            teacherId: "TCH004",
            specialization: "Database Management Systems"
          }
        ];
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
				setTeachers(mockData);
			} catch {
				setErrorMsg("Error loading teachers");
				setTeachers([]);
			} finally {
				setLoading(false);
			}
		};
		fetchTeachers();
	}, []);

	useEffect(() => {
		const term = searchTerm.trim().toLowerCase();
		if (!term) {
      setFiltered(teachers);
      return;
    }
		setFiltered(teachers.filter((t) => {
			const name = t.name || "";
			const email = t.email || "";
			const id = t.teacherId || "";
      const specialization = t.specialization || "";
			return name.toLowerCase().includes(term) ||
              email.toLowerCase().includes(term) ||
              id.toLowerCase().includes(term) ||
              specialization.toLowerCase().includes(term);
		}));
	}, [searchTerm, teachers]);

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: "", email: "", teacherId: "", specialization: "" });
    setIsEditDialogOpen(false);
  };

	const handleUpdate = async () => {
		if (!formData.name.trim() || !formData.email.trim() || !formData.teacherId.trim() || !formData.specialization.trim()) {
      alert("Please fill all fields.");
      return;
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

		setTeachers((prev) => prev.map((t) => (t._id === editingId ? { ...t, ...formData } : t)));
		cancelEdit();
	};

	const handleDelete = async (id: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

		setTeachers((prev) => prev.filter((t) => t._id !== id));
		if (editingId === id) cancelEdit();
    closeDeleteDialog();
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

  const openDeleteDialog = (teacher: Teacher) => {
    setTeacherToDelete(teacher);
    setIsDeleteDialogOpen(true);
  };

  const startEdit = (teacher: Teacher) => {
		setEditingId(teacher._id);
		setFormData({
      name: teacher.name || "",
      email: teacher.email || "",
      teacherId: teacher.teacherId || "",
      specialization: teacher.specialization || ""
    });
    setIsEditDialogOpen(true);
	};

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setTeacherToDelete(null);
  };

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
			<div className="flex">
				<Sidebar userRole="admin" />
				<main className="flex-1 p-4 md:p-8">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
						className="mb-8"
					>
						<h1 className="text-3xl md:text-4xl font-bold text-gray-800">🏫 Teacher Management</h1>
						<p className="text-gray-600 mt-2">Manage and search teacher records</p>
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
                  Search Teachers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Search by name, email, ID, or specialization..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
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

          {/* Edit Teacher Modal */}
          {isEditDialogOpen && (
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
                      Edit Teacher
                    </h3>
                    <Button variant="ghost" size="sm" onClick={cancelEdit}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="edit-name">Full Name</Label>
                      <div className="relative mt-1">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="edit-name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="pl-10"
                          placeholder="Enter full name"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="edit-email">Email Address</Label>
                      <div className="relative mt-1">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="edit-email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="pl-10"
                          placeholder="Enter email address"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="edit-teacherId">Teacher ID</Label>
                      <div className="relative mt-1">
                        <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="edit-teacherId"
                          name="teacherId"
                          value={formData.teacherId}
                          onChange={handleInputChange}
                          className="pl-10"
                          placeholder="Enter teacher ID"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="edit-specialization">Specialization</Label>
                      <div className="relative mt-1">
                        <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Select
                          value={formData.specialization}
                          onValueChange={(value) => setFormData((prev) => ({ ...prev, specialization: value }))}
                        >
                          <SelectTrigger className="pl-10">
                            <SelectValue placeholder="Select specialization" />
                          </SelectTrigger>
                          <SelectContent>
                            {getAllSubjects().map((subject) => (
                              <SelectItem key={subject} value={subject}>
                                {subject}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <Button variant="outline" onClick={cancelEdit}>
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
          {isDeleteDialogOpen && teacherToDelete && (
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
                    Are you sure you want to delete <span className="font-semibold">{teacherToDelete.name}</span>?
                    This action cannot be undone.
                  </p>

                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={closeDeleteDialog}>
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(teacherToDelete._id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Teachers Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Teacher Records
                  <span className="ml-auto text-sm font-normal text-gray-500">
                    {filtered.length} teacher{filtered.length !== 1 ? 's' : ''}
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
                ) : filtered.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[200px]">Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>ID</TableHead>
                          <TableHead>Specialization</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filtered.map((teacher) => (
                          <TableRow key={teacher._id}>
                            <TableCell className="font-medium">{teacher.name}</TableCell>
                            <TableCell>{teacher.email}</TableCell>
                            <TableCell>
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                {teacher.teacherId}
                              </span>
                            </TableCell>
                            <TableCell>{teacher.specialization}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => startEdit(teacher)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openDeleteDialog(teacher)}
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
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No teachers found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm ? 'No teachers match your search.' : 'Get started by adding new teachers.'}
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

export default SearchTeachers;
