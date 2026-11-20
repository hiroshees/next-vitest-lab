import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { NavLink } from '@/components/NavLink/NavLink';

const meta = {
  component: NavLink,
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/',
      },
    },
  },
  args: {
    href: '/',
    children: 'ホーム',
  },
  // こういうことだろう
  render: () => (
    <nav aria-label="メインナビゲーション">
      <ul>
        <li>
          <NavLink href="/">ホーム</NavLink>
        </li>
        <li>
          <NavLink href="/products">商品</NavLink>
        </li>
        <li>
          <NavLink href="/contact">お問い合わせ</NavLink>
        </li>
      </ul>
    </nav>
  ),
} satisfies Meta<typeof NavLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HomeActive: Story = {
  name: 'ホーム（/）',
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/',
      },
    },
  },
  play: async ({ canvas }) => {
    const homeLink = canvas.getByRole('link', { name: 'ホーム' });
    const productsLink = canvas.getByRole('link', { name: '商品' });
    const contactLink = canvas.getByRole('link', { name: 'お問い合わせ' });

    // これもあたりまえのことをやっているだけかも
    await expect(homeLink).toHaveAttribute('aria-current', 'page');
    await expect(productsLink).not.toHaveAttribute('aria-current');
    await expect(contactLink).not.toHaveAttribute('aria-current');
  },
};

export const ProductDetailActive: Story = {
  name: '商品詳細（/products/1）',
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/products/1',
      },
    },
  },
  play: async ({ canvas }) => {
    const homeLink = canvas.getByRole('link', { name: 'ホーム' });
    const productsLink = canvas.getByRole('link', { name: '商品' });
    const contactLink = canvas.getByRole('link', { name: 'お問い合わせ' });

    await expect(productsLink).toHaveAttribute('aria-current', 'page');
    await expect(homeLink).not.toHaveAttribute('aria-current');
    await expect(contactLink).not.toHaveAttribute('aria-current');
  },
};
