import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/auth'

// Pages
import Home from './pages/Public/Home'
import Login from './pages/Auth/Login'
import Signup from './pages/Auth/Signup'

// Admin Pages
import AdminDashboard from './pages/Admin/Dashboard'
import AdminAssignments from './pages/Admin/Assignments'
import AdminSearchStudent from './pages/Admin/SearchStudent'
import AdminSearchTeacher from './pages/Admin/SearchTeacher'
import AdminTimeTable from './pages/Admin/TimeTable'

// Teacher Pages
import TeacherDashboard from './pages/Teacher/Dashboard'
import TeacherAnnouncements from './pages/Teacher/Announcements'
import TeacherAttendance from './pages/Teacher/Attendence'
import TeacherGrades from './pages/Teacher/Grades'

// Student Pages
import StudentDashboard from './pages/Student/Dashboard'

// Components
import PrivateRoute from './components/PrivateRoute'

function App() {
  const { isAuthenticated, user } = useAuthStore()

  return (
    <Router>
      <div className="w-screen min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100">
        
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<PrivateRoute allow={['admin']} />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="assignments" element={<AdminAssignments />} />
            <Route path="search-student" element={<AdminSearchStudent />} />
            <Route path="search-teacher" element={<AdminSearchTeacher />} />
            <Route path="timetable" element={<AdminTimeTable />} />
          </Route>

          {/* Teacher Routes */}
          <Route path="/teacher" element={<PrivateRoute allow={['teacher']} />}>
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="announcements" element={<TeacherAnnouncements />} />
            <Route path="attendance" element={<TeacherAttendance />} />
            <Route path="grades" element={<TeacherGrades />} />
          </Route>

          {/* Student Routes */}
          <Route path="/student" element={<PrivateRoute allow={['student']} />}>
            <Route path="dashboard" element={<StudentDashboard />} />
          </Route>

          {/* Default redirect based on user role */}
          <Route
            path="/dashboard"
            element={
              isAuthenticated && user ? (
                user.role === 'admin' ? (
                  <Navigate to="/admin/dashboard" replace />
                ) : user.role === 'teacher' ? (
                  <Navigate to="/teacher/dashboard" replace />
                ) : user.role === 'student' ? (
                  <Navigate to="/student/dashboard" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
