import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('デフォルトで正しく初期化される', () => {
    const { result } = renderHook(() => useCounter());

    expect(result.current.count).toBe(0);
    expect(result.current.canIncrement).toBe(true);
    expect(result.current.canDecrement).toBe(false);
  });

  it('初期値、最小値、最大値で初期化される', () => {
    const { result } = renderHook(() =>
      useCounter({ initial: 5, min: 0, max: 10 }),
    );

    expect(result.current.count).toBe(5);
    expect(result.current.canIncrement).toBe(true);
    expect(result.current.canDecrement).toBe(true);
  });

  it('increment を呼ぶとカウントが増え、上限に達するとそれ以上増えない', () => {
    const { result } = renderHook(() => useCounter({ initial: 9, max: 10 }));

    act(() => {
      result.current.increment();
    });
    expect(result.current.count).toBe(10);
    expect(result.current.canIncrement).toBe(false);

    act(() => {
      result.current.increment();
    });
    expect(result.current.count).toBe(10);
  });

  it('decrement を呼ぶとカウントが減り、下限に達するとそれ以上減らない', () => {
    const { result } = renderHook(() => useCounter({ initial: 1, min: 0 }));

    expect(result.current.canDecrement).toBe(true);

    act(() => {
      result.current.decrement();
    });
    expect(result.current.count).toBe(0);
    expect(result.current.canDecrement).toBe(false);

    act(() => {
      result.current.decrement();
    });
    expect(result.current.count).toBe(0);
  });

  it('resetで初期値に戻る', () => {
    const { result } = renderHook(() => useCounter({ initial: 5 }));

    act(() => {
      result.current.increment();
      result.current.increment();
    });
    expect(result.current.count).toBe(7);

    act(() => {
      result.current.reset();
    });
    expect(result.current.count).toBe(5);
  });

  describe('連続して呼んだとき', () => {
    it('続けて3回 increment すると3増える', () => {
      const { result } = renderHook(() => useCounter());

      act(() => {
        result.current.increment();
        result.current.increment();
        result.current.increment();
      });

      expect(result.current.count).toBe(3);
    });

    it('続けて3回 increment しても max を超えない', () => {
      const { result } = renderHook(() => useCounter({ initial: 9, max: 10 }));

      act(() => {
        result.current.increment();
        result.current.increment();
        result.current.increment();
      });

      expect(result.current.count).toBe(10);
    });
  });

  describe('initial が範囲外のとき', () => {
    it.each([
      { label: 'min より小さい', initial: -5, expected: 0 },
      { label: 'max より大きい', initial: 15, expected: 10 },
    ])('$label 場合は範囲内に収める', ({ initial, expected }) => {
      const { result } = renderHook(() =>
        useCounter({ initial, min: 0, max: 10 }),
      );

      expect(result.current.count).toBe(expected);
    });
  });
});
