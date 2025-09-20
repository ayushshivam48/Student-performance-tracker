import { Router } from 'express';
import { listAnnouncements, createAnnouncement } from '../controllers/announcements.controller.js';

const router = Router();

router.get('/', listAnnouncements);
router.post('/', createAnnouncement);

export default router;