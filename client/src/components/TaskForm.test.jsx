import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import TaskForm from './TaskForm.jsx';

describe('TaskForm', () => {
  test('submits a valid title and clears the input', () => {
    const onAdd = vi.fn();
    render(<TaskForm onAdd={onAdd} />);

    const input = screen.getByLabelText('New task title');
    fireEvent.change(input, { target: { value: 'Buy milk' } });
    fireEvent.click(screen.getByText('Add'));

    expect(onAdd).toHaveBeenCalledWith('Buy milk', 'medium');
    expect(input.value).toBe('');
  });

  test('selecting a priority and submitting calls onAdd with the title and priority', () => {
    const onAdd = vi.fn();
    render(<TaskForm onAdd={onAdd} />);

    fireEvent.change(screen.getByLabelText('New task title'), { target: { value: 'Buy milk' } });
    fireEvent.change(screen.getByLabelText('Priority'), { target: { value: 'high' } });
    fireEvent.click(screen.getByText('Add'));

    expect(onAdd).toHaveBeenCalledWith('Buy milk', 'high');
  });

  test('rejects empty or whitespace-only title', () => {
    const onAdd = vi.fn();
    render(<TaskForm onAdd={onAdd} />);

    fireEvent.click(screen.getByText('Add'));

    expect(onAdd).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  test('rejects a whitespace-only title', () => {
    const onAdd = vi.fn();
    render(<TaskForm onAdd={onAdd} />);

    fireEvent.change(screen.getByLabelText('New task title'), { target: { value: '   ' } });
    fireEvent.click(screen.getByText('Add'));

    expect(onAdd).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  test('disables native HTML validation on the form', () => {
    render(<TaskForm onAdd={vi.fn()} />);

    const form = screen.getByText('Add').closest('form');
    expect(form.noValidate).toBe(true);
  });

  test('does not show a validation error before the user interacts with the form', () => {
    render(<TaskForm onAdd={vi.fn()} />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('clears the validation error once the title is corrected', () => {
    const onAdd = vi.fn();
    render(<TaskForm onAdd={onAdd} />);
    const input = screen.getByLabelText('New task title');

    fireEvent.click(screen.getByText('Add'));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-invalid', 'true');

    fireEvent.change(input, { target: { value: 'Buy milk' } });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(input).toHaveAttribute('aria-invalid', 'false');
  });
});
