import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { User } from '../models/User.js';
import { Subject } from '../models/Subject.js';
import { Teacher } from '../models/Teacher.js';
import { Student } from '../models/Student.js';
import { Timetable } from '../models/Timetable.js';
import { Admin } from '../models/Admin.js';
import { Result } from '../models/Result.js';
import { Attendance } from '../models/Attendance.js';
import { Announcement } from '../models/Announcement.js';
import { Assignment } from '../models/Assignment.js';
import { btechSubjectsBySemester, bcaSubjectsBySemester, generateSubjectCode } from './subjects.js';
import { predefinedAdmin } from './predefinedUsers.js';
import { dummyTeachersData, dummyStudentsData } from './dummyUsers.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/student_performance';

async function connectDB() {
	await mongoose.connect(MONGO_URI);
	console.log('MongoDB connected for seeding...');
}

async function clearAll() {
	console.log('Clearing collections...');
	await Promise.all([
		User.deleteMany({}),
		Subject.deleteMany({}),
		Teacher.deleteMany({}),
		Student.deleteMany({}),
		Timetable.deleteMany({}),
		Admin.deleteMany({}),
		Result.deleteMany({}),
		Attendance.deleteMany({}),
		Announcement.deleteMany({}),
		Assignment.deleteMany({}),
	]);
	console.log('Collections cleared');
}

async function seedSubjects() {
	console.log('Seeding subjects...');
	for (const [semStr, names] of Object.entries(btechSubjectsBySemester)) {
		const semester = Number(semStr);
		for (const name of names) {
			const code = generateSubjectCode(name, 'B.Tech', semester);
			const existing = await Subject.findOne({ code });
			if (!existing) {
				await Subject.create({ name, code, course: 'B.Tech', semester });
			}
		}
	}
	for (const [semStr, names] of Object.entries(bcaSubjectsBySemester)) {
		const semester = Number(semStr);
		for (const name of names) {
			const code = generateSubjectCode(name, 'BCA', semester);
			const existing = await Subject.findOne({ code });
			if (!existing) {
				await Subject.create({ name, code, course: 'BCA', semester });
			}
		}
	}
	console.log('Subjects seeded');
}

async function seedUsers() {
	console.log('Seeding admin...');
	let adminUser = await User.findOne({ email: predefinedAdmin.email });
	const adminPasswordHash = await bcrypt.hash(predefinedAdmin.password, 10);
	if (!adminUser) {
		adminUser = await User.create({ name: predefinedAdmin.name, email: predefinedAdmin.email, passwordHash: adminPasswordHash, role: 'admin' });
	} else {
		adminUser.passwordHash = adminPasswordHash;
		await adminUser.save();
	}
	const existingAdminDoc = await Admin.findOne({ user: adminUser._id });
	if (!existingAdminDoc) {
		await Admin.create({ user: adminUser._id, name: predefinedAdmin.name, email: predefinedAdmin.email, institute: predefinedAdmin.institute, phone: predefinedAdmin.phone, address: predefinedAdmin.address });
	}

	console.log('Seeding teachers...');
	for (const t of dummyTeachersData) {
		let user = await User.findOne({ email: t.email.toLowerCase() });
		const passwordHash = await bcrypt.hash(t.password, 10);
		if (!user) {
			user = await User.create({ name: t.name, email: t.email.toLowerCase(), passwordHash, role: 'teacher' });
		} else {
			user.passwordHash = passwordHash;
			await user.save();
		}
		const existingTeacher = await Teacher.findOne({ user: user._id });
		if (!existingTeacher) {
			await Teacher.create({ user: user._id, teacherId: t.teacherId.toUpperCase(), specialization: 'General', assignedCourse: t.assignedCourses[0] });
		}
	}

	console.log('Seeding students...');
	for (const s of dummyStudentsData) {
		let user = await User.findOne({ email: s.email.toLowerCase() });
		const passwordHash = await bcrypt.hash(s.password, 10);
		if (!user) {
			user = await User.create({ name: s.name, email: s.email.toLowerCase(), passwordHash, role: 'student' });
		} else {
			user.passwordHash = passwordHash;
			await user.save();
		}
		const existingStudent = await Student.findOne({ user: user._id });
		if (!existingStudent) {
			await Student.create({ user: user._id, enrollment: s.enrollment.toUpperCase(), course: s.course, currentSemester: s.currentSemester, dob: s.dob, semester: s.currentSemester });
		}
	}
	console.log('Users seeded');
}

async function seedTimetable() {
	console.log('Seeding timetable...');

	const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	const timeSlots = ['9-10 AM', '10-11 AM', '11-12 PM', '12-1 PM', '1-2 PM', '2-3 PM'];

	const courses = ['B.Tech', 'BCA'];
	const semesters = [1, 2, 3, 4, 5, 6];

	const teachers = await Teacher.find();

	for (const course of courses) {
		for (const semester of semesters) {
			const subjects = await Subject.find({ course, semester });

			if (subjects.length === 0) continue;

			for (const day of days) {
				// Skip lunch break slot (1-2 PM)
				const availableSlots = timeSlots.filter(slot => slot !== '1-2 PM');

				for (let i = 0; i < Math.min(availableSlots.length, subjects.length, teachers.length); i++) {
					const slot = availableSlots[i];
					const subject = subjects[i % subjects.length];
					const teacher = teachers[i % teachers.length];

					if (!subject || !teacher) continue;

					const existing = await Timetable.findOne({
						day,
						period: slot,
						course,
						semester
					});

					if (!existing) {
						await Timetable.create({
							day,
							period: slot,
							subject: subject.name,
							teacher: teacher.teacherId || String(teacher._id),
							course,
							semester
						});
					}
				}
			}
		}
	}

	console.log('Timetable seeded');
}

async function seedResults() {
	console.log('Seeding results...');
	const students = await Student.find().populate('user');
	for (const student of students) {
		// Only seed results for subjects up to student's currentSemester
		const subjects = await Subject.find({ course: student.course, semester: { $lte: student.currentSemester } });
		for (const subject of subjects) {
			const existing = await Result.findOne({ student: student._id, subject: subject.name });
			if (!existing) {
				await Result.create({
					student: student._id,
					subject: subject.name,
					internal: Math.floor(Math.random() * 11), // 0-10
					external: Math.floor(Math.random() * 11), // 0-10
					semester: subject.semester,
					course: student.course,
				});
			}
		}
	}
	console.log('Results seeded');
}

async function seedAttendance() {
	console.log('Seeding attendance...');
	const students = await Student.find();
	for (const student of students) {
		// Only seed attendance for subjects up to student's currentSemester
		const subjects = await Subject.find({ course: student.course, semester: { $lte: student.currentSemester } });
		for (const subject of subjects) {
			const existing = await Attendance.findOne({ student: student._id, subject: subject.name });
			if (!existing) {
				// Create multiple attendance records for the subject
				const numRecords = Math.floor(Math.random() * 10) + 10; // 10-20 records
				for (let i = 0; i < numRecords; i++) {
					const status = Math.random() > 0.2 ? 'present' : 'absent'; // 80% present
					const date = new Date();
					date.setDate(date.getDate() - i); // Past dates
					await Attendance.create({
						student: student._id,
						subject: subject.name,
						course: student.course,
						semester: subject.semester,
						date,
						status,
					});
				}
			}
		}
	}
	console.log('Attendance seeded');
}

async function seedAnnouncements() {
	console.log('Seeding announcements...');
	const announcements = [
		{
			message: "Welcome to the new semester!",
			date: new Date(),
			semester: 1,
			subject: "Mathematics",
		},
		{
			message: "Midterm exams start next week.",
			date: new Date(),
			semester: 2,
			subject: "Physics",
		},
		{
			message: "Library will be closed on Friday.",
			date: new Date(),
			semester: null,
			subject: null,
		},
		{
			message: "Guest lecture on AI this Thursday.",
			date: new Date(),
			semester: 3,
			subject: "Computer Science",
		},
	];
	for (const announcement of announcements) {
		const existing = await Announcement.findOne({ message: announcement.message });
		if (!existing) {
			await Announcement.create(announcement);
		}
	}
	console.log('Announcements seeded');
}

async function seedAssignments() {
	console.log('Seeding assignments...');
	const teachers = await Teacher.find().populate('user');
	const courses = ['B.Tech', 'BCA'];
	const semesters = [1, 2, 3, 4, 5, 6];

	for (const teacher of teachers) {
		for (const course of courses) {
			for (const semester of semesters) {
				const subjects = await Subject.find({ course, semester });
				if (subjects.length === 0) continue;

				// Create 2-3 assignments per teacher per course per semester
				const numAssignments = Math.floor(Math.random() * 2) + 2;
				for (let i = 0; i < numAssignments; i++) {
					const subject = subjects[Math.floor(Math.random() * subjects.length)];
					if (!subject) continue;
					const dueDate = new Date();
					dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 30) + 7); // 7-37 days from now

					const existing = await Assignment.findOne({
						title: `Assignment ${i + 1} for ${subject.name}`,
						course,
						semester,
						teacherId: teacher.teacherId
					});

					if (!existing) {
						await Assignment.create({
							course,
							semester,
							subject: subject.name,
							title: `Assignment ${i + 1} for ${subject.name}`,
							dueDate,
							teacherName: (teacher.user as any).name,
							teacherId: teacher.teacherId,
						});
					}
				}
			}
		}
	}
	console.log('Assignments seeded');
}

export async function seedData(exitAfter = true) {
	await connectDB();
	await seedSubjects();
	await seedUsers();
	await seedResults();
	await seedAttendance();
	await seedAnnouncements();
	await seedAssignments();
	await seedTimetable();
	console.log('Database seeded successfully!');
	if (exitAfter) process.exit(0);
}

seedData().catch((e) => { console.error(e); process.exit(1); });
