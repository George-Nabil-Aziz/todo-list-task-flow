import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import TaskItem from './TaskItem.jsx';

const baseTask = { id: 1, title: 'Buy milk', status: 'pending', priority: 'medium' };

describe('TaskItem', () => {
  test('renders title and pending status', () => {
    render(<TaskItem task={baseTask} onEdit={vi.fn()} onDelete={vi.fn()} onStatusChange={vi.fn()} onPriorityChange={vi.fn()} />);
    expect(screen.getByText('Buy milk')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  test('toggles status', () => {
    const onStatusChange = vi.fn();
    render(<TaskItem task={baseTask} onEdit={vi.fn()} onDelete={vi.fn()} onStatusChange={onStatusChange} onPriorityChange={vi.fn()} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onStatusChange).toHaveBeenCalledWith(1, 'completed');
  });

  test('renders the priority badge text for the task priority', () => {
    render(
      <TaskItem
        task={{ ...baseTask, priority: 'high' }}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onStatusChange={vi.fn()}
        onPriorityChange={vi.fn()}
      />
    );
    expect(screen.getByText('High', { selector: '.task-item__priority-badge' })).toBeInTheDocument();
  });

  test('changing the priority select calls onPriorityChange', () => {
    const onPriorityChange = vi.fn();
    render(
      <TaskItem
        task={baseTask}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onStatusChange={vi.fn()}
        onPriorityChange={onPriorityChange}
      />
    );
    fireEvent.change(screen.getByLabelText('Change priority of "Buy milk"'), { target: { value: 'high' } });
    expect(onPriorityChange).toHaveBeenCalledWith(1, 'high');
  });

  test('deletes a task', () => {
    const onDelete = vi.fn();
    render(<TaskItem task={baseTask} onEdit={vi.fn()} onDelete={onDelete} onStatusChange={vi.fn()} onPriorityChange={vi.fn()} />);
    fireEvent.click(screen.getByText('Delete'));
    expect(onDelete).toHaveBeenCalledWith(1);
  });

  test('edits the title, saving calls onEdit', () => {
    const onEdit = vi.fn();
    render(<TaskItem task={baseTask} onEdit={onEdit} onDelete={vi.fn()} onStatusChange={vi.fn()} onPriorityChange={vi.fn()} />);
    fireEvent.click(screen.getByText('Edit'));
    const input = screen.getByLabelText('Edit task title');
    fireEvent.change(input, { target: { value: 'Buy oat milk' } });
    fireEvent.click(screen.getByText('Save'));
    expect(onEdit).toHaveBeenCalledWith(1, 'Buy oat milk');
  });

  test('cancel discards edits', () => {
    const onEdit = vi.fn();
    render(<TaskItem task={baseTask} onEdit={onEdit} onDelete={vi.fn()} onStatusChange={vi.fn()} onPriorityChange={vi.fn()} />);
    fireEvent.click(screen.getByText('Edit'));
    const input = screen.getByLabelText('Edit task title');
    fireEvent.change(input, { target: { value: 'Something else' } });
    fireEvent.click(screen.getByText('Cancel'));
    expect(onEdit).not.toHaveBeenCalled();
    expect(screen.getByText('Buy milk')).toBeInTheDocument();
  });

  test('rejects empty/whitespace title on save', () => {
    const onEdit = vi.fn();
    render(<TaskItem task={baseTask} onEdit={onEdit} onDelete={vi.fn()} onStatusChange={vi.fn()} onPriorityChange={vi.fn()} />);
    fireEvent.click(screen.getByText('Edit'));
    const input = screen.getByLabelText('Edit task title');
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.click(screen.getByText('Save'));
    expect(onEdit).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  test('does not show a validation error before interacting with the edit form', () => {
    render(<TaskItem task={baseTask} onEdit={vi.fn()} onDelete={vi.fn()} onStatusChange={vi.fn()} onPriorityChange={vi.fn()} />);
    fireEvent.click(screen.getByText('Edit'));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('clears the validation error once the title is corrected', () => {
    const onEdit = vi.fn();
    render(<TaskItem task={baseTask} onEdit={onEdit} onDelete={vi.fn()} onStatusChange={vi.fn()} onPriorityChange={vi.fn()} />);
    fireEvent.click(screen.getByText('Edit'));
    const input = screen.getByLabelText('Edit task title');

    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.click(screen.getByText('Save'));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-invalid', 'true');

    fireEvent.change(input, { target: { value: 'Buy oat milk' } });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(input).toHaveAttribute('aria-invalid', 'false');
  });
});
