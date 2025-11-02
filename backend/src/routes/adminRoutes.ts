import express from 'express';
import { authenticate, isAdmin } from '../middleware/auth';

const router = express.Router();

router.get('/test', authenticate, isAdmin, (req, res) => {
  res.json({ message: 'Chỉ admin mới thấy được message này' });
});

export default router;
