import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { sampleBooks } from '@/test/fixtures/books';
import { BooksContent } from './BooksContent';
import { listBooks } from './repository';

vi.mock('./repository', () => ({ listBooks: vi.fn() }));
vi.mock('./actions', () => ({ deleteBookAction: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: vi.fn() }) }));

async function renderContent(params: { message?: string | string[] } = {}) {
  // 非同期の Server Component は、関数として呼んで結果を render する
  render(await BooksContent({ searchParams: Promise.resolve(params) }));
}

beforeEach(() => {
  vi.mocked(listBooks).mockReturnValue(sampleBooks);
});

describe('BooksContent', () => {
  it('BOOK-L01 件数と一覧の表が表示される', async () => {
    await renderContent();

    expect(screen.getByText('全3件')).toBeInTheDocument();
    expect(screen.getByRole('table', { name: '書籍一覧' })).toBeInTheDocument();
  });

  it('BOOK-L02 0件なら「書籍が登録されていません」が表示され、表は表示されない', async () => {
    vi.mocked(listBooks).mockReturnValue([]);
    await renderContent();

    expect(screen.getByText('全0件')).toBeInTheDocument();
    expect(screen.getByText('書籍が登録されていません')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it.each([
    ['created', '登録しました'],
    ['updated', '更新しました'],
    ['deleted', '削除しました'],
  ])('BOOK-L03 message=%s なら「%s」が表示される', async (message, text) => {
    await renderContent({ message });

    expect(screen.getByRole('status')).toHaveTextContent(text);
  });

  it.each([
    ['なし', undefined],
    ['不明な値', 'unknown'],
    ['オブジェクトが元から持つ名前', 'toString'],
    ['配列（?message=a&message=b）', ['created', 'updated']],
  ])(
    'BOOK-L03 message が%sなら、メッセージは表示されない',
    async (_, message) => {
      await renderContent({ message });

      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    },
  );
});
