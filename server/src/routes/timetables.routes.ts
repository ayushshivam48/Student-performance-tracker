import { Router } from 'express';
import { filterTimetables, createTimetables } from '../controllers/timetables.controller.js';

const router = Router();

router.get('/filter', filterTimetables);
router.post('/', createTimetables);

export default router;