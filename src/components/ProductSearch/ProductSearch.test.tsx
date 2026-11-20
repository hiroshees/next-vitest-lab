import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  usePathname,
  useRouter,
  useSearchParams,
  type ReadonlyURLSearchParams,
} from 'next/navigation';
import { ProductSearch } from '@/components/ProductSearch/ProductSearch';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
  useSearchParams: vi.fn(),
}));

function setup({ pathname = '/products', query = '' } = {}) {
  const push = vi.fn();
  vi.mocked(useRouter).mockReturnValue({
    push,
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  });
  vi.mocked(usePathname).mockReturnValue(pathname);
  vi.mocked(useSearchParams).mockReturnValue(
    new URLSearchParams(query) as unknown as ReadonlyURLSearchParams,
  );

  const user = userEvent.setup();
  render(<ProductSearch />);
  const input = screen.getByRole('searchbox', { name: '商品を検索' });
  const button = screen.getByRole('button', { name: '検索' });

  return { user, push, input, button };
}

describe('ProductSearch', () => {
  it('URL の q の値が、最初から入力欄に入っている', () => {
    const { input } = setup({ query: 'q=sneaker' });

    expect(input).toHaveValue('sneaker');
  });

  it('検索すると、q を付けた URL に移動する', async () => {
    const { user, push, input, button } = setup();

    await user.type(input, 'sneaker');
    await user.click(button);

    expect(push).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith('/products?q=sneaker');
  });

  it('ほかのクエリは残し、page はリセットする', async () => {
    const { user, push, input, button } = setup({
      query: 'category=shoes&page=3',
    });

    await user.type(input, 'sneaker');
    await user.click(button);

    expect(push).toHaveBeenCalledWith('/products?category=shoes&q=sneaker');
  });

  it('空で検索すると、q を外した URL に移動する', async () => {
    const { user, push, input, button } = setup({
      query: 'q=sneaker&category=shoes',
    });

    await user.clear(input);
    await user.click(button);

    expect(push).toHaveBeenCalledWith('/products?category=shoes');
  });

  it('日本語のキーワードは、エンコードして URL に入れる', async () => {
    const { user, push, input, button } = setup();

    await user.type(input, 'スニーカー');
    await user.click(button);

    expect(push).toHaveBeenCalledWith(
      `/products?${new URLSearchParams({ q: 'スニーカー' })}`,
    );
  });
});
