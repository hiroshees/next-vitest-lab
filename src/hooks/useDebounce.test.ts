import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('最初は渡した値をそのまま返す', () => {
    const { result } = renderHook(() => useDebounce('a', 500));

    expect(result.current).toBe('a');
  });

  it('値が変わっても、delay がたつまでは古い値のまま', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      {
        initialProps: { value: 'a' },
      },
    );

    rerender({ value: 'ab' });
    act(() => {
      vi.advanceTimersByTime(499);
    });

    expect(result.current).toBe('a');
  });

  it('delay がたつと新しい値になる', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      {
        initialProps: { value: 'a' },
      },
    );

    rerender({ value: 'ab' });
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe('ab');
  });

  it('続けて値が変わると、そのたびに待ち時間がやり直しになり、最後の値だけが反映される', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      {
        initialProps: { value: 'a' },
      },
    );

    rerender({ value: 'ab' });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    rerender({ value: 'abc' });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // 'ab' から数えると600ミリ秒たっているが、'abc' からはまだ300ミリ秒
    expect(result.current).toBe('a');

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe('abc');
  });
});
