import express from 'express';
import {
  startQuiz,
  getQuizResult,
  saveAnswers,
  submitQuiz,
  getMyResults,
} from '../controllers/quizResultController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/start', authenticate, startQuiz);
router.get('/my-results', authenticate, getMyResults);
router.get('/:id', authenticate, getQuizResult);
router.put('/:id/save', authenticate, saveAnswers);
router.post('/:id/submit', authenticate, submitQuiz);

export default router;