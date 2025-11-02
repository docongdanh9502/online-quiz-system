import request from 'supertest';
import app from '../../server';
import User from '../../models/User';
import Quiz from '../../models/Quiz';
import Question from '../../models/Question';
import Assignment from '../../models/Assignment';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const createTestUser = async (overrides?: any) => {
  const defaultUser = {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User',
    role: 'student',
    ...overrides,
  };

  const hashedPassword = await bcrypt.hash(defaultUser.password, 10);
  const user = new User({
    ...defaultUser,
    password: hashedPassword,
  });
  await user.save();
  return user;
};

export const createTestTeacher = async () => {
  return createTestUser({
    email: 'teacher@example.com',
    name: 'Test Teacher',
    role: 'teacher',
  });
};

export const createTestAdmin = async () => {
  return createTestUser({
    email: 'admin@example.com',
    name: 'Test Admin',
    role: 'admin',
  });
};

export const getAuthToken = async (user: any) => {
  const token = jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
  return token;
};

export const createTestQuestion = async (overrides?: any) => {
  const teacher = await createTestTeacher();
  const defaultQuestion = {
    title: 'Test Question',
    questionText: 'What is 2+2?',
    options: ['2', '3', '4', '5'],
    correctAnswer: 2,
    subject: 'Math',
    difficulty: 'easy',
    createdBy: teacher._id,
    ...overrides,
  };

  const question = new Question(defaultQuestion);
  await question.save();
  return question;
};

export const createTestQuiz = async (overrides?: any) => {
  const teacher = await createTestTeacher();
  const question1 = await createTestQuestion();
  const question2 = await createTestQuestion();

  const defaultQuiz = {
    title: 'Test Quiz',
    description: 'Test Description',
    subject: 'Math',
    timeLimit: 30,
    questions: [question1._id, question2._id],
    createdBy: teacher._id,
    ...overrides,
  };

  const quiz = new Quiz(defaultQuiz);
  await quiz.save();
  return quiz;
};

export const createTestAssignment = async (overrides?: any) => {
  const teacher = await createTestTeacher();
  const student = await createTestUser();
  const quiz = await createTestQuiz();

  const defaultAssignment = {
    quiz: quiz._id,
    assignedTo: student._id,
    assignedBy: teacher._id,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    status: 'pending',
    ...overrides,
  };

  const assignment = new Assignment(defaultAssignment);
  await assignment.save();
  return assignment;
};

export const authenticatedRequest = async (
  app: any,
  user: any,
  method: string,
  url: string,
  data?: any
) => {
  const token = await getAuthToken(user);
  const req = (request(app) as any)[method.toLowerCase()](url)
    .set('Authorization', `Bearer ${token}`);

  if (data) {
    if (method === 'GET') {
      return req.query(data);
    } else {
      return req.send(data);
    }
  }

  return req;
};