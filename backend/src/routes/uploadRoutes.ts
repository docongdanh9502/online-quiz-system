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

