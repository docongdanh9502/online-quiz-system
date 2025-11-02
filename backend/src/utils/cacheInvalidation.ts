import { cache } from '../config/cache';

export const invalidateCache = async (patterns: string[]): Promise<void> => {
  try {
    await Promise.all(patterns.map((pattern) => cache.delPattern(pattern)));
    console.log(`✅ Đã xóa cache patterns: ${patterns.join(', ')}`);
  } catch (error) {
    console.error('❌ Lỗi khi xóa cache:', error);
  }
};

// Auto-invalidate cache on data changes
export const invalidateQuestionCache = async (): Promise<void> => {
  await invalidateCache(['questions:*', 'questions:filters:*']);
};

export const invalidateQuizCache = async (): Promise<void> => {
  await invalidateCache(['quizzes:*', 'quizzes:filters:*']);
};

export const invalidateAssignmentCache = async (): Promise<void> => {
  await invalidateCache(['assignments:*']);
};

export const invalidateQuizResultCache = async (): Promise<void> => {
  await invalidateCache(['quiz-results:*', 'analytics:*']);
};