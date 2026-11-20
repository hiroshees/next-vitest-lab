import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Pagination } from './Pagination';
import { expect, within } from 'storybook/test';

const meta = {
  component: Pagination,
  args: {
    totalPages: 5,
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/products',
      },
    },
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstPage: Story = {
  name: '1ページ目（pageなし）',
};

function parseHref(link: HTMLElement) {
  return new URL(link.getAttribute('href') ?? '', 'http://localhost');
}

export const MiddlePage: Story = {
  name: '途中のページ（page=3, q=sneaker）',
  parameters: {
    nextjs: { navigation: { query: { page: '3', q: 'sneaker' } } },
  },
  play: async ({ canvas }) => {
    const nav = within(
      canvas.getByRole('navigation', { name: 'ページネーション' }),
    );

    const prev = parseHref(nav.getByRole('link', { name: '前へ' }));
    await expect(prev.pathname).toBe('/products');
    await expect(prev.searchParams.getAll('page')).toEqual(['2']);
    await expect(prev.searchParams.get('q')).toBe('sneaker');

    const next = parseHref(nav.getByRole('link', { name: '次へ' }));
    await expect(next.pathname).toBe('/products');
    await expect(next.searchParams.getAll('page')).toEqual(['4']);
    await expect(next.searchParams.get('q')).toBe('sneaker');
  },
};

export const LastPage: Story = {
  name: '最後のページ',
  parameters: {
    nextjs: { navigation: { query: { page: '5' } } },
  },
};

export const SinglePage: Story = {
  name: '全1ページ',
  args: { totalPages: 1 },
};
