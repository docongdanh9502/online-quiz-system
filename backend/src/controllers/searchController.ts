import { Response } from 'express';
import Question from '../models/Question';
import Quiz from '../models/Quiz';
import Assignment from '../models/Assignment';
import { AuthRequest } from '../middleware/auth';

export const globalSearch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { q, type, limit = 10 } = req.query;

    if (!q) {
      res.status(400).json({ message: 'Vui lòng cung cấp từ khóa tìm kiếm' });
      return;
    }

    const searchQuery = { $regex: q as string, $options: 'i' };
    const results: any = {
      questions: [],
      quizzes: [],
      assignments: [],
    };

    // Search questions
    if (!type || type === 'questions') {
      const questionFilter: any = {
        $or: [
          { title: searchQuery },
          { questionText: searchQuery },
          { subject: searchQuery },
        ],
      };

      if (req.user?.role === 'teacher') {
        questionFilter.createdBy = req.user.userId;
      }

      results.questions = await Question.find(questionFilter)
        .populate('createdBy', 'name email')
        .limit(parseInt(limit as string))
        .select('title questionText subject difficulty createdAt');
    }

    // Search quizzes
    if (!type || type === 'quizzes') {
      const quizFilter: any = {
        $or: [
          { title: searchQuery },
          { description: searchQuery },
          { subject: searchQuery },
        ],
      };

      if (req.user?.role === 'teacher') {
        quizFilter.createdBy = req.user.userId;
      }

      results.quizzes = await Quiz.find(quizFilter)
        .populate('createdBy', 'name email')
        .limit(parseInt(limit as string))
        .select('title description subject timeLimit createdAt');
    }

    // Search assignments (only for teachers/admins or student's own)
    if (!type || type === 'assignments') {
      const assignmentFilter: any = {};

      if (req.user?.role === 'student') {
        assignmentFilter.assignedTo = req.user.userId;
      }

      const quizzes = await Quiz.find({
        $or: [
          { title: searchQuery },
          { subject: searchQuery },
        ],
      }).select('_id');

      if (quizzes.length > 0) {
        assignmentFilter.quiz = { $in: quizzes.map((q) => q._id) };
      }

      results.assignments = await Assignment.find(assignmentFilter)
        .populate('quiz', 'title subject')
        .populate('assignedTo', 'name email')
        .limit(parseInt(limit as string))
        .select('dueDate status createdAt');
    }

    res.status(200).json({
      query: q,
      results,
      total:
        results.questions.length +
        results.quizzes.length +
        results.assignments.length,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};