// @vitest-environment node
import { beforeEach, describe, expect, it } from 'vitest';
import {
  deleteBook,
  findBook,
  insertBook,
  listBooks,
  resetBooks,
  updateBook,
} from './repository';
import type { BookData } from './validateBook';

const newBook: BookData = {
  title: 'テスト駆動入門',
  author: '高橋次郎',
  genre: '技術書',
  publishedYear: 2024,
  memo: '',
};

// データは globalThis に残るので、テストごとに初期状態へ戻す
beforeEach(() => {
  resetBooks();
});

describe('repository', () => {
  it('BOOK-R01 初期データ3件が新しい順で返る', () => {
    expect(listBooks().map((b) => b.title)).toEqual([
      'はじめてのTypeScript',
      'チームで進める仕事術',
      '配色の基本',
    ]);
  });

  it('BOOK-R02 追加すると新しいidが付き、一覧の先頭に来る', () => {
    const book = insertBook(newBook);

    expect(book).toEqual({ id: '4', ...newBook });
    expect(listBooks()).toHaveLength(4);
    expect(listBooks()[0]).toEqual(book);
  });

  it('BOOK-R03 idで取得・更新できる。ないidは undefined', () => {
    expect(findBook('2')?.title).toBe('チームで進める仕事術');

    expect(updateBook('2', newBook)).toEqual({ id: '2', ...newBook });
    expect(findBook('2')).toEqual({ id: '2', ...newBook });

    expect(findBook('999')).toBeUndefined();
    expect(updateBook('999', newBook)).toBeUndefined();
  });

  it('BOOK-R04 削除できたら true で一覧から消える。ないidは false', () => {
    expect(deleteBook('1')).toBe(true);
    expect(listBooks().map((b) => b.id)).toEqual(['3', '2']);

    expect(deleteBook('1')).toBe(false);
  });

  it('BOOK-R05 resetBooks で初期状態に戻る（idの連番も戻る）', () => {
    insertBook(newBook);
    deleteBook('1');

    resetBooks();

    expect(listBooks()).toHaveLength(3);
    expect(insertBook(newBook).id).toBe('4');
  });

  it('削除したidは再利用しない', () => {
    deleteBook('3');
    expect(insertBook(newBook).id).toBe('4');
  });

  it('取得した値を書き換えても、保存データは変わらない', () => {
    const book = listBooks()[0];
    book.title = '書き換え';

    expect(listBooks()[0].title).toBe('はじめてのTypeScript');
  });
});
