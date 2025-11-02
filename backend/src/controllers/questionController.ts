import { Response } from 'express';
import Question from '../models/Question';
import { AuthRequest } from '../middleware/auth';

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};

    // Search by title or questionText (full-text search)
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search as string, $options: 'i' } },
        { questionText: { $regex: req.query.search as string, $options: 'i' } },
        { subject: { $regex: req.query.search as string, $options: 'i' } },
      ];
    }

    // Filter by subject (exact match hoặc multiple)
    if (req.query.subject) {
      const subjects = Array.isArray(req.query.subject)
        ? req.query.subject
        : [req.query.subject];
      filter.subject = { $in: subjects };
    }

    // Filter by difficulty
    if (req.query.difficulty) {
      const difficulties = Array.isArray(req.query.difficulty)
        ? req.query.difficulty
        : [req.query.difficulty];
      filter.difficulty = { $in: difficulties };
    }

    // Filter by creator (for teachers - only see their own)
    if (req.user?.role === 'teacher') {
      filter.createdBy = req.user.userId;
    }

    // Advanced filters
    if (req.query.optionsCount) {
      const optionsCount = parseInt(req.query.optionsCount as string);
      filter['options'] = { $size: optionsCount };
    }

    // Date range filter
    if (req.query.createdFrom || req.query.createdTo) {
      filter.createdAt = {};
      if (req.query.createdFrom) {
        filter.createdAt.$gte = new Date(req.query.createdFrom as string);
      }
      if (req.query.createdTo) {
        filter.createdAt.$lte = new Date(req.query.createdTo as string);
      }
    }

    // Sort options
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as string) === 'asc' ? 1 : -1;
    const sort: any = { [sortBy]: sortOrder };

    const questions = await Question.find(filter)
      .populate('createdBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Question.countDocuments(filter);

    // Get available filters for frontend
    const availableSubjects = await Question.distinct('subject', filter.createdBy ? { createdBy: filter.createdBy } : {});
    const availableDifficulties = await Question.distinct('difficulty', filter.createdBy ? { createdBy: filter.createdBy } : {});

    res.status(200).json({
      questions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      filters: {
        subjects: availableSubjects,
        difficulties: availableDifficulties,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

export const getQuestionById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const question = await Question.findById(req.params.id).populate('createdBy', 'name email');

    if (!question) {
      res.status(404).json({ message: 'Câu hỏi không tồn tại' });
      return;
    }

    res.status(200).json(question);
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

export const createQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, questionText, options, correctAnswer, subject, difficulty } = req.body;

    if (!title || !questionText || !options || correctAnswer === undefined || !subject) {
      res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
      return;
    }

    if (!Array.isArray(options) || options.length < 2 || options.length > 6) {
      res.status(400).json({ message: 'Câu hỏi phải có từ 2 đến 6 đáp án' });
      return;
    }

    if (correctAnswer < 0 || correctAnswer >= options.length) {
      res.status(400).json({ message: 'Đáp án đúng không hợp lệ' });
      return;
    }

    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      res.status(400).json({ message: 'Độ khó không hợp lệ' });
      return;
    }

    const question = new Question({
      title,
      questionText,
      options,
      correctAnswer,
      subject,
      difficulty: difficulty || 'medium',
      createdBy: req.user?.userId,
    });

    await question.save();
    await question.populate('createdBy', 'name email');

    res.status(201).json(question);
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

export const updateQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      res.status(404).json({ message: 'Câu hỏi không tồn tại' });
      return;
    }

    if (question.createdBy.toString() !== req.user?.userId && req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Bạn không có quyền sửa câu hỏi này' });
      return;
    }

    const { title, questionText, options, correctAnswer, subject, difficulty } = req.body;

    if (options && (!Array.isArray(options) || options.length < 2 || options.length > 6)) {
      res.status(400).json({ message: 'Câu hỏi phải có từ 2 đến 6 đáp án' });
      return;
    }

    if (
      correctAnswer !== undefined &&
      options &&
      (correctAnswer < 0 || correctAnswer >= options.length)
    ) {
      res.status(400).json({ message: 'Đáp án đúng không hợp lệ' });
      return;
    }

    if (difficulty && !['easy', 'medium', 'hard'].includes(difficulty)) {
      res.status(400).json({ message: 'Độ khó không hợp lệ' });
      return;
    }

    if (title) question.title = title;
    if (questionText) question.questionText = questionText;
    if (options) question.options = options;
    if (correctAnswer !== undefined) question.correctAnswer = correctAnswer;
    if (subject) question.subject = subject;
    if (difficulty) question.difficulty = difficulty;

    await question.save();
    await question.populate('createdBy', 'name email');

    res.status(200).json(question);
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

export const deleteQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      res.status(404).json({ message: 'Câu hỏi không tồn tại' });
      return;
    }

    if (question.createdBy.toString() !== req.user?.userId && req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Bạn không có quyền xóa câu hỏi này' });
      return;
    }

    await Question.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Xóa câu hỏi thành công' });
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

