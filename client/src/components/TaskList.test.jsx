import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import TaskList from './TaskList.jsx';

describe('TaskList', () => {
  test('renders empty state with no tasks', () => {
    render(<TaskList tasks={[]} onEdit={vi.fn()} onDelete={vi.fn()} onStatusChange={vi.fn()} onPriorityChange={vi.fn()} />);
    expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
  });

  test('renders one item per task', () => {
    const tasks = [
      { id: 1, title: 'Buy milk', status: 'pending', priority: 'medium' },
      { id: 2, title: 'Walk dog', status: 'completed', priority: 'high' },
    ];
    render(<TaskList tasks={tasks} onEdit={vi.fn()} onDelete={vi.fn()} onStatusChange={vi.fn()} onPriorityChange={vi.fn()} />);
    expect(screen.getByText('Buy milk')).toBeInTheDocument();
    expect(screen.getByText('Walk dog')).toBeInTheDocument();
  });

  test('renders a custom emptyMessage when provided', () => {
    render(
      <TaskList
        tasks={[]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onStatusChange={vi.fn()}
        onPriorityChange={vi.fn()}
        emptyMessage="No tasks match the selected priority filter."
      />
    );
    expect(screen.getByText('No tasks match the selected priority filter.')).toBeInTheDocument();
    expect(screen.queryByText(/no tasks yet/i)).not.toBeInTheDocument();
  });
});
