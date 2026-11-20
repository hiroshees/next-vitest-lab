import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import {
  usePathname,
  useSearchParams,
  type ReadonlyURLSearchParams,
} from 'next/navigation';
import { Pagination } from '@/components/Pagination/Pagination';

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
  useSearchParams: vi.fn(),
}));

function setUrl(pathname: string, query = '') {
  vi.mocked(usePathname).mockReturnValue(pathname);
  vi.mocked(useSearchParams).mockReturnValue(
    new URLSearchParams(query) as unknown as ReadonlyURLSearchParams,
  );
}

function renderPagination(totalPages: number) {
  render(<Pagination totalPages={totalPages} />);
  return within(screen.getByRole('navigation', { name: 'ページネーション' }));
}

function getCurrentPageLinks(nav: ReturnType<typeof renderPagination>) {
  return nav
    .getAllByRole('link')
    .filter((link) => link.getAttribute('aria-current') === 'page');
}

describe('Pagination', () => {
  beforeEach(() => {
    setUrl('/items');
  });

  it('URL に page がないときは1ページ目が現在地で、「前へ」は出ず、「次へ」は2ページ目を指す', () => {
    const nav = renderPagination(5);

    expect(nav.getByRole('link', { name: '1ページ目' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(nav.queryByRole('link', { name: '前へ' })).not.toBeInTheDocument();
    expect(nav.getByRole('link', { name: '次へ' })).toHaveAttribute(
      'href',
      '/items?page=2',
    );
  });

  it('ページ番号のリンクが、1から順番に並ぶ', () => {
    const nav = renderPagination(3);

    const pageLinks = nav
      .getAllByRole('link')
      .map((link) => link.getAttribute('aria-label'))
      .filter((label) => label?.endsWith('ページ目'));
    expect(pageLinks).toEqual(['1ページ目', '2ページ目', '3ページ目']);
  });

  it('途中のページでは、前後のページへのリンクが出て、現在地は1つだけ', () => {
    setUrl('/items', 'page=3');
    const nav = renderPagination(5);

    expect(nav.getByRole('link', { name: '前へ' })).toHaveAttribute(
      'href',
      '/items?page=2',
    );
    expect(nav.getByRole('link', { name: '次へ' })).toHaveAttribute(
      'href',
      '/items?page=4',
    );

    const current = getCurrentPageLinks(nav);
    expect(current).toHaveLength(1);
    expect(current[0]).toHaveAccessibleName('3ページ目');
  });

  it('最後のページでは「次へ」を出さない', () => {
    setUrl('/items', 'page=5');
    const nav = renderPagination(5);

    expect(nav.queryByRole('link', { name: '次へ' })).not.toBeInTheDocument();
    expect(nav.getByRole('link', { name: '5ページ目' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('リンク先は、ほかのクエリを残したまま page だけを変えた URL になる', () => {
    setUrl('/search', 'q=orange&sort=price&page=2');
    const nav = renderPagination(5);

    expect(nav.getByRole('link', { name: '前へ' })).toHaveAttribute(
      'href',
      '/search?q=orange&sort=price&page=1',
    );
    expect(nav.getByRole('link', { name: '3ページ目' })).toHaveAttribute(
      'href',
      '/search?q=orange&sort=price&page=3',
    );
  });

  it('URL の page が不正なときは、1ページ目として扱う（詳しい条件は parseCurrentPage のテスト）', () => {
    setUrl('/items', 'page=abc');
    const nav = renderPagination(3);

    expect(nav.getByRole('link', { name: '1ページ目' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('全1ページのときは「1ページ目」だけが出て、「前へ」「次へ」は出ない', () => {
    const nav = renderPagination(1);

    expect(nav.getAllByRole('link')).toHaveLength(1);
    expect(nav.getByRole('link', { name: '1ページ目' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('全0ページのときは、何も表示しない', () => {
    render(<Pagination totalPages={0} />);

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });
});
