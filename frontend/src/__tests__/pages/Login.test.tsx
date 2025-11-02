import { render, screen, waitFor } from '../utils/testUtils';
import userEvent from '@testing-library/user-event';
import Login from '../../pages/Login';
import * as authAPI from '../../services/api';

jest.mock('../../services/api');

describe('Login Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form', () => {
    render(<Login />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mật khẩu/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /đăng nhập/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup();
    render(<Login />);

    const submitButton = screen.getByRole('button', { name: /đăng nhập/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/vui lòng nhập email/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    const mockPost = jest.fn().mockResolvedValue({
      data: {
        token: 'test-token',
        user: { email: 'test@example.com', name: 'Test User' },
      },
    });

    (authAPI.default.post as jest.Mock) = mockPost;

    render(<Login />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/mật khẩu/i), 'password123');
    await user.click(screen.getByRole('button', { name: /đăng nhập/i }));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('displays error message on login failure', async () => {
    const user = userEvent.setup();
    const mockPost = jest.fn().mockRejectedValue({
      response: { data: { message: 'Sai email hoặc mật khẩu' } },
    });

    (authAPI.default.post as jest.Mock) = mockPost;

    render(<Login />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/mật khẩu/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /đăng nhập/i }));

    await waitFor(() => {
      expect(screen.getByText(/sai email hoặc mật khẩu/i)).toBeInTheDocument();
    });
  });
});
