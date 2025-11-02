import express from 'express';
import {
  getStudentResults,
  getQuizResults,
  getTeacherAnalytics,
  getAssignmentResults,
  getAdminAnalytics,
} from '../controllers/analyticsController';
import { authenticate, isTeacher, isAdmin } from '../middleware/auth';

const router = express.Router();

// Student routes
router.get('/student/results', authenticate, getStudentResults);

// Teacher routes
router.get('/teacher/analytics', authenticate, isTeacher, getTeacherAnalytics);
router.get('/teacher/quiz/:quizId/results', authenticate, isTeacher, getQuizResults);
router.get('/teacher/assignment/:assignmentId/results', authenticate, isTeacher, getAssignmentResults);

// Admin routes
router.get('/admin/analytics', authenticate, isAdmin, getAdminAnalytics);

export default router;