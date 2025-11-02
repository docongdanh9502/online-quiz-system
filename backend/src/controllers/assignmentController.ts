import { Response } from 'express';
import Assignment from '../models/Assignment';
import Quiz from '../models/Quiz';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

export const createAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { quizId, assignedTo, dueDate } = req.body;

    if (!quizId || !assignedTo || !dueDate) {
      res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
      return;
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      res.status(404).json({ message: 'Quiz không tồn tại' });
      return;
    }

    const student = await User.findById(assignedTo);
    if (!student) {
      res.status(404).json({ message: 'Học sinh không tồn tại' });
      return;
    }

    if (student.role !== 'student') {
      res.status(400).json({ message: 'Chỉ có thể gán cho học sinh' });
      return;
    }

    const dueDateObj = new Date(dueDate);
    if (dueDateObj < new Date()) {
      res.status(400).json({ message: 'Ngày hết hạn phải sau ngày hiện tại' });
      return;
    }

    const assignment = new Assignment({
      quiz: quizId,
      assignedTo,
      assignedBy: req.user?.userId,
      dueDate: dueDateObj,
      status: 'pending',
    });

    await assignment.save();
    await assignment.populate('quiz', 'title subject timeLimit');
    await assignment.populate('assignedTo', 'name email');
    await assignment.populate('assignedBy', 'name email');

    res.status(201).json(assignment);
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

export const getAllAssignments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (req.query.studentId) {
      filter.assignedTo = req.query.studentId;
    }

    if (req.query.quizId) {
      filter.quiz = req.query.quizId;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.user?.role === 'student') {
      filter.assignedTo = req.user.userId;
    }

    const assignments = await Assignment.find(filter)
      .populate('quiz', 'title subject timeLimit')
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Assignment.countDocuments(filter);

    res.status(200).json({
      assignments,
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

export const getAssignmentById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('quiz', 'title description subject timeLimit questions')
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email');

    if (!assignment) {
      res.status(404).json({ message: 'Assignment không tồn tại' });
      return;
    }

    if (
      req.user?.role === 'student' &&
      assignment.assignedTo.toString() !== req.user.userId
    ) {
      res.status(403).json({ message: 'Không có quyền xem assignment này' });
      return;
    }

    res.status(200).json(assignment);
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

export const updateAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      res.status(404).json({ message: 'Assignment không tồn tại' });
      return;
    }

    if (
      assignment.assignedBy.toString() !== req.user?.userId &&
      req.user?.role !== 'admin'
    ) {
      res.status(403).json({ message: 'Bạn không có quyền sửa assignment này' });
      return;
    }

    const { dueDate, status } = req.body;

    if (dueDate) {
      const dueDateObj = new Date(dueDate);
      if (dueDateObj < new Date()) {
        res.status(400).json({ message: 'Ngày hết hạn phải sau ngày hiện tại' });
        return;
      }
      assignment.dueDate = dueDateObj;
    }

    if (status && ['pending', 'in_progress', 'completed', 'expired'].includes(status)) {
      assignment.status = status;
    }

    await assignment.save();
    await assignment.populate('quiz', 'title subject timeLimit');
    await assignment.populate('assignedTo', 'name email');
    await assignment.populate('assignedBy', 'name email');

    res.status(200).json(assignment);
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

export const deleteAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      res.status(404).json({ message: 'Assignment không tồn tại' });
      return;
    }

    if (
      assignment.assignedBy.toString() !== req.user?.userId &&
      req.user?.role !== 'admin'
    ) {
      res.status(403).json({ message: 'Bạn không có quyền xóa assignment này' });
      return;
    }

    await Assignment.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Xóa assignment thành công' });
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

export const getAssignmentsByStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.params.studentId || req.user?.userId;

    const assignments = await Assignment.find({ assignedTo: studentId })
      .populate('quiz', 'title subject timeLimit')
      .populate('assignedBy', 'name email')
      .sort({ dueDate: 1 });

    res.status(200).json({ assignments });
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};