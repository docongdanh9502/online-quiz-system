import request from 'supertest';
import app from '../../server';
import Quiz from '../../models/Quiz';
import {
  createTestTeacher,
  createTestQuiz,
  createTestQuestion,
  getAuthToken,
} from '../utils/testHelpers';

describe('Quiz Controller', () => {
  describe('GET /api/quizzes', () => {
    it('should get all quizzes', async () => {
      const teacher = await createTestTeacher();
      await createTestQuiz({ createdBy: teacher._id });
      const token = await getAuthToken(teacher);

      const response = await request(app)
        .get('/api/quizzes')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.quizzes.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/quizzes', () => {
    it('should create a new quiz', async () => {
      const teacher = await createTestTeacher();
      const question1 = await createTestQuestion({ createdBy: teacher._id });
      const question2 = await createTestQuestion({ createdBy: teacher._id });
      const token = await getAuthToken(teacher);

      const response = await request(app)
        .post('/api/quizzes')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'New Quiz',
          description: 'Test Description',
          subject: 'Math',
          timeLimit: 30,
          questions: [question1._id.toString(), question2._id.toString()],
        });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe('New Quiz');
    });

    it('should not create quiz without questions', async () => {
      const teacher = await createTestTeacher();
      const token = await getAuthToken(teacher);

      const response = await request(app)
        .post('/api/quizzes')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'New Quiz',
          subject: 'Math',
          timeLimit: 30,
          questions: [],
        });

      expect(response.status).toBe(400);
    });
  });
});