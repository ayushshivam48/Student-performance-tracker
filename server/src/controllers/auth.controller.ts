import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/User.js';
import { Student } from '../models/Student.js';
import { Teacher } from '../models/Teacher.js';
import type { Request, Response } from 'express';
import type { UserRole, JWTPayload } from '../utils/roles.js';

const signupSchema = z.object({
	name: z.string().min(2),
	email: z.string().email(),
	password: z.string().min(6),
	role: z.enum(['admin', 'teacher', 'student']),
	phone: z.string().optional(),
	dob: z.string().optional(),
	address: z.string().optional(),
	institute: z.string().optional(),
	department: z.string().optional(),
	specification: z.string().optional(),
	teacherId: z.string().optional(),
	course: z.string().optional(),
	semester: z.string().optional(),
	enrollment: z.string().optional(),
});

export async function signup(req: Request, res: Response) {
	const parsed = signupSchema.safeParse(req.body);
	if (!parsed.success) return res.status(400).json(parsed.error.flatten());

	const { name, email, password, role, phone, dob, address, institute, department, specification, teacherId, course, semester, enrollment } = parsed.data;

	const existing = await User.findOne({ email });
	if (existing) return res.status(409).json({ message: 'Email already in use' });

	const passwordHash = await bcrypt.hash(password, 10);
	const user = await User.create({ name, email, passwordHash, role });

	if (role === 'student') {
		// Check if enrollment already exists
		if (enrollment) {
			const existingStudent = await Student.findOne({ enrollment: enrollment.toUpperCase() });
			if (existingStudent) return res.status(409).json({ message: 'Enrollment number already exists' });
		}

		await Student.create({
			user: user._id,
			enrollment: enrollment || 'TEMP' + user._id.toString().slice(-4),
			course: course || 'B.Tech',
			currentSemester: semester ? parseInt(semester) : 1,
			semester: semester ? parseInt(semester) : 1,
			phone,
			dob: dob ? new Date(dob) : undefined,
			address,
		});
	} else if (role === 'teacher') {
		// Check if teacherId already exists
		if (teacherId) {
			const existingTeacher = await Teacher.findOne({ teacherId: teacherId.toUpperCase() });
			if (existingTeacher) return res.status(409).json({ message: 'Teacher ID already exists' });
		}

		await Teacher.create({
			user: user._id,
			teacherId: teacherId || 'TEMP' + user._id.toString().slice(-4),
			specialization: specification,
			phone,
			dob: dob ? new Date(dob) : undefined,
			address,
		});
	}

	return res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role });
}

const loginSchema = z.object({
	email: z.string().optional(),
	identifier: z.string().optional(),
	password: z.string().min(6),
	selectedRole: z.enum(['admin', 'teacher', 'student']).optional()
}).refine(data => data.email || data.identifier, {
	message: "Either email or identifier must be provided"
});

export async function login(req: Request, res: Response) {
	try {
		// Check if JWT_SECRET is configured
		if (!process.env.JWT_SECRET) {
			console.error('❌ JWT_SECRET environment variable is not set');
			return res.status(500).json({ message: 'Server configuration error' });
		}

		const parsed = loginSchema.safeParse(req.body);
		if (!parsed.success) {
			console.log('❌ Login validation failed:', parsed.error.flatten());
			return res.status(400).json(parsed.error.flatten());
		}

		const { email, identifier, password } = parsed.data;
		console.log(`🔍 Login attempt for: ${email || identifier}`);

		let user;
		if (email) {
			user = await User.findOne({ email: email.toLowerCase() });
		} else if (identifier) {
			// First, try to find by email (for admin or if email used as identifier)
			user = await User.findOne({ email: identifier.toLowerCase() });
			if (!user) {
				// Try to find by enrollment (student)
				const student = await Student.findOne({ enrollment: identifier.toUpperCase() });
				if (student) {
					user = await User.findById(student.user);
				} else {
					// Try to find by teacherId (teacher)
					const teacher = await Teacher.findOne({ teacherId: identifier.toUpperCase() });
					if (teacher) {
						user = await User.findById(teacher.user);
					}
				}
			}
		}

		if (!user) {
			console.log('❌ Login failed: User not found');
			return res.status(401).json({ message: 'Invalid credentials' });
		}

		// Additional validation: confirm name and enrollment/teacherId match for student/teacher
		if (user.role === 'student' && identifier) {
			const student = await Student.findOne({ user: user._id });
			if (!student || (student.enrollment as string).toUpperCase() !== identifier.toUpperCase()) {
				console.log('❌ Login failed: Invalid student enrollment');
				return res.status(401).json({ message: 'Invalid student enrollment' });
			}
		} else if (user.role === 'teacher' && identifier) {
			const teacher = await Teacher.findOne({ user: user._id });
			if (!teacher || (teacher.teacherId as string).toUpperCase() !== identifier.toUpperCase()) {
				console.log('❌ Login failed: Invalid teacher ID');
				return res.status(401).json({ message: 'Invalid teacher ID' });
			}
		}

		const ok = await bcrypt.compare(password, user.passwordHash);
		if (!ok) {
			console.log('❌ Login failed: Invalid password');
			return res.status(401).json({ message: 'Invalid credentials' });
		}

		// Role validation: Check if selected role matches actual user role
		const { selectedRole } = parsed.data;
		if (selectedRole && user.role !== selectedRole) {
			console.log(`❌ Login failed: Role mismatch. User role: ${user.role}, Selected role: ${selectedRole}`);
			const roleMessages = {
				student: 'Please select "Student" role to login with student credentials',
				teacher: 'Please select "Teacher" role to login with teacher credentials',
				admin: 'Please select "Admin" role to login with admin credentials'
			};
			return res.status(401).json({
				message: roleMessages[user.role as keyof typeof roleMessages] || 'Invalid role selection'
			});
		}

		const payload: JWTPayload = { userId: user._id.toString(), role: user.role as UserRole };
		const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

		res.cookie('token', token, {
			httpOnly: true,
			sameSite: 'lax',
			secure: process.env.NODE_ENV === 'production'
		});

		console.log(`✅ Login successful for user: ${user.email} (${user.role})`);
		return res.json({ token, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
	} catch (error) {
		console.error('❌ Login error:', error);
		return res.status(500).json({ message: 'Internal server error' });
	}
}

export function logout(_req: Request, res: Response) {
	res.clearCookie('token');
	return res.json({ ok: true });
}

export async function me(req: Request, res: Response) {
	if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
	const user = await User.findById(req.user.userId).select('name email role');
	return res.json(user);
}