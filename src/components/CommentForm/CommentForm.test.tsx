import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommentForm } from './CommentForm';

function setup() {
  const user = userEvent.setup();
  const onSubmit = vi.fn<(comment: string) => void>();
  render(<CommentForm onSubmit={onSubmit} />);
  const textarea = screen.getByRole('textbox', { name: 'コメント' });
  const button = screen.getByRole('button', { name: '送信' });
  return { user, onSubmit, textarea, button };
}

describe('CommentForm', () => {
  it('初期状態は空で、0 / 140 と表示され、エラーはない', () => {
    const { textarea, button } = setup();

    expect(textarea).toHaveValue('');
    expect(screen.getByText('0 / 140')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it('入力した内容が反映され、文字数が更新される', async () => {
    const { user, textarea, button } = setup();

    await user.type(textarea, 'taro');

    expect(textarea).toHaveValue('taro');
    expect(screen.getByText('4 / 140')).toBeInTheDocument();
    expect(button).toBeEnabled();
  });

  describe('文字数の上限', () => {
    it('ちょうど140文字ではエラーにならない', async () => {
      const { user, textarea, button } = setup();

      await user.type(textarea, 'a'.repeat(140));

      expect(textarea).not.toBeInvalid();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(button).toBeEnabled();
    });

    it('141文字になるとエラーが表示され、入力欄が不正な状態になる', async () => {
      const { user, textarea, button } = setup();

      await user.type(textarea, 'a'.repeat(141));

      expect(textarea).toBeInvalid();
      expect(screen.getByRole('alert')).toHaveTextContent(
        '140文字以内で入力してください',
      );
      expect(textarea).toHaveAccessibleDescription(
        '140文字以内で入力してください',
      );
      expect(button).toBeDisabled();
    });

    it('141文字から1文字消すとエラーが消える', async () => {
      const { user, textarea, button } = setup();

      await user.type(textarea, 'a'.repeat(141));
      await user.type(textarea, '{Backspace}');

      expect(textarea).toHaveValue('a'.repeat(140));
      expect(textarea).not.toBeInvalid();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(button).toBeEnabled();
    });

    it('クリアすると空に戻り、0 / 140 になる', async () => {
      const { user, textarea, button } = setup();

      await user.type(textarea, 'taro');
      await user.clear(textarea);

      expect(textarea).toHaveValue('');
      expect(screen.getByText('0 / 140')).toBeInTheDocument();
      expect(button).toBeDisabled();
    });

    it('貼り付けた内容も反映される', async () => {
      const { user, textarea, button } = setup();

      await user.click(textarea);
      await user.paste('hanako');

      expect(textarea).toHaveValue('hanako');
      expect(screen.getByText('6 / 140')).toBeInTheDocument();
      expect(button).toBeEnabled();
    });
  });

  describe('送信ボタンの有効・無効', () => {
    it.each([
      { label: '空', input: '', enabled: false },
      { label: '半角スペースだけ', input: '   ', enabled: false },
      { label: '全角スペースだけ', input: '　　', enabled: false },
      { label: '改行だけ', input: '\n\n', enabled: false },
      { label: '空白と文字', input: ' a\n', enabled: true },
      { label: '140文字', input: 'a'.repeat(140), enabled: true },
      { label: '141文字', input: 'a'.repeat(141), enabled: false },
    ])('$label のとき、有効 = $enabled', async ({ input, enabled }) => {
      const { user, textarea, button } = setup();

      if (input) {
        await user.click(textarea);
        await user.paste(input);
      }

      if (enabled) {
        expect(button).toBeEnabled();
      } else {
        expect(button).toBeDisabled();
      }
    });
  });

  describe('送信', () => {
    it('送信すると、入力した値で onSubmit が1回呼ばれる', async () => {
      const { user, onSubmit, textarea, button } = setup();

      await user.type(textarea, 'こんにちは');
      await user.click(button);

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit).toHaveBeenCalledWith('こんにちは');
    });

    it('前後の空白と改行は取り除いて渡す', async () => {
      const { user, onSubmit, textarea, button } = setup();

      await user.click(textarea);
      await user.paste('  \nこんにちは\n  ');
      await user.click(button);

      expect(onSubmit).toHaveBeenCalledWith('こんにちは');
    });

    it('送信後は入力欄が空に戻り、ボタンは無効になる', async () => {
      const { user, textarea, button } = setup();

      await user.type(textarea, 'こんにちは');
      await user.click(button);

      expect(textarea).toHaveValue('');
      expect(screen.getByText('0 / 140')).toBeInTheDocument();
      expect(button).toBeDisabled();
    });

    it('続けて送信すると、それぞれの値で呼ばれる', async () => {
      const { user, onSubmit, textarea, button } = setup();

      await user.type(textarea, '1つ目');
      await user.click(button);
      await user.type(textarea, '2つ目');
      await user.click(button);

      expect(onSubmit).toHaveBeenCalledTimes(2);
      expect(onSubmit).toHaveBeenNthCalledWith(1, '1つ目');
      expect(onSubmit).toHaveBeenNthCalledWith(2, '2つ目');
    });

    it('ボタンが無効なときは、押しても onSubmit は呼ばれない', async () => {
      const { user, onSubmit, button } = setup();

      await user.click(button);

      expect(onSubmit).not.toHaveBeenCalled();
    });
  });
});
