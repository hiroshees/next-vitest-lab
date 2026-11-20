import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { ProductResults } from './ProductResults';

const meta = {
  component: ProductResults,
  args: {
    keyword: '',
  },
} satisfies Meta<typeof ProductResults>;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = {
  name: 'キーワードなし（全件）',
};

export const Filtered: Story = {
  name: '「スニーカー」で絞り込み',
  args: { keyword: 'スニーカー' },
  play: async ({ canvas }) => {
    const headings = await canvas.findAllByRole('heading', { level: 2 });
    await expect(headings.map((h) => h.textContent)).toEqual([
      '白いスニーカー',
      '赤いスニーカー',
    ]);
  },
};

export const NoMatch: Story = {
  name: '一致なし',
  args: { keyword: '帽子' },
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByText('「帽子」に一致する商品はありません'),
    ).toBeInTheDocument();
  },
};
