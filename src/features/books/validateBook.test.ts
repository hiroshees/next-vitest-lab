// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  type BookFormValues,
  toBookFormValues,
  validateBook,
} from './validateBook';

const CURRENT_YEAR = 2026;

const valid: BookFormValues = {
  title: 'はじめてのTypeScript',
  author: '山田太郎',
  genre: '技術書',
  publishedYear: '2023',
  memo: '',
};

/** valid の一部を変えてチェックし、エラーだけを取り出す（OKなら空オブジェクト） */
function errorsOf(patch: Partial<BookFormValues>) {
  const result = validateBook({ ...valid, ...patch }, CURRENT_YEAR);
  return result.ok ? {} : result.errors;
}

describe('validateBook', () => {
  it('BOOK-V01 正しい値なら ok で、前後の空白が除かれ、出版年が数値になる', () => {
    const result = validateBook(
      {
        title: '  はじめてのTypeScript  ',
        author: ' 山田太郎 ',
        genre: '技術書',
        publishedYear: ' 2023 ',
        memo: '  社内勉強会用  ',
      },
      CURRENT_YEAR,
    );

    expect(result).toEqual({
      ok: true,
      data: {
        title: 'はじめてのTypeScript',
        author: '山田太郎',
        genre: '技術書',
        publishedYear: 2023,
        memo: '社内勉強会用',
      },
    });
  });

  describe('BOOK-V02 必須', () => {
    it.each([
      ['title', 'タイトルを入力してください'],
      ['author', '著者を入力してください'],
      ['publishedYear', '出版年を入力してください'],
    ] as const)('%s が空ならエラー', (field, message) => {
      expect(errorsOf({ [field]: '' })[field]).toBe(message);
    });

    it.each(['title', 'author', 'publishedYear'] as const)(
      '%s が空白だけでもエラー',
      (field) => {
        expect(errorsOf({ [field]: '   ' })[field]).toBeDefined();
      },
    );
  });

  describe('BOOK-V03 文字数の境界値', () => {
    it('タイトルは100文字ならOK、101文字ならエラー', () => {
      expect(errorsOf({ title: 'あ'.repeat(100) }).title).toBeUndefined();
      expect(errorsOf({ title: 'あ'.repeat(101) }).title).toBe(
        'タイトルは100文字以内で入力してください',
      );
    });

    it('前後の空白は文字数に数えない', () => {
      expect(
        errorsOf({ title: ` ${'あ'.repeat(100)} ` }).title,
      ).toBeUndefined();
    });

    it('著者は50文字ならOK、51文字ならエラー', () => {
      expect(errorsOf({ author: 'あ'.repeat(50) }).author).toBeUndefined();
      expect(errorsOf({ author: 'あ'.repeat(51) }).author).toBe(
        '著者は50文字以内で入力してください',
      );
    });
  });

  describe('BOOK-V04 ジャンル', () => {
    it('空なら「選択してください」', () => {
      expect(errorsOf({ genre: '' }).genre).toBe('ジャンルを選択してください');
    });

    it('選択肢にない値なら「値が正しくありません」', () => {
      expect(errorsOf({ genre: '小説' }).genre).toBe(
        'ジャンルの値が正しくありません',
      );
    });

    it.each(['技術書', 'ビジネス', 'デザイン', 'その他'])(
      '%s はOK',
      (genre) => {
        expect(errorsOf({ genre }).genre).toBeUndefined();
      },
    );
  });

  it.each(['abc', '2020.5', '２０２０', '2020年'])(
    'BOOK-V05 出版年が %s なら「整数で」',
    (publishedYear) => {
      expect(errorsOf({ publishedYear }).publishedYear).toBe(
        '出版年は整数で入力してください',
      );
    },
  );

  describe('BOOK-V06 出版年の範囲', () => {
    const rangeMessage = '出版年は1900年から今年までで入力してください';

    it.each([
      ['1899', rangeMessage],
      ['1900', undefined],
      ['2026', undefined],
      ['2027', rangeMessage],
      ['-1', rangeMessage],
    ])('%s → %s', (publishedYear, expected) => {
      expect(errorsOf({ publishedYear }).publishedYear).toBe(expected);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('今年を渡さないときは、現在の日付の年を使う', () => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date('2030-06-01T00:00:00+09:00'));

      expect(validateBook({ ...valid, publishedYear: '2030' }).ok).toBe(true);
      expect(validateBook({ ...valid, publishedYear: '2031' }).ok).toBe(false);
    });
  });

  it('BOOK-V07 メモは空・500文字ならOK、501文字ならエラー', () => {
    expect(errorsOf({ memo: '' }).memo).toBeUndefined();
    expect(errorsOf({ memo: 'あ'.repeat(500) }).memo).toBeUndefined();
    expect(errorsOf({ memo: 'あ'.repeat(501) }).memo).toBe(
      'メモは500文字以内で入力してください',
    );
  });

  it('BOOK-V08 複数の項目がNGなら、すべてのエラーを返す', () => {
    const errors = errorsOf({
      title: '',
      author: '',
      genre: '',
      publishedYear: '',
    });

    expect(Object.keys(errors).sort()).toEqual([
      'author',
      'genre',
      'publishedYear',
      'title',
    ]);
  });
});

describe('toBookFormValues', () => {
  it('FormData から値を取り出し、ない項目は空文字にする', () => {
    const formData = new FormData();
    formData.set('title', 'はじめてのTypeScript');
    formData.set('publishedYear', '2023');

    expect(toBookFormValues(formData)).toEqual({
      title: 'はじめてのTypeScript',
      author: '',
      genre: '',
      publishedYear: '2023',
      memo: '',
    });
  });
});
