import { Response } from 'express';
import path from 'path';
import fs from 'fs';
import User from '../models/User';
import Quiz from '../models/Quiz';
import { AuthRequest } from '../middleware/auth';

export const uploadAvatar = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'Vui lòng chọn file ảnh' });
      return;
    }

    const userId = req.user?.userId;
    const user = await User.findById(userId);

    if (!user) {
      // Xóa file đã upload nếu user không tồn tại
      if (req.file.path) {
        fs.unlinkSync(req.file.path);
      }
      res.status(404).json({ message: 'Người dùng không tồn tại' });
      return;
    }

    // Xóa avatar cũ nếu có
    if (user.avatar) {
      const oldAvatarPath = path.join(__dirname, '../../uploads/avatars', path.basename(user.avatar));
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // Lưu path mới
    const avatarPath = `/uploads/avatars/${req.file.filename}`;
    user.avatar = avatarPath;
    await user.save();

    res.status(200).json({
      message: 'Upload avatar thành công',
      avatar: avatarPath,
    });
  } catch (error: any) {
    // Xóa file nếu có lỗi
    if (req.file?.path) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

export const uploadQuizImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'Vui lòng chọn file ảnh' });
      return;
    }

    const { quizId } = req.body;

    if (quizId) {
      // Nếu có quizId, cập nhật quiz
      const quiz = await Quiz.findById(quizId);

      if (!quiz) {
        if (req.file.path) {
          fs.unlinkSync(req.file.path);
        }
        res.status(404).json({ message: 'Quiz không tồn tại' });
        return;
      }

      // Kiểm tra quyền (chỉ creator hoặc admin mới được upload)
      if (quiz.createdBy.toString() !== req.user?.userId && req.user?.role !== 'admin') {
        if (req.file.path) {
          fs.unlinkSync(req.file.path);
        }
        res.status(403).json({ message: 'Không có quyền upload ảnh cho quiz này' });
        return;
      }

      // Xóa ảnh cũ nếu có
      if (quiz.image) {
        const oldImagePath = path.join(
          __dirname,
          '../../uploads/quiz-images',
          path.basename(quiz.image)
        );
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // Lưu path mới
      const imagePath = `/uploads/quiz-images/${req.file.filename}`;
      quiz.image = imagePath;
      await quiz.save();

      res.status(200).json({
        message: 'Upload ảnh quiz thành công',
        image: imagePath,
        quiz: quiz,
      });
    } else {
      // Nếu không có quizId, chỉ trả về path để frontend dùng sau
      const imagePath = `/uploads/quiz-images/${req.file.filename}`;
      res.status(200).json({
        message: 'Upload ảnh thành công',
        image: imagePath,
      });
    }
  } catch (error: any) {
    if (req.file?.path) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

export const deleteAvatar = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: 'Người dùng không tồn tại' });
      return;
    }

    if (user.avatar) {
      const avatarPath = path.join(__dirname, '../../uploads/avatars', path.basename(user.avatar));
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
    }

    user.avatar = undefined;
    await user.save();

    res.status(200).json({ message: 'Xóa avatar thành công' });
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

export const deleteQuizImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      res.status(404).json({ message: 'Quiz không tồn tại' });
      return;
    }

    // Kiểm tra quyền
    if (quiz.createdBy.toString() !== req.user?.userId && req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Không có quyền xóa ảnh quiz này' });
      return;
    }

    if (quiz.image) {
      const imagePath = path.join(
        __dirname,
        '../../uploads/quiz-images',
        path.basename(quiz.image)
      );
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    quiz.image = undefined;
    await quiz.save();

    res.status(200).json({ message: 'Xóa ảnh quiz thành công' });
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};


