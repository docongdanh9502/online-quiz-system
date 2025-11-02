import Question from './Question';
import Quiz from './Quiz';
import Assignment from './Assignment';
import QuizResult from './QuizResult';
import User from './User';

export const optimizeIndexes = async (): Promise<void> => {
  try {
    // Question indexes
    await Question.collection.createIndex({ title: 'text', questionText: 'text' });
    await Question.collection.createIndex({ subject: 1, difficulty: 1 });
    await Question.collection.createIndex({ createdBy: 1, createdAt: -1 });
    await Question.collection.createIndex({ createdAt: -1 });

    // Quiz indexes
    await Quiz.collection.createIndex({ title: 'text', description: 'text' });
    await Quiz.collection.createIndex({ subject: 1, createdAt: -1 });
    await Quiz.collection.createIndex({ createdBy: 1, createdAt: -1 });
    await Quiz.collection.createIndex({ 'questions': 1 });

    // Assignment indexes (compound indexes for common queries)
    await Assignment.collection.createIndex({ assignedTo: 1, status: 1, dueDate: 1 });
    await Assignment.collection.createIndex({ quiz: 1, status: 1 });
    await Assignment.collection.createIndex({ assignedBy: 1, createdAt: -1 });
    await Assignment.collection.createIndex({ dueDate: 1, status: 1 });

    // QuizResult indexes
    await QuizResult.collection.createIndex({ student: 1, quiz: 1 });
    await QuizResult.collection.createIndex({ quiz: 1, submittedAt: -1 });
    await QuizResult.collection.createIndex({ student: 1, submittedAt: -1 });
    await QuizResult.collection.createIndex({ assignment: 1 });

    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ role: 1 });
    await User.collection.createIndex({ isActive: 1, role: 1 });

    console.log('✅ Database indexes đã được tối ưu');
  } catch (error) {
    console.error('❌ Lỗi khi tối ưu indexes:', error);
  }
};