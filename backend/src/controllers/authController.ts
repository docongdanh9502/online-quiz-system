import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { generateToken } from '../config/jwt';
import { AuthRequest } from '../middleware/auth';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, role } = req.body;
    
    if (!email || !password || !name) {
      res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
      return;
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'Email đã tồn tại' });
      return;
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = new User({
      email,
      password: hashedPassword,
      name,
      role: role || 'student',
    });
    
    await user.save();
    
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });
    
    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      res.status(400).json({ message: 'Vui lòng nhập email và password' });
      return;
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Email hoặc password không đúng' });
      return;
    }
    
    if (!user.isActive) {
      res.status(401).json({ message: 'Tài khoản đã bị khóa' });
      return;
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Email hoặc password không đúng' });
      return;
    }
    
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });
    
    res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.userId).select('-password');
    
    if (!user) {
      res.status(404).json({ message: 'Người dùng không tồn tại' });
      return;
    }
    
    res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
