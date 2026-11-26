import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { sampleBooks } from '@/test/fixtures/books';
import { BookList } from './BookList';

const meta = {
  component: BookList,
  args: { books: sampleBooks },
} satisfies Meta<typeof BookList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    // 見出し1行＋データ3行
    await expect(canvas.getAllByRole('row')).toHaveLength(4);
    await expect(canvas.getAllByRole('link', { name: '編集' })).toHaveLength(3);
  },
};

export const OneBook: Story = {
  args: { books: [sampleBooks[0]] },
};

/** BOOK-L06 長いタイトルでもレイアウトが崩れないか */
export const LongTitle: Story = {
  args: {
    books: [
      {
        ...sampleBooks[0],
        title:
          'はじめてのTypeScript 〜型安全なWebアプリケーション開発のための実践ガイド〜 第2版 増補改訂',
      },
      ...sampleBooks.slice(1),
    ],
  },
};
