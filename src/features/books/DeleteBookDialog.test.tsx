import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DeleteBookDialog } from './DeleteBookDialog';

const book = { id: '2', title: 'チームで進める仕事術' };

function setup(props: Partial<Parameters<typeof DeleteBookDialog>[0]> = {}) {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  const user = userEvent.setup();
  render(
    <DeleteBookDialog
      book={book}
      onConfirm={onConfirm}
      onCancel={onCancel}
      {...props}
    />,
  );
  return {
    user,
    onConfirm,
    onCancel,
    yes: () => screen.getByRole('button', { name: 'はい' }),
    no: () => screen.getByRole('button', { name: 'いいえ' }),
  };
}

describe('DeleteBookDialog', () => {
  it('book が null なら何も表示しない', () => {
    setup({ book: null });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('BOOK-D01 BOOK-D09 見出しを名前に、メッセージを説明に持つモーダルとして表示される', () => {
    setup();

    const dialog = screen.getByRole('dialog', { name: '書籍の削除' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleDescription(
      '『チームで進める仕事術』を削除しますか？',
    );
  });

  it('BOOK-D07 開いたとき「いいえ」にフォーカスがある', () => {
    const { no } = setup();

    expect(no()).toHaveFocus();
  });

  it('BOOK-D04 「はい」で onConfirm が呼ばれる', async () => {
    const { user, yes, onConfirm, onCancel } = setup();

    await user.click(yes());

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('BOOK-D02 「いいえ」で onCancel が呼ばれる', async () => {
    const { user, no, onConfirm, onCancel } = setup();

    await user.click(no());

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('BOOK-D03 Esc で onCancel が呼ばれる', async () => {
    const { user, onCancel } = setup();

    await user.keyboard('{Escape}');

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('BOOK-D03 背景のクリックで onCancel が呼ばれ、本体のクリックでは呼ばれない', async () => {
    const { user, onCancel } = setup();

    await user.click(
      screen.getByText('『チームで進める仕事術』を削除しますか？'),
    );
    expect(onCancel).not.toHaveBeenCalled();

    await user.click(screen.getByTestId('dialog-backdrop'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('Tab / Shift+Tab で「はい」「いいえ」の間だけを行き来する', async () => {
    const { user, yes, no } = setup();

    await user.tab();
    expect(yes()).toHaveFocus();
    await user.tab();
    expect(no()).toHaveFocus();
    await user.tab({ shift: true });
    expect(yes()).toHaveFocus();
  });

  it('BOOK-D06 削除処理中は、ボタンが押せず、Esc や背景のクリックでも閉じない', async () => {
    const { user, yes, no, onCancel } = setup({ pending: true });

    expect(yes()).toBeDisabled();
    expect(no()).toBeDisabled();

    await user.keyboard('{Escape}');
    await user.click(screen.getByTestId('dialog-backdrop'));
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('BOOK-D08 エラーがあれば alert で表示される', () => {
    setup({ error: '対象の書籍が見つかりません' });

    expect(screen.getByRole('alert')).toHaveTextContent(
      '対象の書籍が見つかりません',
    );
  });
});
