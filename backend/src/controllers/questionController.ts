import { Response } from 'express';
import Question from '../models/Question';
import { AuthRequest } from '../middleware/auth';
import { optimizedFind } from '../utils/queryOptimizer';
import { getPaginationOptions, getPaginationResult } from '../utils/pagination';
import { cache } from '../config/cache';

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page, limit, skip } = getPaginationOptions(req.query);

    const filter: any = {};

    // Search
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search as string, $options: 'i' } },
        { questionText: { $regex: req.query.search as string, $options: 'i' } },
        { subject: { $regex: req.query.search as string, $options: 'i' } },
      ];
    }

    // Filters
    if (req.query.subject) {
      const subjects = Array.isArray(req.query.subject)
        ? req.query.subject
        : [req.query.subject];
      filter.subject = { $in: subjects };
    }

    if (req.query.difficulty) {
      const difficulties = Array.isArray(req.query.difficulty)
        ? req.query.difficulty
        : [req.query.difficulty];
      filter.difficulty = { $in: difficulties };
    }

    if (req.user?.role === 'teacher') {
      filter.createdBy = req.user.userId;
    }

    // Date range
    if (req.query.createdFrom || req.query.createdTo) {
      filter.createdAt = {};
      if (req.query.createdFrom) {
        filter.createdAt.$gte = new Date(req.query.createdFrom as string);
      }
      if (req.query.createdTo) {
        filter.createdAt.$lte = new Date(req.query.createdTo as string);
      }
    }

    // Sort
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as string) === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    // Cache key
    const cacheKey = `questions:${JSON.stringify(filter)}:${page}:${limit}:${sortBy}:${sortOrder}`;

    // Check cache
    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    // Optimized query with lean for better performance
    const { data: questions, total } = await optimizedFind(Question, filter, {
      page,
      limit,
      sort,
      populate: { path: 'createdBy', select: 'name email' },
      lean: true, // Use lean for better performance
    });

    // Get available filters (cached separately)
    const filtersCacheKey = `questions:filters:${req.user?.userId || 'all'}`;
    let availableFilters = await cache.get(filtersCacheKey);

    if (!availableFilters) {
      const [subjects, difficulties] = await Promise.all([
        Question.distinct('subject', req.user?.role === 'teacher' ? { createdBy: req.user.userId } : {}),
        Question.distinct('difficulty', req.user?.role === 'teacher' ? { createdBy: req.user.userId } : {}),
      ]);

      availableFilters = { subjects, difficulties };
      await cache.set(filtersCacheKey, availableFilters, 3600);
    }

    const pagination = getPaginationResult(total, page, limit);

    const response = {
      questions,
      pagination,
      filters: availableFilters,
    };

    // Cache response
    await cache.set(cacheKey, response, 300); // 5 minutes

    res.status(200).json(response);
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

import { invalidateQuestionCache } from '../utils/cacheInvalidation';

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // ... create logic
    const question = await newQuestion.save();

    // Invalidate cache
    await invalidateQuestionCache();

    res.status(201).json(question);
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // ... update logic
    const question = await Question.findByIdAndUpdate(req.params.id, updateData, { new: true });

    // Invalidate cache
    await invalidateQuestionCache();

    res.status(200).json(question);
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

export const deleteQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // ... delete logic
    await Question.findByIdAndDelete(req.params.id);

    // Invalidate cache
    await invalidateQuestionCache();

    res.status(200).json({ message: 'Xóa câu hỏi thành công' });
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
