import sendEmail from '../config/email';
import { emailTemplates } from '../utils/emailTemplates';
import Assignment from '../models/Assignment';
import QuizResult from '../models/QuizResult';
import Quiz from '../models/Quiz';
import User from '../models/User';

export const notificationService = {
  sendAssignmentCreated: async (assignmentId: string): Promise<void> => {
    try {
      const assignment = await Assignment.findById(assignmentId)
        .populate('quiz', 'title subject')
        .populate('assignedTo', 'name email')
        .populate('assignedBy', 'name');

      if (!assignment) return;

      const quiz = assignment.quiz as any;
      const student = assignment.assignedTo as any;
      const teacher = assignment.assignedBy as any;

      const dueDate = new Date(assignment.dueDate).toLocaleString('vi-VN', {
        dateStyle: 'full',
        timeStyle: 'short',
      });

      const html = emailTemplates.assignmentCreated({
        studentName: student.name,
        quizTitle: quiz.title,
        subject: quiz.subject,
        dueDate,
        teacherName: teacher.name,
      });

      await sendEmail(student.email, '📚 Bài tập mới được giao', html);
    } catch (error) {
      console.error('Lỗi gửi email assignment created:', error);
    }
  },

  sendAssignmentReminder: async (assignmentId: string, hoursLeft: number): Promise<void> => {
    try {
      const assignment = await Assignment.findById(assignmentId)
        .populate('quiz', 'title subject')
        .populate('assignedTo', 'name email');

      if (!assignment) return;
      if (assignment.status === 'completed' || assignment.status === 'expired') return;

      const quiz = assignment.quiz as any;
      const student = assignment.assignedTo as any;

      const dueDate = new Date(assignment.dueDate).toLocaleString('vi-VN', {
        dateStyle: 'full',
        timeStyle: 'short',
      });

      const html = emailTemplates.assignmentReminder({
        studentName: student.name,
        quizTitle: quiz.title,
        subject: quiz.subject,
        dueDate,
        hoursLeft,
      });

      await sendEmail(student.email, '⏰ Nhắc nhở: Bài tập sắp hết hạn', html);
    } catch (error) {
      console.error('Lỗi gửi email reminder:', error);
    }
  },

  sendQuizSubmitted: async (quizResultId: string): Promise<void> => {
    try {
      const quizResult = await QuizResult.findById(quizResultId)
        .populate('quiz', 'title questions')
        .populate('student', 'name email');

      if (!quizResult) return;

      const quiz = quizResult.quiz as any;
      const student = quizResult.student as any;

      const questions = await Quiz.find({ _id: quiz._id }).populate('questions');
      const totalQuestions = questions[0]?.questions?.length || 0;
      const correctAnswers = quizResult.answers.filter((answer, index) => {
        // Logic tính câu đúng (cần implement dựa trên correctAnswer của từng question)
        return answer !== -1;
      }).length;

      const html = emailTemplates.quizSubmitted({
        studentName: student.name,
        quizTitle: quiz.title,
        score: quizResult.score,
        totalQuestions,
        correctAnswers,
      });

      await sendEmail(student.email, '✅ Đã nộp bài thành công', html);
    } catch (error) {
      console.error('Lỗi gửi email quiz submitted:', error);
    }
  },

  sendAssignmentExpired: async (assignmentId: string): Promise<void> => {
    try {
      const assignment = await Assignment.findById(assignmentId)
        .populate('quiz', 'title subject')
        .populate('assignedTo', 'name email');

      if (!assignment) return;

      const quiz = assignment.quiz as any;
      const student = assignment.assignedTo as any;

      const html = emailTemplates.assignmentExpired({
        studentName: student.name,
        quizTitle: quiz.title,
        subject: quiz.subject,
      });

      await sendEmail(student.email, ⚠️ Bài tập đã hết hạn', html);
    } catch (error) {
      console.error('Lỗi gửi email expired:', error);
    }
  },
};
