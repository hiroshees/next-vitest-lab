import { render, screen } from '@testing-library/react';
import { notFound } from 'next/navigation';
import { describe, expect, it, vi } from 'vitest';
import { findBook } from '@/features/books/repository';
import EditBookPage from './page';

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));
vi.mock('@/features/books/repository', () => ({ findBook: vi.fn() }));
// Server Action 本体（next/cache などを読み込む）は、このテストでは使わない
vi.mock('@/features/books/actions', () => ({ updateBookAction: vi.fn() }));

function renderPage(id: string) {
  return EditBookPage({ params: Promise.resolve({ id }) });
}

describe('EditBookPage', () => {
  it('BOOK-E01 登録済みの値が入った状態でフォームが表示される', async () => {
    vi.mocked(findBook).mockReturnValue({
      id: '2',
      title: 'チームで進める仕事術',
      author: '佐藤花子',
      genre: 'ビジネス',
      publishedYear: 2021,
      memo: '読書会で使用',
    });

    render(await renderPage('2'));

    expect(findBook).toHaveBeenCalledWith('2');
    expect(
      screen.getByRole('heading', { level: 1, name: '書籍の編集' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'タイトル' })).toHaveValue(
      'チームで進める仕事術',
    );
    expect(screen.getByRole('combobox', { name: 'ジャンル' })).toHaveValue(
      'ビジネス',
    );
    // 数値の出版年が、文字列としてフォームに入る
    expect(screen.getByRole('textbox', { name: '出版年' })).toHaveValue('2021');
    expect(
      screen.getByRole('button', { name: '更新する' }),
    ).toBeInTheDocument();
  });

  it('BOOK-E04 存在しない id なら notFound を呼ぶ', async () => {
    vi.mocked(findBook).mockReturnValue(undefined);

    await expect(renderPage('999')).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFound).toHaveBeenCalled();
  });
});
