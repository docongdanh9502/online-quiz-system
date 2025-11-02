import request from 'supertest';
import app from '../../server';
import Assignment from '../../models/Assignment';
import {
  createTestUser,
  createTestTeacher,
  createTestQuiz,
  createTestAssignment,
  getAuthToken,
} from '../utils/testHelpers';

describe('Assignment Controller', () => {
  describe('POST /api/assignments', () => {
    it('should create assignment', async () => {
      const teacher = await createTestTeacher();
      const student = await createTestUser();
      const quiz = await createTestQuiz({ createdBy: teacher._id });
      const token = await getAuthToken(teacher);

      const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const response = await request(app)
        .post('/api/assignments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          quizId: quiz._id.toString(),
          assignedTo: student._id.toString(),
          dueDate: dueDate.toISOString(),
        });

      expect(response.status).toBe(201);
      expect(response.body.assignedTo).toBe(student._id.toString());
    });

    it('should not create assignment with past due date', async () => {
      const teacher = await createTestTeacher();
      const student = await createTestUser();
      const quiz = await createTestQuiz({ createdBy: teacher._id });
      const token = await getAuthToken(teacher);

      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const response = await request(app)
        .post('/api/assignments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          quizId: quiz._id.toString(),
          assignedTo: student._id.toString(),
          dueDate: pastDate.toISOString(),
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/assignments', () => {
    it('should get assignments for student', async () => {
      const student = await createTestUser();
      await createTestAssignment({ assignedTo: student._id });
      const token = await getAuthToken(student);

      const response = await request(app)
        .get('/api/assignments')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.assignments.length).toBeGreaterThan(0);
    });
  });
});