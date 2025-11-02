File: backend/src/controllers/quizController.ts

import { Response } from 'express';
import Quiz from '../models/Quiz';
import Question from '../models/Question';
import { AuthRequest } from '../middleware/auth';

export const getAllQuizzes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    if (req.query.subject) {
      filter.subject = req.query.subject;
    }

    if (req.query.createdBy) {
      filter.createdBy = req.query.createdBy;
    }

    const quizzes = await Quiz.find(filter)
      .populate('createdBy', 'name email')
      .populate('questions', 'title questionText options correctAnswer')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Quiz.countDocuments(filter);

    res.status(200).json({
      quizzes,
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

export const getQuizById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('questions', 'title questionText options correctAnswer subject difficulty');

    if (!quiz) {
      res.status(404).json({ message: 'Quiz không tồn tại' });
      return;
    }

    res.status(200).json(quiz);
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

export const createQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, subject, timeLimit, questions } = req.body;

    if (!title || !subject || !timeLimit || !questions) {
      res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
      return;
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      res.status(400).json({ message: 'Quiz phải có ít nhất 1 câu hỏi' });
      return;
    }

    if (timeLimit < 1) {
      res.status(400).json({ message: 'Thời gian làm bài phải lớn hơn 0' });
      return;
    }

    for (const questionId of questions) {
      const question = await Question.findById(questionId);
      if (!question) {
        res.status(400).json({ message: `Câu hỏi ${questionId} không tồn tại` });
        return;
      }
    }

    const quiz = new Quiz({
      title,
      description,
      subject,
      timeLimit,
      questions,
      createdBy: req.user?.userId,
    });

    await quiz.save();
    await quiz.populate('createdBy', 'name email');
    await quiz.populate('questions', 'title questionText options correctAnswer');

    res.status(201).json(quiz);
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

export const updateQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      res.status(404).json({ message: 'Quiz không tồn tại' });
      return;
    }

    if (quiz.createdBy.toString() !== req.user?.userId && req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Bạn không có quyền sửa quiz này' });
      return;
    }

    const { title, description, subject, timeLimit, questions } = req.body;

    if (questions && (!Array.isArray(questions) || questions.length === 0)) {
      res.status(400).json({ message: 'Quiz phải có ít nhất 1 câu hỏi' });
      return;
    }

    if (questions) {
      for (const questionId of questions) {
        const question = await Question.findById(questionId);
        if (!question) {
          res.status(400).json({ message: `Câu hỏi ${questionId} không tồn tại` });
          return;
        }
      }
    }

    if (timeLimit !== undefined && timeLimit < 1) {
      res.status(400).json({ message: 'Thời gian làm bài phải lớn hơn 0' });
      return;
    }

    if (title) quiz.title = title;
    if (description !== undefined) quiz.description = description;
    if (subject) quiz.subject = subject;
    if (timeLimit) quiz.timeLimit = timeLimit;
    if (questions) quiz.questions = questions;

    await quiz.save();
    await quiz.populate('createdBy', 'name email');
    await quiz.populate('questions', 'title questionText options correctAnswer');

    res.status(200).json(quiz);
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

export const deleteQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      res.status(404).json({ message: 'Quiz không tồn tại' });
      return;
    }

    if (quiz.createdBy.toString() !== req.user?.userId && req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Bạn không có quyền xóa quiz này' });
      return;
    }

    await Quiz.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Xóa quiz thành công' });
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};


