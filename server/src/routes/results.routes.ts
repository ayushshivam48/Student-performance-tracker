import { Router } from 'express';
import { filterResults, createResult, updateResult } from '../controllers/results.controller.js';

const router = Router();

router.get('/filter', filterResults);
router.post('/', createResult);
router.put('/:id', updateResult);

export default router;