import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, AlertCircle, Send, BookOpen, Calendar, User } from "lucide-react";
import { format } from "date-fns";
import Sidebar from "@/components/shared/Sidebar";
import { useAuthStore } from "@/store/auth";

interface Assignment {
  course: string;
  semester: string;
  subject: string;
  teacherId?: string;
  teacherName?: string;
  _id?: string;
}

interface Announcement {
  course: string;
  semester: string;
  subject: string;
  message: string;
  date?: Date;
  createdAt?: Date;
  _id?: string;
}

// Mock API service since we can't access the real one
const mockApi = {
  get: async (url: string) => {
    await new Promise(resolve => setTimeout(resolve, 800));

    if (url.includes('/assignments/filter')) {
      return [
        { course: "B.Tech", semester: "1", subject: "Programming in C", teacherName: "Dr. Smith", _id: "1" },
        { course: "B.Tech", semester: "2", subject: "Data Structures using C", teacherName: "Dr. Smith", _id: "2" },
        { course: "BCA", semester: "1", subject: "Programming in C", teacherName: "Prof. Johnson", _id: "3" },
        { course: "BCA", semester: "2", subject: "Data Structures", teacherName: "Dr. Williams", _id: "4" }
      ];
    }

    if (url.includes('/announcements')) {
      // Extract query parameters
      const params = new URLSearchParams(url.split('?')[1]);
      const course = params.get('course');
      const semester = params.get('semester');
      const subject = params.get('subject');

      if (course && semester && subject) {
        return [
          {
            course,
            semester,
            subject,
            message: "Important: Mid-term exams scheduled for next week. Please prepare accordingly.",
            createdAt: new Date(Date.now() - 86400000),
            _id: "a1"
          },
          {
            course,
            semester,
            subject,
            message: "Assignment submission deadline extended to Friday.",
            createdAt: new Date(Date.now() - 172800000),
            _id: "a2"
          }
        ];
      }
      return [];
    }

    return [];
  },

  post: async (_url: string, data: Record<string, unknown>) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { ...data, _id: `new-${Date.now()}`, createdAt: new Date() };
  },

  delete: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true };
  }
};

const AnnouncementPanel = () => {
  const { user: authUser } = useAuthStore();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selected, setSelected] = useState<Assignment | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);
  const [postingAnnouncement, setPostingAnnouncement] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchAssignments = async () => {
      setLoadingAssignments(true);
      setErrorMsg('');
      try {
        const data: Assignment[] = await mockApi.get('/assignments/filter') as Assignment[];
        setAssignments(data);
        setSelected(data.length ? data[0] : null);
      } catch {
        setAssignments([]);
        setSelected(null);
        setErrorMsg('Failed to load assignments. Please try again later.');
      } finally {
        setLoadingAssignments(false);
      }
    };
    fetchAssignments();
  }, []);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      if (!selected) {
        setAnnouncements([]);
        return;
      }
      setLoadingAnnouncements(true);
      setErrorMsg('');
      setSuccessMsg('');
      try {
        const data: Announcement[] = await mockApi.get(`/announcements?course=${selected.course}&semester=${selected.semester}&subject=${selected.subject}`) as Announcement[];
        setAnnouncements(data);
      } catch {
        setAnnouncements([]);
        setErrorMsg('Failed to load announcements. Please try again later.');
      } finally {
        setLoadingAnnouncements(false);
      }
    };
    fetchAnnouncements();
  }, [selected]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncement.trim() || !selected) return;

    setPostingAnnouncement(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const payload = {
        course: selected.course,
        semester: selected.semester,
        subject: selected.subject,
        message: newAnnouncement.trim()
      };
      const response = await mockApi.post('/announcements', payload) as Announcement;
      setNewAnnouncement('');
      setSuccessMsg('Announcement posted successfully!');

      // Add new announcement to the list
      setAnnouncements(prev => [response, ...prev]);
    } catch {
      setErrorMsg('Failed to post announcement. Please try again.');
    } finally {
      setPostingAnnouncement(false);
    }
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;

    try {
      await mockApi.delete();
      setAnnouncements(prev => prev.filter(a => a._id !== announcementId));
      setSuccessMsg('Announcement deleted successfully!');
    } catch {
      setErrorMsg('Failed to delete announcement. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex">
        <Sidebar userRole="teacher" userName={authUser?.name} />

        <main className="flex-1 p-4 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
              <div className="bg-blue-100 p-2 rounded-lg">
                <BookOpen className="text-blue-600" />
              </div>
              Announcements
            </h1>
            <div className="bg-white/80 backdrop-blur border border-white/30 rounded-lg px-4 py-2 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <User className="h-4 w-4" />
                <span>Dr. Smith</span>
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
              {successMsg}
            </div>
          )}

          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-2">
                <Card className="bg-white/90 backdrop-blur border border-white/30 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      Select Course
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingAssignments ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        <span className="ml-2 text-gray-600">Loading courses...</span>
                      </div>
                    ) : assignments.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No courses available</p>
                    ) : (
                      <div className="space-y-4">
                        <Select
                          value={selected ? `${selected.course}-${selected.semester}-${selected.subject}` : ''}
                          onValueChange={(value) => {
                            const assignment = assignments.find(a =>
                              `${a.course}-${a.semester}-${a.subject}` === value
                            );
                            setSelected(assignment || null);
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
                                    {assignment.course} - Sem {assignment.semester}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {selected && (
                          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                            <h3 className="font-semibold text-blue-800 mb-2">Selected Course</h3>
                            <div className="space-y-1 text-sm">
                              <p><span className="font-medium">Subject:</span> {selected.subject}</p>
                              <p><span className="font-medium">Course:</span> {selected.course}</p>
                              <p><span className="font-medium">Semester:</span> {selected.semester}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-2">
                <Card className="bg-white/90 backdrop-blur border border-white/30 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Send className="h-5 w-5 text-blue-600" />
                      Create Announcement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAdd} className="space-y-4">
                      <Textarea
                        placeholder="Type your announcement here..."
                        value={newAnnouncement}
                        onChange={(e) => setNewAnnouncement(e.target.value)}
                        disabled={!selected || postingAnnouncement}
                        className="min-h-[120px]"
                      />
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                          {newAnnouncement.length}/500 characters
                        </div>
                        <Button
                          type="submit"
                          disabled={postingAnnouncement || !newAnnouncement.trim() || !selected}
                          className="flex items-center gap-2"
                        >
                          {postingAnnouncement ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Posting...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4" />
                              Post Announcement
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card className="bg-white/90 backdrop-blur border border-white/30 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Recent Announcements
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingAnnouncements ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-gray-600">Loading announcements...</span>
                  </div>
                ) : announcements.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No announcements yet. Create your first announcement!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {announcements.map((announcement) => (
                      <div
                        key={announcement._id}
                        className="border border-gray-200 rounded-xl p-5 pr-12 bg-gradient-to-r from-white to-blue-50 shadow-sm relative hover:shadow-md transition-shadow"
                      >
                        <p className="text-gray-800 whitespace-pre-wrap mb-4">
                          {announcement.message}
                        </p>
                        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-600">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-4 w-4" />
                              {announcement.subject}
                            </span>
                            <span>Sem {announcement.semester}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(announcement.createdAt || announcement.date || Date.now()), 'MMM d, yyyy')}
                          </div>
                        </div>
                        {announcement._id && (
                          <Button
                            onClick={() => handleDeleteAnnouncement(announcement._id!)}
                            variant="ghost"
                            size="sm"
                            className="absolute top-3 right-3 text-red-500 hover:text-red-700 hover:bg-red-50"
                            title="Delete announcement"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AnnouncementPanel;
