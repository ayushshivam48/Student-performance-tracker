import type { Request, Response } from 'express';
import { Timetable } from '../models/Timetable.js';
import { Teacher } from '../models/Teacher.js';

export async function filterTimetables(req: Request, res: Response) {
	const { role, course, semester, teacher } = req.query as { role?: string; course?: string; semester?: string; teacher?: string };
	const filter: any = {};
	if (course) filter.course = course;
	if (semester) filter.semester = Number(semester);
	if (role === 'teacher' && teacher) filter.teacher = teacher;
	const items = await Timetable.find(filter).lean();
	if (role === 'student') {
		// Fetch teacher names
		const teacherIds = [...new Set(items.map(item => item.teacher))].filter(id => id);
		const teachers = await Teacher.find({ teacherId: { $in: teacherIds } }).populate('user', 'name').lean();
		const teacherMap = new Map(teachers.map(t => [t.teacherId, (t.user as any)?.name || 'Unknown']));

		// transform to day->period mapping like UI expects
		const map: any = {};
		for (const item of items) {
			map[item.day] = map[item.day] || {};
			const teacherName = teacherMap.get(item.teacher) || 'Unknown';
			map[item.day][item.period] = { subjectName: item.subject, teacher: teacherName, course: item.course, semester: item.semester };
		}
		return res.json(map);
	}
	return res.json(items);
}

export async function createTimetables(req: Request, res: Response) {
	const entries = Array.isArray(req.body) ? req.body : [];
	if (!entries.length) return res.status(400).json({ message: 'No entries provided' });
	await Timetable.deleteMany({ course: entries[0].course, semester: entries[0].semester });
	const saved = await Timetable.insertMany(entries);
	return res.status(201).json(saved);
}