import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  BookOpen,
  User,
  Save,
  Eye,
  Plus,
  X,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
interface Subject {
  _id: string;
  name: string;
}

interface Teacher {
  _id: string;
  name: string;
}

interface TimetableEntry {
  day: string;
  period: string;
  subject: string;
  teacher: string;
}

const hours = ['09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', '12:00 - 01:00', '01:00 - 02:00', '02:00 - 03:00'];
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const courses = ['BCA', 'B.Tech'];

const TimetableManager = () => {
  const [mode, setMode] = useState('view');
  const [course, setCourse] = useState('');
  const [semester, setSemester] = useState('');
  const [availableSemesters, setAvailableSemesters] = useState<string[]>([]);
  const [tableData, setTableData] = useState<Record<string, Record<string, { subject: string; teacher: string }>>>({});
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [loadingTimetable, setLoadingTimetable] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [savedTimetable, setSavedTimetable] = useState<TimetableEntry[]>([]);

  useEffect(() => {
    if (course === 'BCA') setAvailableSemesters(['1', '2', '3', '4', '5', '6']);
    else if (course === 'B.Tech') setAvailableSemesters(['1', '2', '3', '4', '5', '6', '7', '8']);
    else setAvailableSemesters([]);
  }, [course]);

  useEffect(() => {
    if (!course || !semester) { setSubjects([]); return; }
    setLoadingSubjects(true); setError('');
    const fetchSubjects = async () => {
      try {
        // Use subjects from subjects.ts based on course and semester
        let subjectsList: string[] = [];
        const semesterNum = parseInt(semester);
        if (course === 'B.Tech') {
          subjectsList = btechSubjectsBySemester[semesterNum as keyof typeof btechSubjectsBySemester] || [];
        } else if (course === 'BCA') {
          subjectsList = bcaSubjectsBySemester[semesterNum as keyof typeof bcaSubjectsBySemester] || [];
        }
        const mockSubjects: Subject[] = subjectsList.map((name, index) => ({
          _id: `${course}_${semester}_${index}`,
          name
        }));
        await new Promise(resolve => setTimeout(resolve, 500));
        setSubjects(mockSubjects);
      } catch (err) {
        setError((err as Error).message || 'Failed to load subjects');
        setSubjects([]);
      } finally {
        setLoadingSubjects(false);
      }
    };
    fetchSubjects();
  }, [course, semester]);

  useEffect(() => {
    if (!course) { setTeachers([]); return; }
    setLoadingTeachers(true); setError('');
    const fetchTeachers = async () => {
      try {
        // Simulating API call with mock data
        const mockTeachers: Teacher[] = [
          { _id: '1', name: 'Dr. Smith' },
          { _id: '2', name: 'Prof. Johnson' },
          { _id: '3', name: 'Dr. Williams' },
          { _id: '4', name: 'Prof. Brown' },
          { _id: '5', name: 'Dr. Davis' },
          { _id: '6', name: 'Prof. Miller' },
        ];
        await new Promise(resolve => setTimeout(resolve, 500));
        setTeachers(mockTeachers);
      } catch (err) {
        setError((err as Error).message || 'Failed to load teachers');
        setTeachers([]);
      } finally {
        setLoadingTeachers(false);
      }
    };
    fetchTeachers();
  }, [course]);

  useEffect(() => {
    if (!course || !semester) {
      setTableData({});
      return;
    }

    if (mode === 'view') {
      setLoadingTimetable(true);
      setError('');

      const fetchTimetable = async () => {
        try {
          // If we have saved timetable data, use it
          if (savedTimetable.length > 0) {
            const initial: Record<string, Record<string, { subject: string; teacher: string }>> = {};
            days.forEach((d) => {
              initial[d] = {};
              hours.forEach((h) => {
                initial[d][h] = { subject: '', teacher: '' };
              });
            });

            savedTimetable.forEach((entry) => {
              if (initial[entry.day] && entry.period in initial[entry.day]) {
                initial[entry.day][entry.period] = {
                  subject: entry.subject,
                  teacher: entry.teacher
                };
              }
            });

            setTableData(initial);
            setLoadingTimetable(false);
            return;
          }

          // Simulating API call with mock data using subjects from subjects.ts
          let mockData: TimetableEntry[] = [];
          if (course === 'B.Tech' && semester === '1') {
            mockData = [
              { day: 'Monday', period: '09:00 - 10:00', subject: 'Programming in C', teacher: 'Dr. Smith' },
              { day: 'Monday', period: '10:00 - 11:00', subject: 'Discrete Mathematics', teacher: 'Prof. Johnson' },
              { day: 'Tuesday', period: '09:00 - 10:00', subject: 'Computer Organization', teacher: 'Dr. Williams' },
            ];
          } else if (course === 'B.Tech' && semester === '2') {
            mockData = [
              { day: 'Monday', period: '09:00 - 10:00', subject: 'Data Structures using C', teacher: 'Dr. Smith' },
              { day: 'Monday', period: '10:00 - 11:00', subject: 'Operating Systems', teacher: 'Prof. Johnson' },
              { day: 'Tuesday', period: '09:00 - 10:00', subject: 'Database Management Systems', teacher: 'Dr. Williams' },
            ];
          } else if (course === 'BCA' && semester === '1') {
            mockData = [
              { day: 'Monday', period: '09:00 - 10:00', subject: 'Programming in C', teacher: 'Dr. Smith' },
              { day: 'Monday', period: '10:00 - 11:00', subject: 'Discrete Mathematics', teacher: 'Prof. Johnson' },
              { day: 'Tuesday', period: '09:00 - 10:00', subject: 'Computer Organization', teacher: 'Dr. Williams' },
            ];
          } else if (course === 'BCA' && semester === '2') {
            mockData = [
              { day: 'Monday', period: '09:00 - 10:00', subject: 'Data Structures', teacher: 'Dr. Smith' },
              { day: 'Monday', period: '10:00 - 11:00', subject: 'Operating Systems', teacher: 'Prof. Johnson' },
              { day: 'Tuesday', period: '09:00 - 10:00', subject: 'Database Management Systems', teacher: 'Dr. Williams' },
            ];
          } else {
            mockData = [
              { day: 'Monday', period: '09:00 - 10:00', subject: 'Computer Networks', teacher: 'Dr. Smith' },
              { day: 'Monday', period: '10:00 - 11:00', subject: 'Software Engineering', teacher: 'Prof. Johnson' },
            ];
          }
          await new Promise(resolve => setTimeout(resolve, 800));

          const initial: Record<string, Record<string, { subject: string; teacher: string }>> = {};
          days.forEach((d) => {
            initial[d] = {};
            hours.forEach((h) => {
              initial[d][h] = { subject: '', teacher: '' };
            });
          });

          mockData.forEach((entry) => {
            if (initial[entry.day] && entry.period in initial[entry.day]) {
              initial[entry.day][entry.period] = {
                subject: entry.subject,
                teacher: entry.teacher
              };
            }
          });

          setTableData(initial);
        } catch (err) {
          setTableData({});
          setError((err as Error).message || 'Failed to load timetable');
        } finally {
          setLoadingTimetable(false);
        }
      };
      fetchTimetable();
    } else {
      // Initialize empty timetable for add mode
      const initial: Record<string, Record<string, { subject: string; teacher: string }>> = {};
      days.forEach((d) => {
        initial[d] = {};
        hours.forEach((h) => {
          initial[d][h] = { subject: '', teacher: '' };
        });
      });
      setTableData(initial);
    }
  }, [mode, course, semester, savedTimetable]);

  const handleChange = useCallback((day: string, hour: string, field: 'subject' | 'teacher', value: string) => {
    let displayValue = value;
    if (field === 'subject') {
      if (value === 'none') {
        displayValue = '';
      } else {
        const subject = subjects.find(s => s._id === value);
        displayValue = subject ? subject.name : '';
      }
    } else if (field === 'teacher') {
      if (value === 'none') {
        displayValue = '';
      } else {
        const teacher = teachers.find(t => t._id === value);
        displayValue = teacher ? teacher.name : '';
      }
    }
    setTableData((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [hour]: {
          ...prev[day][hour],
          [field]: displayValue
        }
      }
    }));
  }, [subjects, teachers]);

  // Helper functions to get stable Select values
  const getSubjectValue = useCallback((cell: { subject: string; teacher: string } | undefined) => {
    if (!cell?.subject) return 'none';
    const subject = subjects.find(s => s.name === cell.subject);
    return subject ? subject._id : 'none';
  }, [subjects]);

  const getTeacherValue = useCallback((cell: { subject: string; teacher: string } | undefined) => {
    if (!cell?.teacher) return 'none';
    const teacher = teachers.find(t => t.name === cell.teacher);
    return teacher ? teacher._id : 'none';
  }, [teachers]);

  const handleSave = async () => {
    setError('');
    setSuccess('');
    
    const entries: TimetableEntry[] = [];
    Object.entries(tableData).forEach(([day, periods]) => {
      Object.entries(periods).forEach(([period, cell]) => {
        // Only save entries where both subject and teacher are provided
        if (period !== '01:00 - 02:00' && cell && 
          typeof cell.subject === 'string' && cell.subject !== '' &&
          typeof cell.teacher === 'string' && cell.teacher !== '') {
          entries.push({
            day,
            period,
            subject: cell.subject,
            teacher: cell.teacher,
          });
        }
      });
    });
    
    if (entries.length === 0) { 
      setError('No valid timetable entries to save. Please add at least one subject with a teacher.'); 
      return; 
    }
    
    // Simulate API call to save timetable
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSavedTimetable(entries);
      setSuccess('Timetable saved successfully!');
      setMode('view');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to save timetable');
    }
  };

  const handleClearCell = (day: string, hour: string) => {
    setTableData((prev) => ({ 
      ...prev, 
      [day]: { 
        ...prev[day], 
        [hour]: { subject: '', teacher: '' } 
      } 
    }));
  };

const renderCellContent = (cell: { subject: string; teacher: string } | undefined) => {
  if (cell?.subject && cell?.teacher) {
    return (
      <div className="text-center">
        <div className="font-semibold text-blue-800">{cell.subject}</div>
        <div className="text-sm text-gray-700 mt-1 flex items-center justify-center">
          <User className="h-3 w-3 mr-1" />
          {cell.teacher}
        </div>
      </div>
    );
  }

  if (cell?.subject) {
    return (
      <div className="text-center">
        <div className="font-semibold text-blue-800">{cell.subject}</div>
        <div className="text-sm text-gray-500 mt-1">No Teacher</div>
      </div>
    );
  }

  if (cell?.teacher) {
    return (
      <div className="text-center">
        <div className="font-semibold text-gray-500">No Subject</div>
        <div className="text-sm text-gray-700 mt-1 flex items-center justify-center">
          <User className="h-3 w-3 mr-1" />
          {cell.teacher}
        </div>
      </div>
    );
  }

  return (
    <div className="text-center text-gray-400 italic">
      Vacant
    </div>
  );
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="flex">
        <Sidebar userRole="admin" />
        <main className="flex-1 p-4 md:p-8">
          <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center gap-3">
            <Calendar className="h-8 w-8 text-blue-600" />
            Timetable Manager
          </h1>
          <p className="text-gray-600 mt-2">Manage and view class schedules</p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6">
          {/* Controls Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="mode">Mode</Label>
                    <div className="relative mt-1">
                      <Select value={mode} onValueChange={setMode}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="view">
                            <div className="flex items-center gap-2">
                              <Eye className="h-4 w-4" />
                              View Saved
                            </div>
                          </SelectItem>
                          <SelectItem value="add">
                            <div className="flex items-center gap-2">
                              <Plus className="h-4 w-4" />
                              Add New
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="course">Course</Label>
                    <div className="mt-1">
                      <Select value={course} onValueChange={setCourse}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select course" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.map((c) => (
                            <SelectItem key={c} value={c}>
                              <div className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4" />
                                {c}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="semester">Semester</Label>
                    <div className="mt-1">
                      <Select
                        value={semester}
                        onValueChange={setSemester}
                        disabled={!course}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select semester" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSemesters.map((s) => (
                            <SelectItem key={s} value={s}>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {s}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex items-end">
                    <Button 
                      className="w-full" 
                      onClick={() => {
                        if (mode === 'view') setMode('add');
                        else setMode('view');
                      }}
                    >
                      {mode === 'view' ? (
                        <div className="flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          Switch to Add Mode
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          Switch to View Mode
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Status Messages */}
          {(error || success) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {error ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : (
                <Alert className="border-green-200 bg-green-50 text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
            </motion.div>
          )}

          {/* Loading State */}
          {(loadingSubjects || loadingTeachers || loadingTimetable) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center justify-center py-8 bg-white/80 backdrop-blur-sm rounded-xl border"
            >
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
                <p className="text-gray-600">Loading timetable data...</p>
              </div>
            </motion.div>
          )}

          {/* Timetable */}
          {course && semester && !loadingTimetable && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    {course} - Semester {semester} Timetable
                  </CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-blue-50">
                        <th className="border p-3 text-left">Day / Time</th>
                        {hours.map((h) => (
                          <th key={h} className="border p-3 text-center font-medium">
                            <div className="flex flex-col items-center">
                              <Clock className="h-4 w-4 text-blue-600 mb-1" />
                              <span>{h}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {days.map((day) => (
                        <tr key={day} className="hover:bg-blue-50/50">
                          <td className="border p-3 font-semibold bg-blue-50">{day}</td>
                          {hours.map((hour) => {
                            const cell = tableData[day]?.[hour];
                            
                            if (hour === '01:00 - 02:00') {
                              return (
                                <td 
                                  key={hour} 
                                  className="border p-3 bg-amber-50 text-center font-medium text-amber-700"
                                >
                                  <div className="flex flex-col items-center">
                                    <Clock className="h-4 w-4 mb-1" />
                                    <span>Free Time</span>
                                  </div>
                                </td>
                              );
                            }
                            
                            if (mode === 'add') {
                              return (
                                <td key={hour} className="border p-2 align-top">
                                  <div className="space-y-2">
                                    <div>
                                      <Label className="text-xs text-gray-500">Subject</Label>
                                      <Select
                                        value={getSubjectValue(cell)}
                                        onValueChange={(value) => handleChange(day, hour, 'subject', value)}
                                        disabled={loadingSubjects}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select subject" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {subjects.map((s) => (
                                            <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    <div>
                                      <Label className="text-xs text-gray-500">Teacher</Label>
                                      <Select
                                        value={getTeacherValue(cell)}
                                        onValueChange={(value) => handleChange(day, hour, 'teacher', value)}
                                        disabled={loadingTeachers}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select teacher" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {teachers.map((t) => (
                                            <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="w-full"
                                      onClick={() => handleClearCell(day, hour)}
                                      disabled={loadingSubjects || loadingTeachers}
                                    >
                                      <X className="h-4 w-4 mr-1" />
                                      Clear
                                    </Button>
                                  </div>
                                </td>
                              );
                            }
                            
                            // View mode - show cell content based on data
                            return (
                              <td 
                                key={hour} 
                                className={`border p-3 ${
                                  cell && cell.subject && cell.teacher 
                                    ? 'bg-blue-100 hover:bg-blue-200' 
                                    : cell && (cell.subject || cell.teacher)
                                      ? 'bg-yellow-50 hover:bg-yellow-100'
                                      : 'bg-gray-50 hover:bg-gray-100'
                                } transition-colors`}
                              >
                                {renderCellContent(cell)}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
              
              {mode === 'add' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="mt-6 flex justify-end"
                >
                  <Button 
                    onClick={handleSave} 
                    disabled={loadingSubjects || loadingTeachers}
                    className="px-6 py-3"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Timetable
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Empty State */}
          {(!course || !semester) && !loadingTimetable && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col items-center justify-center py-16 bg-white/80 backdrop-blur-sm rounded-xl border border-dashed"
            >
              <Calendar className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No timetable selected</h3>
              <p className="text-gray-500 text-center max-w-md">
                Select a course and semester to view or create a timetable
              </p>
            </motion.div>
          )}
        </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TimetableManager;