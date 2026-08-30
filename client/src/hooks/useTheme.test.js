import { act, renderHook } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { useTheme } from './useTheme.js';

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete window.matchMedia;
  });

  test('defaults to the system theme when there is no stored preference', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });

    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('dark');
    expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
  });

  test('defaults to light when matchMedia is unavailable and there is no stored preference', () => {
    delete window.matchMedia;

    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('light');
  });

  test('prefers a stored value over the system theme', () => {
    localStorage.setItem('todo_theme_preference', 'dark');
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });

    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('dark');
  });

  test('toggleTheme flips the theme and persists it', () => {
    const { result } = renderHook(() => useTheme());
    const initial = result.current.theme;

    act(() => {
      result.current.toggleTheme();
    });

    const expected = initial === 'dark' ? 'light' : 'dark';
    expect(result.current.theme).toBe(expected);
    expect(localStorage.getItem('todo_theme_preference')).toBe(expected);
  });

  test('toggleTheme updates the data-theme attribute on the document element', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.toggleTheme();
    });

    expect(document.documentElement.getAttribute('data-theme')).toBe(result.current.theme);
  });

  test('toggleTheme does not throw when localStorage.setItem throws', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage disabled');
    });
    const { result } = renderHook(() => useTheme());

    expect(() => {
      act(() => {
        result.current.toggleTheme();
      });
    }).not.toThrow();
  });
});
