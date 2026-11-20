import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { Breadcrumbs, type BreadcrumbItem } from './Breadcrumbs';

function renderBreadcrumbs(items: BreadcrumbItem[]) {
  render(<Breadcrumbs items={items} />);
  const nav = screen.getByRole('navigation', { name: 'パンくずリスト' });
  return { nav };
}

describe('Breadcrumbs', () => {
  describe('複数の項目があるとき', () => {
    const items = [
      { label: 'ホーム', href: '/' },
      { label: '商品一覧', href: '/products' },
      { label: '白いスニーカー' },
    ];

    it('項目が順番どおりに並ぶ', () => {
      const { nav } = renderBreadcrumbs(items);

      const labels = within(nav)
        .getAllByRole('listitem')
        .map((li) => li.textContent);
      expect(labels).toEqual(['ホーム', '商品一覧', '白いスニーカー']);
    });

    it('最後以外の項目は、それぞれのページへのリンクになる', () => {
      const { nav } = renderBreadcrumbs(items);

      expect(within(nav).getByRole('link', { name: 'ホーム' })).toHaveAttribute(
        'href',
        '/',
      );
      expect(
        within(nav).getByRole('link', { name: '商品一覧' }),
      ).toHaveAttribute('href', '/products');
    });

    it('最後の項目はリンクにならず、aria-current="page" が付く', () => {
      const { nav } = renderBreadcrumbs(items);

      expect(
        within(nav).queryByRole('link', { name: '白いスニーカー' }),
      ).not.toBeInTheDocument();
      expect(within(nav).getByText('白いスニーカー')).toHaveAttribute(
        'aria-current',
        'page',
      );
    });

    it('最後以外の項目には aria-current が付かない', () => {
      const { nav } = renderBreadcrumbs(items);

      expect(
        within(nav).getByRole('link', { name: 'ホーム' }),
      ).not.toHaveAttribute('aria-current');
      expect(
        within(nav).getByRole('link', { name: '商品一覧' }),
      ).not.toHaveAttribute('aria-current');
    });
  });

  it('項目が1つだけのときは、リンクにならず aria-current="page" が付く', () => {
    const { nav } = renderBreadcrumbs([{ label: 'ホーム', href: '/' }]);

    expect(within(nav).queryByRole('link')).not.toBeInTheDocument();
    expect(within(nav).getByText('ホーム')).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('途中の項目に href がないときは、リンクにも現在地にもならない', () => {
    const { nav } = renderBreadcrumbs([
      { label: 'ホーム', href: '/' },
      { label: 'カテゴリ' },
      { label: '白いスニーカー' },
    ]);

    expect(
      within(nav).queryByRole('link', { name: 'カテゴリ' }),
    ).not.toBeInTheDocument();
    expect(within(nav).getByText('カテゴリ')).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('項目が0件のときは、何も表示しない', () => {
    render(<Breadcrumbs items={[]} />);

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });
});
