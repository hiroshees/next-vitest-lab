import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { sampleBooks } from '@/test/fixtures/books';
import type { DeleteBookResult } from './actions';
import { BookList } from './BookList';

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }));

type DeleteAction = (id: string) => Promise<DeleteBookResult>;

function setup(deleteAction = vi.fn<DeleteAction>(async () => ({ ok: true }))) {
  const user = userEvent.setup();
  render(<BookList books={sampleBooks} deleteAction={deleteAction} />);
  return { user, deleteAction };
}

const rowOf = (title: string) =>
  screen.getByRole('row', { name: new RegExp(title) });
const deleteButtonOf = (title: string) =>
  within(rowOf(title)).getByRole('button', { name: '削除' });

describe('BookList 表示', () => {
  it('BOOK-L01 見出しの列が表示される', () => {
    setup();

    const headers = screen
      .getAllByRole('columnheader')
      .map((th) => th.textContent);
    expect(headers).toEqual(['タイトル', '著者', 'ジャンル', '出版年', '操作']);
  });

  it('BOOK-L01 各行にタイトル・著者・ジャンル・出版年と、編集・削除が表示される', () => {
    setup();

    const row = rowOf('チームで進める仕事術');
    const cells = within(row)
      .getAllByRole('cell')
      .map((td) => td.textContent);
    expect(cells).toEqual([
      'チームで進める仕事術',
      '佐藤花子',
      'ビジネス',
      '2021',
      '編集削除',
    ]);
  });

  it('受け取った順番のまま表示する', () => {
    setup();

    const titles = screen
      .getAllByRole('row')
      .slice(1)
      .map((row) => within(row).getAllByRole('cell')[0].textContent);
    expect(titles).toEqual([
      'はじめてのTypeScript',
      'チームで進める仕事術',
      '配色の基本',
    ]);
  });

  it('BOOK-L05 「編集」はその書籍の編集画面へのリンクになっている', () => {
    setup();

    expect(
      within(rowOf('はじめてのTypeScript')).getByRole('link', { name: '編集' }),
    ).toHaveAttribute('href', '/books/3/edit');
  });
});

describe('BookList 削除', () => {
  it('BOOK-D01 「削除」でその書籍の確認モーダルが開く', async () => {
    const { user } = setup();

    await user.click(deleteButtonOf('チームで進める仕事術'));

    expect(
      screen.getByRole('dialog', { name: '書籍の削除' }),
    ).toHaveAccessibleDescription('『チームで進める仕事術』を削除しますか？');
  });

  it('BOOK-D02 BOOK-D07 「いいえ」で閉じ、削除されず、押した「削除」ボタンにフォーカスが戻る', async () => {
    const { user, deleteAction } = setup();

    await user.click(deleteButtonOf('チームで進める仕事術'));
    await user.click(screen.getByRole('button', { name: 'いいえ' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(deleteAction).not.toHaveBeenCalled();
    expect(deleteButtonOf('チームで進める仕事術')).toHaveFocus();
  });

  it('BOOK-D03 BOOK-D07 Esc で閉じ、押した「削除」ボタンにフォーカスが戻る', async () => {
    const { user, deleteAction } = setup();

    await user.click(deleteButtonOf('配色の基本'));
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(deleteAction).not.toHaveBeenCalled();
    expect(deleteButtonOf('配色の基本')).toHaveFocus();
  });

  it('BOOK-D04 「はい」でその書籍の id を渡して削除し、閉じて一覧へ移動する', async () => {
    const { user, deleteAction } = setup();

    await user.click(deleteButtonOf('チームで進める仕事術'));
    await user.click(screen.getByRole('button', { name: 'はい' }));

    expect(deleteAction).toHaveBeenCalledWith('2');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(replace).toHaveBeenCalledWith('/books?message=deleted');
  });

  it('BOOK-D06 削除処理中は「はい」「いいえ」が押せない', async () => {
    const { promise, resolve } = Promise.withResolvers<DeleteBookResult>();
    const { user } = setup(vi.fn<DeleteAction>(() => promise));

    await user.click(deleteButtonOf('チームで進める仕事術'));
    await user.click(screen.getByRole('button', { name: 'はい' }));

    expect(await screen.findByRole('button', { name: 'はい' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'いいえ' })).toBeDisabled();

    // 後片付け：処理を終わらせておかないと、次のテストのトランジションまで待たされる。
    // 成功で終わらせると router.replace が呼ばれるので、失敗の結果で終わらせる
    await act(async () => {
      resolve({ ok: false, message: '中断しました' });
    });
  });

  it('BOOK-D08 削除に失敗したら、モーダルにメッセージを表示し、閉じない', async () => {
    const { user } = setup(
      vi.fn<DeleteAction>(async () => ({
        ok: false,
        message: '対象の書籍が見つかりません',
      })),
    );

    await user.click(deleteButtonOf('チームで進める仕事術'));
    await user.click(screen.getByRole('button', { name: 'はい' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      '対象の書籍が見つかりません',
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'いいえ' })).toBeEnabled();
    expect(replace).not.toHaveBeenCalled();
  });
});
