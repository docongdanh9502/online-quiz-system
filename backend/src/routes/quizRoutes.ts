import express from 'express';
import {
  getAllQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
} from '../controllers/quizController';
import { authenticate, isTeacher } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate, getAllQuizzes);
router.get('/:id', authenticate, getQuizById);
router.post('/', authenticate, isTeacher, createQuiz);
router.put('/:id', authenticate, isTeacher, updateQuiz);
router.delete('/:id', authenticate, isTeacher, deleteQuiz);

export default router;