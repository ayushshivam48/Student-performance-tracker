import { Router } from 'express';
import { listStudents, filterStudents, getStudent, updateStudent, deleteStudent } from '../controllers/students.controller.js';

const router = Router();

router.get('/', listStudents);
router.get('/filter', filterStudents);
router.get('/:id', getStudent);
router.put('/:id', updateStudent);
router.delete('/:id', deleteStudent);

export default router;
