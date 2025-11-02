import express from 'express';
import {
  getAllQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from '../controllers/questionController';
import { authenticate, isTeacher } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate, getAllQuestions);
router.get('/:id', authenticate, getQuestionById);
router.post('/', authenticate, isTeacher, createQuestion);
router.put('/:id', authenticate, isTeacher, updateQuestion);
router.delete('/:id', authenticate, isTeacher, deleteQuestion);

export default router;