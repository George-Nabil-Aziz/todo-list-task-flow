import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import LoginPage from './LoginPage.jsx';
import * as AuthContext from '../context/AuthContext.jsx';

vi.mock('../context/AuthContext.jsx');

describe('LoginPage', () => {
  let mockAuth;

  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    mockAuth = { login: vi.fn(), register: vi.fn(), logout: vi.fn(), isAuthenticated: false };
    AuthContext.useAuth.mockImplementation(() => mockAuth);
  });

  test('renders a theme toggle that switches the theme', () => {
    render(<LoginPage onSwitchToRegister={() => {}} />);

    const toggle = screen.getByRole('switch');
    fireEvent.click(toggle);

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  test('submitting valid credentials calls useAuth().login', async () => {
    mockAuth.login.mockResolvedValue(undefined);
    render(<LoginPage onSwitchToRegister={() => {}} />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Log In' }));

    await waitFor(() => expect(mockAuth.login).toHaveBeenCalledWith('a@b.com', 'secret1'));
  });

  test('a rejected login promise renders the error text via role="alert"', async () => {
    mockAuth.login.mockRejectedValue(new Error('Invalid email or password'));
    render(<LoginPage onSwitchToRegister={() => {}} />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: 'Log In' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password');
  });

  test('clicking the switch button calls onSwitchToRegister', () => {
    const onSwitchToRegister = vi.fn();
    render(<LoginPage onSwitchToRegister={onSwitchToRegister} />);

    fireEvent.click(screen.getByText('Need an account? Register'));

    expect(onSwitchToRegister).toHaveBeenCalled();
  });

  test('disables native HTML validation on the form', () => {
    render(<LoginPage onSwitchToRegister={() => {}} />);

    const form = screen.getByRole('button', { name: 'Log In' }).closest('form');
    expect(form.noValidate).toBe(true);
  });

  test('does not show validation errors before the user interacts with the form', () => {
    render(<LoginPage onSwitchToRegister={() => {}} />);

    expect(screen.queryByText('Email is required.')).not.toBeInTheDocument();
    expect(screen.queryByText('Password is required.')).not.toBeInTheDocument();
  });

  test('submitting an empty form shows required-field messages and does not call login', () => {
    render(<LoginPage onSwitchToRegister={() => {}} />);

    fireEvent.click(screen.getByRole('button', { name: 'Log In' }));

    expect(screen.getByText('Email is required.')).toBeInTheDocument();
    expect(screen.getByText('Password is required.')).toBeInTheDocument();
    expect(mockAuth.login).not.toHaveBeenCalled();
  });

  test('an invalid email format shows a validation message and does not call login', () => {
    render(<LoginPage onSwitchToRegister={() => {}} />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'not-an-email' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Log In' }));

    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument();
    expect(mockAuth.login).not.toHaveBeenCalled();
  });

  test('marks an invalid email as aria-invalid and clears the error once corrected', () => {
    render(<LoginPage onSwitchToRegister={() => {}} />);
    const emailInput = screen.getByLabelText('Email');

    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Log In' }));

    expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Email is required.')).toBeInTheDocument();

    fireEvent.change(emailInput, { target: { value: 'a@b.com' } });

    expect(emailInput).toHaveAttribute('aria-invalid', 'false');
    expect(screen.queryByText('Email is required.')).not.toBeInTheDocument();
  });
});
