import { describe, it, expect } from 'vitest';
import {
  createPageHref,
  parseCurrentPage,
} from '@/components/Pagination/pageUtils';

describe('parseCurrentPage', () => {
  it.each([
    { label: 'page がない', raw: null, expected: 1 },
    { label: '空文字', raw: '', expected: 1 },
    { label: '範囲内', raw: '2', expected: 2 },
    { label: '最初のページ', raw: '1', expected: 1 },
    { label: '最後のページ（ちょうど）', raw: '3', expected: 3 },
    { label: '最後のページを超える', raw: '4', expected: 3 },
    { label: '大きく超える', raw: '99', expected: 3 },
    { label: '0', raw: '0', expected: 1 },
    { label: '負の数', raw: '-2', expected: 1 },
    { label: '数字でない', raw: 'abc', expected: 1 },
    { label: '数字で始まる文字列', raw: '1abc', expected: 1 },
    { label: '小数', raw: '1.5', expected: 1 },
  ])(
    '$label（$raw）のとき $expected ページ目（全3ページ）',
    ({ raw, expected }) => {
      expect(parseCurrentPage(raw, 3)).toBe(expected);
    },
  );
});

describe('createPageHref', () => {
  it('クエリがないときは、page だけを付ける', () => {
    expect(createPageHref('/items', '', 2)).toBe('/items?page=2');
  });

  it('既存の page は、新しい値に置き換える', () => {
    expect(createPageHref('/items', 'page=5', 2)).toBe('/items?page=2');
  });

  it('ほかのクエリは、順番もそのまま残す', () => {
    expect(createPageHref('/search', 'q=orange&sort=price&page=2', 3)).toBe(
      '/search?q=orange&sort=price&page=3',
    );
  });

  it('日本語のクエリは、エンコードされたまま残す', () => {
    const query = new URLSearchParams({ q: 'オレンジ' }).toString();

    expect(createPageHref('/search', query, 2)).toBe(`/search?${query}&page=2`);
  });
});
