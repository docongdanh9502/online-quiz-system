import request from 'supertest';
import app from '../../server';
import QuizResult from '../../models/QuizResult';
import {
  createTestUser,
  createTestQuiz,
  getAuthToken,
} from '../utils/testHelpers';

describe('Quiz Result Controller', () => {
  describe('POST /api/quiz-results/start', () => {
    it('should start a quiz', async () => {
      const student = await createTestUser();
      const quiz = await createTestQuiz();
      const token = await getAuthToken(student);

      const response = await request(app)
        .post('/api/quiz-results/start')
        .set('Authorization', `Bearer ${token}`)
        .send({
          quizId: quiz._id.toString(),
        });

      expect(response.status).toBe(201);
      expect(response.body.quizResult).toBeDefined();
      expect(response.body.quizResult.student).toBe(student._id.toString());
    });
  });

  describe('POST /api/quiz-results/:id/submit', () => {
    it('should submit quiz', async () => {
      const student = await createTestUser();
      const quiz = await createTestQuiz();
      const token = await getAuthToken(student);

      // Start quiz first
      const startResponse = await request(app)
        .post('/api/quiz-results/start')
        .set('Authorization', `Bearer ${token}`)
        .send({ quizId: quiz._id.toString() });

      const quizResultId = startResponse.body.quizResult._id;
      const answers = [0, 1, 2, 0]; // Example answers

      // Submit quiz
      const response = await request(app)
        .post(`/api/quiz-results/${quizResultId}/submit`)
        .set('Authorization', `Bearer ${token}`)
        .send({ answers });

      expect(response.status).toBe(200);
      expect(response.body.quizResult.score).toBeDefined();
      expect(response.body.quizResult.submittedAt).toBeDefined();
    });
  });
});