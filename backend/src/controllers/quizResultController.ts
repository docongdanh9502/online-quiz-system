import { Response } from 'express';
import QuizResult from '../models/QuizResult';
import Quiz from '../models/Quiz';
import Assignment from '../models/Assignment';
import Question from '../models/Question';
import { AuthRequest } from '../middleware/auth';

export const startQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { quizId, assignmentId } = req.body;
    const studentId = req.user?.userId;

    if (!quizId || !studentId) {
      res.status(400).json({ message: 'Vui lòng cung cấp quizId' });
      return;
    }

    const quiz = await Quiz.findById(quizId).populate('questions');
    if (!quiz) {
      res.status(404).json({ message: 'Quiz không tồn tại' });
      return;
    }

    if (assignmentId) {
      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) {
        res.status(404).json({ message: 'Assignment không tồn tại' });
        return;
      }

      if (assignment.assignedTo.toString() !== studentId) {
        res.status(403).json({ message: 'Bạn không có quyền làm quiz này' });
        return;
      }

      if (assignment.status === 'completed') {
        res.status(400).json({ message: 'Quiz đã hoàn thành' });
        return;
      }

      if (new Date() > new Date(assignment.dueDate)) {
        res.status(400).json({ message: 'Quiz đã hết hạn' });
        return;
      }
    }

    const existingResult = await QuizResult.findOne({
      quiz: quizId,
      student: studentId,
      assignment: assignmentId || undefined,
    });

    if (existingResult) {
      res.status(200).json({
        quizResult: existingResult,
        quiz: quiz,
        canContinue: true,
      });
      return;
    }

    const answers = new Array(quiz.questions.length).fill(-1);

    const quizResult = new QuizResult({
      quiz: quizId,
      assignment: assignmentId || undefined,
      student: studentId,
      answers,
      score: 0,
      startedAt: new Date(),
      submittedAt: new Date(),
      timeSpent: 0,
    });

    await quizResult.save();

    if (assignmentId) {
      await Assignment.findByIdAndUpdate(assignmentId, {
        status: 'in_progress',
      });
    }

    res.status(201).json({
      quizResult,
      quiz: quiz,
      canContinue: false,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

export const getQuizResult = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const quizResult = await QuizResult.findById(req.params.id)
      .populate('quiz', 'title subject timeLimit questions')
      .populate('student', 'name email')
      .populate('assignment');

    if (!quizResult) {
      res.status(404).json({ message: 'Kết quả không tồn tại' });
      return;
    }

    if (
      quizResult.student.toString() !== req.user?.userId &&
      req.user?.role !== 'admin' &&
      req.user?.role !== 'teacher'
    ) {
      res.status(403).json({ message: 'Không có quyền xem kết quả này' });
      return;
    }

    res.status(200).json(quizResult);
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

export const saveAnswers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { answers } = req.body;
    const quizResultId = req.params.id;

    const quizResult = await QuizResult.findById(quizResultId);

    if (!quizResult) {
      res.status(404).json({ message: 'Kết quả không tồn tại' });
      return;
    }

    if (quizResult.student.toString() !== req.user?.userId) {
      res.status(403).json({ message: 'Không có quyền sửa kết quả này' });
      return;
    }

    if (quizResult.submittedAt && quizResult.submittedAt < quizResult.startedAt) {
      res.status(400).json({ message: 'Quiz đã được nộp, không thể sửa đáp án' });
      return;
    }

    if (!Array.isArray(answers)) {
      res.status(400).json({ message: 'Đáp án phải là mảng' });
      return;
    }

    quizResult.answers = answers;
    await quizResult.save();

    res.status(200).json({ message: 'Lưu đáp án thành công', quizResult });
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

const calculateScore = async (quiz: any, answers: number[]): Promise<number> => {
  let correctCount = 0;
  const questions = await Question.find({ _id: { $in: quiz.questions } });

  answers.forEach((answer, index) => {
    if (index < questions.length && answer === questions[index].correctAnswer) {
      correctCount++;
    }
  });

  return questions.length > 0 ? (correctCount / questions.length) * 100 : 0;
};

export const submitQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const quizResultId = req.params.id;
    const { answers } = req.body;

    const quizResult = await QuizResult.findById(quizResultId).populate('quiz');

    if (!quizResult) {
      res.status(404).json({ message: 'Kết quả không tồn tại' });
      return;
    }

    if (quizResult.student.toString() !== req.user?.userId) {
      res.status(403).json({ message: 'Không có quyền nộp bài này' });
      return;
    }

    if (quizResult.submittedAt && quizResult.submittedAt <= quizResult.startedAt) {
      res.status(400).json({ message: 'Quiz đã được nộp' });
      return;
    }

    const quiz = await Quiz.findById(quizResult.quiz).populate('questions');

    if (!quiz) {
      res.status(404).json({ message: 'Quiz không tồn tại' });
      return;
    }

    if (quizResult.assignment) {
      const assignment = await Assignment.findById(quizResult.assignment);
      if (assignment && new Date() > new Date(assignment.dueDate)) {
        res.status(400).json({ message: 'Quiz đã hết hạn' });
        return;
      }
    }

    const finalAnswers = answers || quizResult.answers;
    const score = await calculateScore(quiz, finalAnswers);

    const submittedAt = new Date();
    const timeSpent = Math.floor(
      (submittedAt.getTime() - quizResult.startedAt.getTime()) / 60000
    );

    quizResult.answers = finalAnswers;
    quizResult.score = score;
    quizResult.submittedAt = submittedAt;
    quizResult.timeSpent = timeSpent;

    await quizResult.save();

    if (quizResult.assignment) {
      await Assignment.findByIdAndUpdate(quizResult.assignment, {
        status: 'completed',
      });
    }

    res.status(200).json({
      message: 'Nộp bài thành công',
      quizResult,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

export const getMyResults = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const filter: any = { student: studentId };

    if (req.query.quizId) {
      filter.quiz = req.query.quizId;
    }

    const results = await QuizResult.find(filter)
      .populate('quiz', 'title subject timeLimit')
      .populate('assignment')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await QuizResult.countDocuments(filter);

    res.status(200).json({
      results,
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
import { notificationService } from '../services/notificationService';

// Trong hàm submitQuiz, sau khi submit thành công:
await quizResult.save();

// Gửi email notification
try {
  await notificationService.sendQuizSubmitted(quizResult._id.toString());
} catch (error) {
  console.error('Lỗi gửi email:', error);
}

res.status(200).json({
  message: 'Nộp bài thành công',
  quizResult,
});
