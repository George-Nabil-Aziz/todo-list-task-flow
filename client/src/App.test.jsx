import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import App from './App.jsx';
import * as tasksApi from './api/tasksApi.js';
import * as AuthContext from './context/AuthContext.jsx';

vi.mock('./api/tasksApi.js');
vi.mock('./context/AuthContext.jsx');

describe('App', () => {
  let mockAuth;

  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    mockAuth = {
      isAuthenticated: true,
      username: 'testuser',
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    };
    AuthContext.useAuth.mockImplementation(() => mockAuth);
  });

  test('loads and renders tasks on mount', async () => {
    tasksApi.fetchTasks.mockResolvedValue([{ id: 1, title: 'Buy milk', status: 'pending', priority: 'medium' }]);
    render(<App />);
    expect(await screen.findByText('Buy milk')).toBeInTheDocument();
  });

  test('renders "Logged in as <username>" when authenticated', async () => {
    tasksApi.fetchTasks.mockResolvedValue([]);
    render(<App />);
    expect(await screen.findByText('Logged in as testuser')).toBeInTheDocument();
  });

  test('adds a task', async () => {
    tasksApi.fetchTasks.mockResolvedValue([]);
    tasksApi.createTask.mockResolvedValue({ id: 1, title: 'Buy milk', status: 'pending', priority: 'medium' });
    render(<App />);
    await waitFor(() => expect(tasksApi.fetchTasks).toHaveBeenCalled());

    fireEvent.change(screen.getByLabelText('New task title'), { target: { value: 'Buy milk' } });
    fireEvent.click(screen.getByText('Add'));

    expect(await screen.findByText('Buy milk')).toBeInTheDocument();
    expect(tasksApi.createTask).toHaveBeenCalledWith('Buy milk', 'medium');
  });

  test('adds a task with a selected priority', async () => {
    tasksApi.fetchTasks.mockResolvedValue([]);
    tasksApi.createTask.mockResolvedValue({ id: 1, title: 'Buy milk', status: 'pending', priority: 'high' });
    render(<App />);
    await waitFor(() => expect(tasksApi.fetchTasks).toHaveBeenCalled());

    fireEvent.change(screen.getByLabelText('New task title'), { target: { value: 'Buy milk' } });
    fireEvent.change(screen.getByLabelText('Priority'), { target: { value: 'high' } });
    fireEvent.click(screen.getByText('Add'));

    expect(await screen.findByText('Buy milk')).toBeInTheDocument();
    expect(tasksApi.createTask).toHaveBeenCalledWith('Buy milk', 'high');
  });

  test('deletes a task', async () => {
    tasksApi.fetchTasks.mockResolvedValue([{ id: 1, title: 'Buy milk', status: 'pending', priority: 'medium' }]);
    tasksApi.deleteTask.mockResolvedValue(null);
    render(<App />);
    await screen.findByText('Buy milk');

    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => expect(screen.queryByText('Buy milk')).not.toBeInTheDocument());
    expect(tasksApi.deleteTask).toHaveBeenCalledWith(1);
  });

  test('toggles status', async () => {
    tasksApi.fetchTasks.mockResolvedValue([{ id: 1, title: 'Buy milk', status: 'pending', priority: 'medium' }]);
    tasksApi.setTaskStatus.mockResolvedValue({ id: 1, title: 'Buy milk', status: 'completed', priority: 'medium' });
    render(<App />);
    await screen.findByText('Buy milk');

    fireEvent.click(screen.getByRole('checkbox'));

    expect(await screen.findByText('Completed')).toBeInTheDocument();
    expect(tasksApi.setTaskStatus).toHaveBeenCalledWith(1, 'completed');
  });

  test('changes a task priority', async () => {
    tasksApi.fetchTasks.mockResolvedValue([{ id: 1, title: 'Buy milk', status: 'pending', priority: 'medium' }]);
    tasksApi.setTaskPriority.mockResolvedValue({ id: 1, title: 'Buy milk', status: 'pending', priority: 'high' });
    render(<App />);
    await screen.findByText('Buy milk');

    fireEvent.change(screen.getByLabelText('Change priority of "Buy milk"'), { target: { value: 'high' } });

    await waitFor(() => expect(tasksApi.setTaskPriority).toHaveBeenCalledWith(1, 'high'));
  });

  test('filtering by priority hides non-matching tasks and shows the no-match message', async () => {
    tasksApi.fetchTasks.mockResolvedValue([
      { id: 1, title: 'Buy milk', status: 'pending', priority: 'low' },
      { id: 2, title: 'Walk dog', status: 'pending', priority: 'high' },
    ]);
    render(<App />);
    await screen.findByText('Buy milk');

    fireEvent.change(screen.getByLabelText('Filter by priority'), { target: { value: 'medium' } });

    expect(screen.queryByText('Buy milk')).not.toBeInTheDocument();
    expect(screen.queryByText('Walk dog')).not.toBeInTheDocument();
    expect(screen.getByText('No tasks match the selected priority filter.')).toBeInTheDocument();
  });

  test('sorting by priority changes the rendered task order', async () => {
    tasksApi.fetchTasks.mockResolvedValue([
      { id: 1, title: 'Low task', status: 'pending', priority: 'low' },
      { id: 2, title: 'High task', status: 'pending', priority: 'high' },
      { id: 3, title: 'Medium task', status: 'pending', priority: 'medium' },
    ]);
    render(<App />);
    await screen.findByText('Low task');

    fireEvent.change(screen.getByLabelText('Sort by priority'), { target: { value: 'high-first' } });

    const titlesHighFirst = screen.getAllByRole('listitem').map((item) => item.textContent);
    expect(titlesHighFirst[0]).toContain('High task');
    expect(titlesHighFirst[2]).toContain('Low task');

    fireEvent.change(screen.getByLabelText('Sort by priority'), { target: { value: 'low-first' } });

    const titlesLowFirst = screen.getAllByRole('listitem').map((item) => item.textContent);
    expect(titlesLowFirst[0]).toContain('Low task');
    expect(titlesLowFirst[2]).toContain('High task');
  });

  test('renders the login screen when unauthenticated', () => {
    mockAuth.isAuthenticated = false;
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Log In' })).toBeInTheDocument();
    expect(tasksApi.fetchTasks).not.toHaveBeenCalled();
  });

  test('renders a theme toggle in the dashboard header that switches the theme', async () => {
    tasksApi.fetchTasks.mockResolvedValue([]);
    render(<App />);
    await waitFor(() => expect(tasksApi.fetchTasks).toHaveBeenCalled());

    const toggle = screen.getByRole('switch');
    fireEvent.click(toggle);

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    fireEvent.click(toggle);

    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  test('a 401 from a task fetch logs the user out', async () => {
    const error = new Error('Invalid or expired token');
    error.status = 401;
    tasksApi.fetchTasks.mockRejectedValue(error);
    render(<App />);

    await waitFor(() => expect(mockAuth.logout).toHaveBeenCalled());
  });
});
