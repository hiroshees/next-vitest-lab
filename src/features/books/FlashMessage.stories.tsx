import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { FlashMessage } from './FlashMessage';

const meta = {
  component: FlashMessage,
  args: { message: '登録しました' },
} satisfies Meta<typeof FlashMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Created: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('status')).toHaveTextContent('登録しました');
  },
};

export const Deleted: Story = {
  args: { message: '削除しました' },
};

export const NoMessage: Story = {
  args: { message: undefined },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('status')).not.toBeInTheDocument();
  },
};
