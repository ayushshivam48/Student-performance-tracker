import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, IdCard, LogIn } from "lucide-react";
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

import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthStore } from "@/store/auth";
import type { UserRole } from "@/store/auth";
import api from "@/lib/api";

// Types
interface LoginPayload {
  password: string;
  email?: string;
  identifier?: string;
  selectedRole?: 'admin' | 'teacher' | 'student';
}

interface LoginResponse {
  user: {
    _id: string;
    name: string;
    email: string;
    role: UserRole;
    enrollment?: string;
    teacherId?: string;
  };
  token: string;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

const Login = () => {
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    enrollmentOrId: "",
    password: "",
    role: "student",
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setFormData({ email: "", enrollmentOrId: "", password: "", role: "student" });
    setErrorMsg("");
    setSuccessMsg("");
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg("");
    if (successMsg) setSuccessMsg("");
  };

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value, email: "", enrollmentOrId: "" }));
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    const { email, enrollmentOrId, password } = formData;

    if (!email.trim() && !enrollmentOrId.trim()) {
      setErrorMsg("Please enter your email or enrollment/teacher/admin ID.");
      return;
    }
    if (!password.trim()) {
      setErrorMsg("Password is required.");
      return;
    }

    setLoading(true);

    try {
      // Call server login API
      const payload: LoginPayload = {
        password: formData.password,
        selectedRole: formData.role as 'admin' | 'teacher' | 'student'
      };
      if (formData.email.trim()) {
        payload.email = formData.email.trim();
      } else {
        payload.identifier = formData.enrollmentOrId.trim();
      }
      const response = await api.post<LoginResponse>('/auth/login', payload);
      const { user, token } = response.data;

      // Use auth store login method
      login(user, token);

      setSuccessMsg("Login successful! Redirecting...");

      // Redirect based on role using React Router
      if (user.role === "teacher") {
        navigate("/teacher/dashboard");
      } else if (user.role === "student") {
        navigate("/student/dashboard");
      } else if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (error: unknown) {
      const apiError = error as ApiError;
      if (apiError.response?.data?.message) {
        setErrorMsg(apiError.response.data.message);
      } else if (apiError.message) {
        setErrorMsg(apiError.message);
      } else {
        setErrorMsg("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 px-4 py-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 transform -skew-y-6"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-7xl bg-white/95 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden grid lg:grid-cols-2 relative border border-gray-200/50"
      >
        {/* Left Side - Visual */}
        <div
          className="relative bg-cover bg-center flex flex-col justify-center items-center text-center p-12 hidden lg:flex"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-purple-500/20 rounded-3xl"></div>
          <div className="relative z-10 text-white">
            <h2 className="text-3xl font-bold mb-4">Welcome Back</h2>
            <p className="text-lg opacity-90">Sign in to continue your educational journey</p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="p-6 sm:p-10 bg-white/95 backdrop-blur-xl rounded-3xl relative z-10">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex p-4 rounded-full bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 mb-4"
            >
              <LogIn className="w-10 h-10 text-blue-600" />
            </motion.div>
            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent"
            >
              Sign In to Your Account
            </motion.h3>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600 mt-2"
            >
              Enter your credentials to access your dashboard
            </motion.p>
          </div>

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <AlertDescription className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium">{successMsg}</span>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Alert variant="destructive">
                <AlertDescription className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">{errorMsg}</span>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          <motion.form
            onSubmit={handleSubmit}
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="space-y-2">
              <Label htmlFor="role" className="text-black">Role</Label>
              <Select value={formData.role} onValueChange={handleRoleChange}>
                <SelectTrigger className="w-full text-black">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.role === 'admin' ? (
              <div className="space-y-2">
                <Label htmlFor="email" className="text-black flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="py-5 text-black bg-white"
                  required
                />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-black flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email (Optional)
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="py-5 text-black bg-white"
                  />
                  <p className="text-xs text-gray-700">Or use Enrollment/Teacher ID below</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="enrollmentOrId" className="text-black flex items-center gap-2">
                    <IdCard className="w-4 h-4" />
                    {formData.role === "student" ? "Enrollment Number" : "Teacher ID"}
                  </Label>
                  <Input
                    id="enrollmentOrId"
                    name="enrollmentOrId"
                    type="text"
                    placeholder={`Enter your ${formData.role === "student" ? "enrollment number" : "ID"}`}
                    value={formData.enrollmentOrId}
                    onChange={handleChange}
                    className="py-5 text-black bg-white"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="password" className="text-black flex items-center gap-2 bg-white">
                <Lock className="w-4 h-4" />
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="py-5 pr-12 text-black bg-white"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white text-black border-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                disabled={loading}
                className="w-full py-6 text-lg font-semibold"
              >
                {loading ? (
                  <>
                    <svg className="mr-3 h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Authenticating...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </motion.div>
          </motion.form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-8 text-center text-sm text-gray-600"
          >
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="font-medium text-blue-600 hover:underline focus:outline-none border-0"
            >
              Register here
            </button>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
