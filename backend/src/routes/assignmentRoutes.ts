import express from 'express';
import {
  createAssignment,
  getAllAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  getAssignmentsByStudent,
} from '../controllers/assignmentController';
import { authenticate, isTeacher } from '../middleware/auth';

const router = express.Router();

router.post('/', authenticate, isTeacher, createAssignment);
router.get('/', authenticate, getAllAssignments);
router.get('/student/:studentId?', authenticate, getAssignmentsByStudent);
router.get('/:id', authenticate, getAssignmentById);
router.put('/:id', authenticate, isTeacher, updateAssignment);
router.delete('/:id', authenticate, isTeacher, deleteAssignment);

export default router;  