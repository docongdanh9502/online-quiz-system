File: backend/src/config/upload.ts

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Tạo thư mục uploads nếu chưa có
const uploadDir = path.join(__dirname, '../../uploads');
const avatarDir = path.join(uploadDir, 'avatars');
const quizImageDir = path.join(uploadDir, 'quiz-images');

[uploadDir, avatarDir, quizImageDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage configuration cho avatar
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, avatarDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// Storage configuration cho quiz images
const quizImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, quizImageDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// File filter cho avatar
const avatarFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ cho phép upload file ảnh (JPEG, JPG, PNG, GIF, WEBP)'));
  }
};

// File filter cho quiz images
const quizImageFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ cho phép upload file ảnh (JPEG, JPG, PNG, GIF, WEBP)'));
  }
};

// Multer instances
export const uploadAvatar = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
  fileFilter: avatarFilter,
});

export const uploadQuizImage = multer({
  storage: quizImageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: quizImageFilter,
});

export const uploadDirPath = uploadDir;
export const avatarDirPath = avatarDir;
export const quizImageDirPath = quizImageDir;


File: backend/src/controllers/uploadController.ts

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


File: backend/src/routes/uploadRoutes.ts

import express from 'express';
import {
  uploadAvatar as uploadAvatarCtrl,
  uploadQuizImage,
  deleteAvatar,
  deleteQuizImage,
} from '../controllers/uploadController';
import { uploadAvatar, uploadQuizImage as uploadQuizImageMulter } from '../config/upload';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Upload avatar
router.post(
  '/avatar',
  authenticate,
  uploadAvatar.single('avatar'),
  uploadAvatarCtrl
);

// Delete avatar
router.delete('/avatar', authenticate, deleteAvatar);

// Upload quiz image
router.post(
  '/quiz-image',
  authenticate,
  uploadQuizImageMulter.single('image'),
  uploadQuizImage
);

// Delete quiz image
router.delete('/quiz-image/:quizId', authenticate, deleteQuizImage);

export default router;

File: backend/src/models/Quiz.ts (cập nhật)

export interface IQuiz extends Document {
  title: string;
  description?: string;
  subject: string;
  timeLimit: number;
  questions: mongoose.Types.ObjectId[];
  image?: string; // Thêm field này
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const quizSchema = new Schema<IQuiz>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    timeLimit: {
      type: Number,
      required: true,
      min: 1,
    },
    questions: {
      type: [Schema.Types.ObjectId],
      ref: 'Question',
      required: true,
      validate: {
        validator: (questions: mongoose.Types.ObjectId[]) => questions.length > 0,
        message: 'Quiz phải có ít nhất 1 câu hỏi',
      },
    },
    image: String, // Thêm field này
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);


File: backend/src/server.ts (cập nhật

import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/database';
import path from 'path';
import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';
import teacherRoutes from './routes/teacherRoutes';
import questionRoutes from './routes/questionRoutes';
import quizRoutes from './routes/quizRoutes';
import assignmentRoutes from './routes/assignmentRoutes';
import quizResultRoutes from './routes/quizResultRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import uploadRoutes from './routes/uploadRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files từ thư mục uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/quiz-results', quizResultRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Online Quiz System API' });
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại port ${PORT}`);
});


File: backend/src/middleware/uploadErrorHandler.ts

import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

export const uploadErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File quá lớn' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Quá nhiều files' });
    }
    return res.status(400).json({ message: err.message });
  }

  if (err) {
    return res.status(400).json({ message: err.message });
  }

  next();
};



File: backend/src/routes/uploadRoutes.ts (cập nhật)

import express from 'express';
import {
  uploadAvatar as uploadAvatarCtrl,
  uploadQuizImage,
  deleteAvatar,
  deleteQuizImage,
} from '../controllers/uploadController';
import { uploadAvatar, uploadQuizImage as uploadQuizImageMulter } from '../config/upload';
import { authenticate } from '../middleware/auth';
import { uploadErrorHandler } from '../middleware/uploadErrorHandler';

const router = express.Router();

router.post(
  '/avatar',
  authenticate,
  uploadAvatar.single('avatar'),
  uploadErrorHandler,
  uploadAvatarCtrl
);

router.delete('/avatar', authenticate, deleteAvatar);

router.post(
  '/quiz-image',
  authenticate,
  uploadQuizImageMulter.single('image'),
  uploadErrorHandler,
  uploadQuizImage
);

router.delete('/quiz-image/:quizId', authenticate, deleteQuizImage);

export default router;



