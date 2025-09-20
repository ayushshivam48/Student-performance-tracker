import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  BookOpen,
  Calendar,
  Users,
  GraduationCap,
  LogOut,
  Menu,
  X,
  Search,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";

interface SidebarProps {
  userRole: "admin" | "teacher" | "student";
  userName?: string;
}

const Sidebar = ({ userRole, userName }: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { logout, user: authUser } = useAuthStore();

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const getNavigationItems = () => {
    switch (userRole) {
      case "admin":
        return [
          { path: "/admin/dashboard", label: "Dashboard", icon: User },
          { path: "/admin/assignments", label: "Assignments", icon: BookOpen },
          { path: "/admin/search-student", label: "Search Student", icon: Search },
          { path: "/admin/search-teacher", label: "Search Teacher", icon: Users },
          { path: "/admin/timetable", label: "Time Table", icon: Clock },
        ];
      case "teacher":
        return [
          { path: "/teacher/dashboard", label: "Dashboard", icon: User },
          { path: "/teacher/announcements", label: "Announcements", icon: BookOpen },
          { path: "/teacher/attendance", label: "Attendance", icon: Calendar },
          { path: "/teacher/grades", label: "Grades", icon: BookOpen },
        ];
      case "student":
        return [
          { path: "/student/dashboard", label: "Dashboard", icon: User },
        ];
      default:
        return [];
    }
  };

  const navigationItems = getNavigationItems();
  const portalTitle = userRole === "admin" ? "Admin Portal" : userRole === "teacher" ? "Teacher Portal" : "Student Portal";

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-blue-100 p-2 rounded-lg">
          <GraduationCap className="h-6 w-6 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">{portalTitle}</h2>
      </div>

      {/* Navigation */}
      <nav className="space-y-1 flex-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)} // Close mobile menu on navigation
              className={`flex items-center gap-3 py-3 px-4 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="border-t border-gray-200 pt-4 mt-4">
        {(authUser || userName) && (
          <div className="flex items-center gap-3 mb-4 px-4">
            <div className="bg-gray-100 p-2 rounded-lg">
              <User className="h-4 w-4 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {userName || authUser?.name || "User"}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {authUser?.role || userRole}
              </p>
            </div>
          </div>
        )}

        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-red-50 text-red-600 hover:text-red-700 justify-start"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="outline"
          size="sm"
          className="bg-white/90 backdrop-blur border-white/30 shadow-lg"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 bg-white/90 backdrop-blur-lg border-r border-white/30 p-6 shadow-lg">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Mobile Sidebar */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="md:hidden fixed top-0 left-0 h-full w-64 bg-white/95 backdrop-blur-lg border-r border-white/30 p-6 shadow-xl z-50"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
