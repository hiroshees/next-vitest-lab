import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { sampleBooks } from '@/test/fixtures/books';
import { BookList } from './BookList';

describe('BookList', () => {
  it('BOOK-L01 見出しの列が表示される', () => {
    render(<BookList books={sampleBooks} />);

    const headers = screen
      .getAllByRole('columnheader')
      .map((th) => th.textContent);
    expect(headers).toEqual(['タイトル', '著者', 'ジャンル', '出版年', '操作']);
  });

  it('BOOK-L01 各行にタイトル・著者・ジャンル・出版年が表示される', () => {
    render(<BookList books={sampleBooks} />);

    const row = screen.getByRole('row', { name: /チームで進める仕事術/ });
    const cells = within(row)
      .getAllByRole('cell')
      .map((td) => td.textContent);
    expect(cells).toEqual([
      'チームで進める仕事術',
      '佐藤花子',
      'ビジネス',
      '2021',
      '編集',
    ]);
  });

  it('受け取った順番のまま表示する', () => {
    render(<BookList books={sampleBooks} />);

    // 1行目は見出しなので除く
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
    render(<BookList books={sampleBooks} />);

    const row = screen.getByRole('row', { name: /はじめてのTypeScript/ });
    expect(within(row).getByRole('link', { name: '編集' })).toHaveAttribute(
      'href',
      '/books/3/edit',
    );
  });
});
