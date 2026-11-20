import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCharacterLimit } from './useCharacterLimit';

describe('useCharacterLimit', () => {
  it('初期状態は空で、送信できない', () => {
    const { result } = renderHook(() => useCharacterLimit(10));

    expect(result.current.value).toBe('');
    expect(result.current.length).toBe(0);
    expect(result.current.isBlank).toBe(true);
    expect(result.current.canSubmit).toBe(false);
  });

  describe('入力内容による判定', () => {
    it.each([
      {
        label: '空',
        input: '',
        isBlank: true,
        isOver: false,
        canSubmit: false,
      },
      {
        label: '半角スペースだけ',
        input: '   ',
        isBlank: true,
        isOver: false,
        canSubmit: false,
      },
      {
        label: '全角スペースだけ',
        input: '　　',
        isBlank: true,
        isOver: false,
        canSubmit: false,
      },
      {
        label: '改行だけ',
        input: '\n\n',
        isBlank: true,
        isOver: false,
        canSubmit: false,
      },
      {
        label: '空白と文字',
        input: ' a\n',
        isBlank: false,
        isOver: false,
        canSubmit: true,
      },
      {
        label: 'ちょうど上限',
        input: 'a'.repeat(10),
        isBlank: false,
        isOver: false,
        canSubmit: true,
      },
      {
        label: '上限＋1',
        input: 'a'.repeat(11),
        isBlank: false,
        isOver: true,
        canSubmit: false,
      },
    ])('$label', ({ input, isBlank, isOver, canSubmit }) => {
      const { result } = renderHook(() => useCharacterLimit(10, input));

      expect(result.current).toMatchObject({ isBlank, isOver, canSubmit });
    });
  });

  it('setValue で値を変えると、文字数と判定が更新される', () => {
    const { result } = renderHook(() => useCharacterLimit(10));

    act(() => {
      result.current.setValue('hello');
    });

    expect(result.current.value).toBe('hello');
    expect(result.current.length).toBe(5);
    expect(result.current.canSubmit).toBe(true);
  });

  it('reset で空に戻る', () => {
    const { result } = renderHook(() => useCharacterLimit(10, 'hello'));

    act(() => {
      result.current.reset();
    });

    expect(result.current.value).toBe('');
    expect(result.current.canSubmit).toBe(false);
  });

  it('maxLength が変わると、同じ値でも判定が変わる', () => {
    const { result, rerender } = renderHook(
      ({ max }) => useCharacterLimit(max, 'abcde'),
      { initialProps: { max: 10 } },
    );
    expect(result.current.isOver).toBe(false);

    rerender({ max: 3 });

    expect(result.current.isOver).toBe(true);
  });
});
