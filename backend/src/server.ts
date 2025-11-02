import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/database';
import authRoutes from './routes/authRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Online Quiz System API' });
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại port ${PORT}`);
});

