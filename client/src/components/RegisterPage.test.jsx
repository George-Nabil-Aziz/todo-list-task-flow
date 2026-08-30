import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import RegisterPage from './RegisterPage.jsx';
import * as AuthContext from '../context/AuthContext.jsx';

vi.mock('../context/AuthContext.jsx');

describe('RegisterPage', () => {
  let mockAuth;

  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    mockAuth = { login: vi.fn(), register: vi.fn(), logout: vi.fn(), isAuthenticated: false };
    AuthContext.useAuth.mockImplementation(() => mockAuth);
  });

  test('renders a theme toggle that switches the theme', () => {
    render(<RegisterPage onSwitchToLogin={() => {}} />);

    const toggle = screen.getByRole('switch');
    fireEvent.click(toggle);

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  test('submitting valid credentials calls useAuth().register', async () => {
    mockAuth.register.mockResolvedValue(undefined);
    render(<RegisterPage onSwitchToLogin={() => {}} />);

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'alice' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() =>
      expect(mockAuth.register).toHaveBeenCalledWith('a@b.com', 'secret1', 'alice'),
    );
  });

  test('a rejected register promise renders the error text via role="alert"', async () => {
    mockAuth.register.mockRejectedValue(new Error('email already registered'));
    render(<RegisterPage onSwitchToLogin={() => {}} />);

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'alice' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Register' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('email already registered');
  });

  test('clicking the switch button calls onSwitchToLogin', () => {
    const onSwitchToLogin = vi.fn();
    render(<RegisterPage onSwitchToLogin={onSwitchToLogin} />);

    fireEvent.click(screen.getByText('Already have an account? Log in'));

    expect(onSwitchToLogin).toHaveBeenCalled();
  });

  test('disables native HTML validation on the form', () => {
    render(<RegisterPage onSwitchToLogin={() => {}} />);

    const form = screen.getByRole('button', { name: 'Register' }).closest('form');
    expect(form.noValidate).toBe(true);
  });

  test('does not show validation errors before the user interacts with the form', () => {
    render(<RegisterPage onSwitchToLogin={() => {}} />);

    expect(screen.queryByText('Username is required.')).not.toBeInTheDocument();
    expect(screen.queryByText('Email is required.')).not.toBeInTheDocument();
    expect(screen.queryByText('Password is required.')).not.toBeInTheDocument();
  });

  test('submitting an empty form shows required-field messages and does not call register', () => {
    render(<RegisterPage onSwitchToLogin={() => {}} />);

    fireEvent.click(screen.getByRole('button', { name: 'Register' }));

    expect(screen.getByText('Username is required.')).toBeInTheDocument();
    expect(screen.getByText('Email is required.')).toBeInTheDocument();
    expect(screen.getByText('Password is required.')).toBeInTheDocument();
    expect(mockAuth.register).not.toHaveBeenCalled();
  });

  test('a whitespace-only username is rejected', () => {
    render(<RegisterPage onSwitchToLogin={() => {}} />);

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: '   ' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Register' }));

    expect(screen.getByText('Username is required.')).toBeInTheDocument();
    expect(mockAuth.register).not.toHaveBeenCalled();
  });

  test('an invalid email format shows a validation message and does not call register', () => {
    render(<RegisterPage onSwitchToLogin={() => {}} />);

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'alice' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'not-an-email' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Register' }));

    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument();
    expect(mockAuth.register).not.toHaveBeenCalled();
  });

  test('marks an invalid username as aria-invalid and clears the error once corrected', () => {
    render(<RegisterPage onSwitchToLogin={() => {}} />);
    const usernameInput = screen.getByLabelText('Username');

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Register' }));

    expect(usernameInput).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Username is required.')).toBeInTheDocument();

    fireEvent.change(usernameInput, { target: { value: 'alice' } });

    expect(usernameInput).toHaveAttribute('aria-invalid', 'false');
    expect(screen.queryByText('Username is required.')).not.toBeInTheDocument();
  });
});
