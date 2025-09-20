import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Phone,
  Calendar,
  MapPin,
  School,
  BookOpen,
  UserCheck,
  Eye,
  EyeOff
} from "lucide-react";
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
import { courses, semestersByCourse } from "@/lib/constants";
import api from "@/lib/api";

const Signup = () => {
  const [formData, setFormData] = useState({
    role: "student",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    dob: "",
    address: "",
    institute: "",
    department: "",
    specification: "",
    teacherId: "",
    course: "",
    semester: "",
    enrollment: "",
  });
  const [errors, setErrors] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [availableSemesters, setAvailableSemesters] = useState<number[]>([]);

  useEffect(() => {
    if (formData.role === "student") {
      setAvailableSemesters([]);
    } else {
      setAvailableSemesters([]);
    }
    setFormData((prev) => ({ ...prev, course: "", semester: "" }));
  }, [formData.role]);

  useEffect(() => {
    if (formData.role === "student") {
      const courseKey = formData.course as keyof typeof semestersByCourse;
      if (formData.course && semestersByCourse[courseKey]) {
        setAvailableSemesters(semestersByCourse[courseKey]);
      } else {
        setAvailableSemesters([]);
      }
      setFormData((prev) => ({ ...prev, semester: "" }));
    }
  }, [formData.course, formData.role]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const { role, name, email, password, confirmPassword, phone, dob, institute } = formData;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name.trim() || !email.trim() || !password || !confirmPassword || !phone.trim() || !dob || !institute.trim()) {
      setErrors("Please fill in all required fields.");
      return false;
    }

    if (!emailRegex.test(email.trim())) {
      setErrors("Please enter a valid email address.");
      return false;
    }

    if (password !== confirmPassword) {
      setErrors("Passwords do not match.");
      return false;
    }

    if (role === "student") {
      if (!formData.course || !formData.semester || !formData.enrollment.trim()) {
        setErrors("Please fill in course, semester, and enrollment number.");
        return false;
      }
    }

    if (role === "teacher") {
      if (!formData.department.trim() || !formData.specification.trim() || !formData.teacherId.trim()) {
        setErrors("Please fill in department, specialization, and teacher ID.");
        return false;
      }
    }

    setErrors("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const signupData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone,
        dob: formData.dob,
        address: formData.address,
        institute: formData.institute,
        department: formData.department,
        specification: formData.specification,
        teacherId: formData.teacherId,
        course: formData.course,
        semester: formData.semester,
        enrollment: formData.enrollment,
      };

      const response = await api.post('/auth/signup', signupData);
      const data = response.data;

      // Store user data and redirect to login
      localStorage.setItem("user", JSON.stringify(data));
      setErrors("Signup successful! Please login with your credentials.");
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrors(error.message || "An unexpected error occurred. Please try again.");
      } else {
        setErrors("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center px-4 py-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 transform -skew-y-6" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-7xl bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden relative z-10 border border-gray-200/50"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left Side - Visual */}
          <div
            className="relative bg-cover bg-center flex flex-col justify-center items-center text-center p-12 hidden lg:flex"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80')" }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-purple-500/20 rounded-l-2xl"></div>
            <div className="relative z-10 text-white max-w-md">
              <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
              <p className="text-lg opacity-90">Create an account to track and improve your academic journey</p>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="p-6 sm:p-10">
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex p-3 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 mb-4"
              >
                <UserCheck className="w-10 h-10 text-blue-600" />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
              >
                Create Your Account
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-gray-600 mt-2"
              >
                Join us to track and improve your academic journey
              </motion.p>
            </div>

            {errors && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <Alert variant="destructive">
                  <AlertDescription className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 018 0" />
                    </svg>
                    <span className="font-medium">{errors}</span>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <Label htmlFor="role" className="text-black font-semibold flex items-center gap-2 mb-2">
                    <User className="w-4 h-4" />
                    Role
                  </Label>
                  <Select value={formData.role} onValueChange={(value) => handleSelectChange("role", value)}>
                    <SelectTrigger className="!text-black border-gray-300">
                      <SelectValue placeholder="Select role" className="text-black" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="name" className="text-gray-700 flex items-center gap-2 mb-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </Label>
                  <Input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    className="py-5 text-black"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-gray-700 flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <Input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@edu.in"
                    required
                    className="py-5 text-black"
                  />
                </div>

                <div className="relative">
                  <Label htmlFor="password" className="text-gray-700 flex items-center gap-2 mb-2">
                    <Lock className="w-4 h-4" />
                    Password
                  </Label>
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••"
                    required
                    className="py-5 pr-12 text-black"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-3 top-2/3 transform -translate-y-1/2 text-black"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>

                <div className="relative">
                  <Label htmlFor="confirmPassword" className="text-gray-700 flex items-center gap-2 mb-2">
                    <Lock className="w-4 h-4" />
                    Confirm Password
                  </Label>
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••"
                    required
                    className="py-5 pr-12 text-black"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-3 top-2/3 transform -translate-y-1/2 text-black "
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>

                <div>
                  <Label htmlFor="phone" className="text-gray-700 flex items-center gap-2 mb-2">
                    <Phone className="w-4 h-4" />
                    Phone
                  </Label>
                  <Input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="1234567890"
                    className="py-5 text-black"
                  />
                </div>

                <div>
                  <Label htmlFor="dob" className="text-gray-700 flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4" />
                    Date of Birth
                  </Label>
                  <Input
                    type="date"
                    name="dob"
                    id="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    max={new Date().toISOString().slice(0,10)}
                    className="py-5 text-black"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="address" className="text-gray-700 flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4" />
                    Address
                  </Label>
                  <Input
                    type="text"
                    name="address"
                    id="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="123 Street, City"
                    className="py-5 text-black"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="institute" className="text-gray-700 flex items-center gap-2 mb-2">
                    <School className="w-4 h-4" />
                    Institute
                  </Label>
                  <Input
                    type="text"
                    name="institute"
                    id="institute"
                    value={formData.institute}
                    onChange={handleChange}
                    placeholder="ABC Institute"
                    required
                    className="py-5"
                  />
                </div>

                {formData.role === "student" && (
                  <>
                    <div>
                      <Label htmlFor="course" className="text-black font-semibold flex items-center gap-2 mb-2">
                        <BookOpen className="w-4 h-4" />
                        Course
                      </Label>
                      <Select value={formData.course} onValueChange={(value) => handleSelectChange("course", value)}>
                        <SelectTrigger className="!text-black border-gray-300">
                          <SelectValue placeholder="Choose course" className="text-black" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="semester" className="text-black font-semibold flex items-center gap-2 mb-2">
                        <BookOpen className="w-4 h-4" />
                        Semester
                      </Label>
                      <Select
                        value={formData.semester}
                        onValueChange={(value) => handleSelectChange("semester", value)}
                        disabled={availableSemesters.length === 0}
                      >
                        <SelectTrigger className="!text-black border-gray-300">
                          <SelectValue placeholder="Select semester" className="text-black" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSemesters.map((sem) => (
                            <SelectItem key={sem} value={String(sem)}>{sem}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="enrollment" className="text-gray-700 flex items-center gap-2 mb-2">
                        <UserCheck className="w-4 h-4" />
                        Enrollment Number
                      </Label>
                      <Input
                        type="text"
                        name="enrollment"
                        id="enrollment"
                        value={formData.enrollment}
                        onChange={handleChange}
                        placeholder="Enter enrollment number"
                        required
                        className="py-5 text-black"
                      />
                    </div>
                  </>
                )}

                {formData.role === "teacher" && (
                  <>
                    <div>
                      <Label htmlFor="department" className="text-gray-700 flex items-center gap-2 mb-2">
                        <School className="w-4 h-4" />
                        Department
                      </Label>
                      <Input
                        type="text"
                        name="department"
                        id="department"
                        value={formData.department}
                        onChange={handleChange}
                        placeholder="CSE, ECE, etc."
                        required
                        className="py-5 text-black"
                      />
                    </div>

                    <div>
                      <Label htmlFor="specification" className="text-gray-700 flex items-center gap-2 mb-2">
                        <BookOpen className="w-4 h-4" />
                        Specialization
                      </Label>
                      <Input
                        type="text"
                        name="specification"
                        id="specification"
                        value={formData.specification}
                        onChange={handleChange}
                        placeholder="Networking, AI, etc."
                        required
                        className="py-5 text-black"
                      />
                    </div>

                    <div>
                      <Label htmlFor="teacherId" className="text-gray-700 flex items-center gap-2 mb-2">
                        <UserCheck className="w-4 h-4" />
                        Teacher ID
                      </Label>
                      <Input
                        type="text"
                        name="teacherId"
                        id="teacherId"
                        value={formData.teacherId}
                        onChange={handleChange}
                        placeholder="Teacher unique ID"
                        required
                        className="py-5 text-black"
                      />
                    </div>
                  </>
                )}
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-8"
              >
                <Button
                  type="submit"
                  className="w-full py-6 text-lg font-semibold"
                >
                  {formData.role === "student" ? "Sign Up as Student" : formData.role === "teacher" ? "Sign Up as Teacher" : "Sign Up as Admin"}
                </Button>
              </motion.div>
            </motion.form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-8 text-center text-sm text-gray-600"
            >
              Already have an account?{" "}
              <button
                onClick={() => window.location.href = "/login"}
                className="text-blue-600 hover:underline font-medium"
              >
                Login
              </button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
