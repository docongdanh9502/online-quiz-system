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
import searchRoutes from './routes/searchRoutes';

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
app.use('/api/search', searchRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Online Quiz System API' });
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại port ${PORT}`);
});
