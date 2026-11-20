import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { getRouter } from '@storybook/nextjs-vite/navigation.mock';
import { expect } from 'storybook/test';
import { ProductSearch } from '@/components/ProductSearch/ProductSearch';

const meta = {
  component: ProductSearch,
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/products',
      },
    },
  },
} satisfies Meta<typeof ProductSearch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const WithKeyword: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/products',
        query: { q: 'sneaker' },
      },
    },
  },
};

export const SubmitKeepsOtherQueries: Story = {
  tags: ['!dev'],
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/products',
        query: { category: 'shoes', page: '3' },
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(
      canvas.getByRole('searchbox', { name: '商品を検索' }),
      'sneaker',
    );
    await userEvent.click(canvas.getByRole('button', { name: '検索' }));

    await expect(getRouter().push).toHaveBeenCalledWith(
      '/products?category=shoes&q=sneaker',
    );
  },
};
