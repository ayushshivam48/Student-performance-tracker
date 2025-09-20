import type { Request, Response } from 'express';
import { Attendance } from '../models/Attendance.js';

interface AttendanceItem {
	subject?: string;
	semester?: number;
	status: string;
}

export async function createAttendance(req: Request, res: Response) {
	const item = await Attendance.create(req.body);
	return res.status(201).json(item);
}

export async function getAttendanceByStudent(req: Request, res: Response) {
	const { id } = req.params;
	const items = await Attendance.find({ student: id }).lean() as AttendanceItem[];
	// Aggregate by subject
	const aggregated = items.reduce((acc, item) => {
		const key = item.subject || 'Unknown';
		if (!acc[key]) {
			acc[key] = { subject: key, total: 0, present: 0, semester: item.semester ?? 0 };
		}
		acc[key].total++;
		if (item.status === 'present') acc[key].present++;
		return acc;
	}, {} as Record<string, { subject: string; total: number; present: number; semester: number }>);
	const result = Object.values(aggregated).map(item => ({
		subject: item.subject,
		percentage: Math.round((item.present / item.total) * 100),
		semester: item.semester ?? 0,
	}));
	return res.json(result);
}
