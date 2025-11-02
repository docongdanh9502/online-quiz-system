import { Response } from 'express';
import QuizResult from '../models/QuizResult';
import Quiz from '../models/Quiz';
import Assignment from '../models/Assignment';
import Question from '../models/Question';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

// Student: Xem kết quả của mình
export const getStudentResults = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const filter: any = { student: studentId };

    if (req.query.quizId) {
      filter.quiz = req.query.quizId;
    }

    if (req.query.status) {
      if (req.query.status === 'completed') {
        filter.submittedAt = { $exists: true };
      } else if (req.query.status === 'in_progress') {
        filter.submittedAt = { $exists: false };
      }
    }

    const results = await QuizResult.find(filter)
      .populate('quiz', 'title subject timeLimit')
      .populate('assignment', 'dueDate status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await QuizResult.countDocuments(filter);

    const summary = await QuizResult.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalQuizzes: { $sum: 1 },
          averageScore: { $avg: '$score' },
          highestScore: { $max: '$score' },
          lowestScore: { $min: '$score' },
        },
      },
    ]);

    res.status(200).json({
      results,
      summary: summary[0] || {
        totalQuizzes: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Teacher: Xem kết quả của quiz mình tạo
export const getQuizResults = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const teacherId = req.user?.userId;
    const quizId = req.params.quizId;

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      res.status(404).json({ message: 'Quiz không tồn tại' });
      return;
    }

    if (quiz.createdBy.toString() !== teacherId && req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Không có quyền xem kết quả quiz này' });
      return;
    }

    const results = await QuizResult.find({ quiz: quizId })
      .populate('student', 'name email')
      .populate('assignment', 'dueDate status')
      .sort({ submittedAt: -1 });

    const stats = await QuizResult.aggregate([
      { $match: { quiz: quiz._id } },
      {
        $group: {
          _id: null,
          totalAttempts: { $sum: 1 },
          averageScore: { $avg: '$score' },
          highestScore: { $max: '$score' },
          lowestScore: { $min: '$score' },
          completedCount: {
            $sum: { $cond: [{ $ifNull: ['$submittedAt', false] }, 1, 0] },
          },
        },
      },
    ]);

    const questionStats = await Question.find({ _id: { $in: quiz.questions } });
    const questionAnalytics = await QuizResult.aggregate([
      { $match: { quiz: quiz._id, submittedAt: { $exists: true } } },
      { $unwind: { path: '$answers', includeArrayIndex: 'questionIndex' } },
      {
        $group: {
          _id: '$questionIndex',
          totalAnswers: { $sum: 1 },
          correctAnswers: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    '$answers',
                    { $arrayElemAt: ['$correctAnswer', '$questionIndex'] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    res.status(200).json({
      quiz,
      results,
      stats: stats[0] || {
        totalAttempts: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        completedCount: 0,
      },
      questionAnalytics,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Teacher: Thống kê tổng quan của teacher
export const getTeacherAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const teacherId = req.user?.userId;

    const quizzes = await Quiz.find({ createdBy: teacherId });
    const quizIds = quizzes.map((q) => q._id);

    const assignments = await Assignment.find({ assignedBy: teacherId });

    const results = await QuizResult.find({ quiz: { $in: quizIds } });

    const stats = {
      totalQuizzes: quizzes.length,
      totalAssignments: assignments.length,
      totalAttempts: results.length,
      completedAttempts: results.filter((r) => r.submittedAt).length,
      averageScore:
        results.length > 0
          ? results.reduce((sum, r) => sum + r.score, 0) / results.length
          : 0,
    };

    const quizStats = await Quiz.aggregate([
      { $match: { createdBy: teacherId } },
      {
        $lookup: {
          from: 'quizresults',
          localField: '_id',
          foreignField: 'quiz',
          as: 'results',
        },
      },
      {
        $project: {
          title: 1,
          subject: 1,
          totalAttempts: { $size: '$results' },
          averageScore: { $avg: '$results.score' },
          completedAttempts: {
            $size: {
              $filter: {
                input: '$results',
                cond: { $ifNull: ['$$this.submittedAt', false] },
              },
            },
          },
        },
      },
      { $sort: { totalAttempts: -1 } },
      { $limit: 10 },
    ]);

    const subjectStats = await Quiz.aggregate([
      { $match: { createdBy: teacherId } },
      {
        $lookup: {
          from: 'quizresults',
          localField: '_id',
          foreignField: 'quiz',
          as: 'results',
        },
      },
      {
        $group: {
          _id: '$subject',
          totalQuizzes: { $sum: 1 },
          totalAttempts: { $sum: { $size: '$results' } },
          averageScore: { $avg: { $avg: '$results.score' } },
        },
      },
      { $sort: { totalAttempts: -1 } },
    ]);

    res.status(200).json({
      stats,
      topQuizzes: quizStats,
      subjectStats,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Teacher: Xem kết quả của học sinh trong assignment
export const getAssignmentResults = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const assignmentId = req.params.assignmentId;
    const assignment = await Assignment.findById(assignmentId).populate('quiz');

    if (!assignment) {
      res.status(404).json({ message: 'Assignment không tồn tại' });
      return;
    }

    const quiz = assignment.quiz as any;

    if (quiz.createdBy.toString() !== req.user?.userId && req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Không có quyền xem assignment này' });
      return;
    }

    const results = await QuizResult.find({ assignment: assignmentId })
      .populate('student', 'name email')
      .sort({ submittedAt: -1 });

    const stats = await QuizResult.aggregate([
      { $match: { assignment: assignment._id } },
      {
        $group: {
          _id: null,
          totalStudents: { $sum: 1 },
          completedStudents: {
            $sum: { $cond: [{ $ifNull: ['$submittedAt', false] }, 1, 0] },
          },
          averageScore: { $avg: '$score' },
          highestScore: { $max: '$score' },
          lowestScore: { $min: '$score' },
        },
      },
    ]);

    res.status(200).json({
      assignment,
      results,
      stats: stats[0] || {
        totalStudents: 0,
        completedStudents: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Admin: Thống kê tổng quan hệ thống
export const getAdminAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });

    const totalQuizzes = await Quiz.countDocuments();
    const totalQuestions = await Question.countDocuments();
    const totalAssignments = await Assignment.countDocuments();
    const totalResults = await QuizResult.countDocuments();

    const completedResults = await QuizResult.countDocuments({
      submittedAt: { $exists: true },
    });

    const averageScore = await QuizResult.aggregate([
      { $match: { submittedAt: { $exists: true } } },
      { $group: { _id: null, avg: { $avg: '$score' } } },
    ]);

    const subjectStats = await Quiz.aggregate([
      {
        $group: {
          _id: '$subject',
          totalQuizzes: { $sum: 1 },
        },
      },
      { $sort: { totalQuizzes: -1 } },
    ]);

    const recentActivity = await QuizResult.find()
      .populate('quiz', 'title subject')
      .populate('student', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      users: {
        total: totalUsers,
        students: totalStudents,
        teachers: totalTeachers,
        admins: totalAdmins,
      },
      quizzes: {
        total: totalQuizzes,
        questions: totalQuestions,
      },
      assignments: {
        total: totalAssignments,
      },
      results: {
        total: totalResults,
        completed: completedResults,
        averageScore: averageScore[0]?.avg || 0,
      },
      subjectStats,
      recentActivity,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};