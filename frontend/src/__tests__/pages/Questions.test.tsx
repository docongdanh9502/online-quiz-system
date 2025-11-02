import { render, screen, waitFor } from '../utils/testUtils';
import Questions from '../../pages/Questions';
import * as questionAPI from '../../services/questionAPI';

jest.mock('../../services/questionAPI');
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { role: 'teacher' },
    isAuthenticated: true,
  }),
}));

describe('Questions Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads and displays questions', async () => {
    const mockQuestions = [
      {
        _id: '1',
        title: 'Test Question 1',
        subject: 'Math',
        difficulty: 'easy',
        questionText: 'What is 2+2?',
      },
      {
        _id: '2',
        title: 'Test Question 2',
        subject: 'Science',
        difficulty: 'medium',
        questionText: 'What is water?',
      },
    ];

    (questionAPI.questionAPI.getAll as jest.Mock) = jest.fn().mockResolvedValue({
      questions: mockQuestions,
      pagination: { page: 1, limit: 10, total: 2, pages: 1 },
      filters: { subjects: ['Math', 'Science'], difficulties: ['easy', 'medium'] },
    });

    render(<Questions />);

    await waitFor(() => {
      expect(screen.getByText('Test Question 1')).toBeInTheDocument();
      expect(screen.getByText('Test Question 2')).toBeInTheDocument();
    });
  });

  it('filters questions by subject', async () => {
    const user = userEvent.setup();
    (questionAPI.questionAPI.getAll as jest.Mock) = jest.fn().mockResolvedValue({
      questions: [],
      pagination: { page: 1, limit: 10, total: 0, pages: 0 },
      filters: { subjects: ['Math'], difficulties: [] },
    });

    render(<Questions />);

    const subjectSelect = screen.getByLabelText(/môn học/i);
    await user.selectOptions(subjectSelect, 'Math');

    await waitFor(() => {
      expect(questionAPI.questionAPI.getAll).toHaveBeenCalledWith(
        expect.objectContaining({ subject: 'Math' })
      );
    });
  });
});
