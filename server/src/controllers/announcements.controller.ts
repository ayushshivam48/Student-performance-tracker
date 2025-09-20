import type { Request, Response } from 'express';
import { Announcement } from '../models/Announcement.js';

export async function listAnnouncements(req: Request, res: Response) {
	const { course, semester, subject } = req.query as { course?: string; semester?: string; subject?: string };
	const filter: any = {};
	if (course) filter.course = course;
	if (semester) filter.semester = Number(semester);
	if (subject) filter.subject = subject;
	// Also include announcements that have no course or semester specified (general announcements)
	const items = await Announcement.find({
		$and: [
			{
				$or: [
					{ course: course || null },
					{ course: { $exists: false } },
					{ course: null }
				]
			},
			{
				$or: [
					{ semester: semester ? Number(semester) : null },
					{ semester: { $exists: false } },
					{ semester: null }
				]
			},
			{
				$or: [
					{ subject: subject || null },
					{ subject: { $exists: false } },
					{ subject: null }
				]
			}
		]
	}).sort({ createdAt: -1 }).lean();
	return res.json(items);
}

export async function createAnnouncement(req: Request, res: Response) {
	const item = await Announcement.create(req.body);
	return res.status(201).json(item);
}