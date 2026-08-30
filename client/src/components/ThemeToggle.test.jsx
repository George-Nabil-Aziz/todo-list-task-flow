import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import ThemeToggle from './ThemeToggle.jsx';

describe('ThemeToggle', () => {
  test('renders as a switch that is off when theme is light', () => {
    render(<ThemeToggle theme="light" onToggle={() => {}} />);

    const toggle = screen.getByRole('switch', { name: 'Switch to dark mode' });
    expect(toggle).toHaveAttribute('aria-checked', 'false');
  });

  test('renders as a switch that is on when theme is dark', () => {
    render(<ThemeToggle theme="dark" onToggle={() => {}} />);

    const toggle = screen.getByRole('switch', { name: 'Switch to light mode' });
    expect(toggle).toHaveAttribute('aria-checked', 'true');
  });

  test('clicking the toggle calls onToggle', () => {
    const onToggle = vi.fn();
    render(<ThemeToggle theme="light" onToggle={onToggle} />);

    fireEvent.click(screen.getByRole('switch'));

    expect(onToggle).toHaveBeenCalled();
  });
});
