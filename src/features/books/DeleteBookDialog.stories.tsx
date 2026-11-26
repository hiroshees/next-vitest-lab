import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn } from 'storybook/test';
import { DeleteBookDialog } from './DeleteBookDialog';

const meta = {
  component: DeleteBookDialog,
  args: {
    book: { id: '2', title: 'チームで進める仕事術' },
    onConfirm: fn(),
    onCancel: fn(),
  },
} satisfies Meta<typeof DeleteBookDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  play: async ({ canvas, args, userEvent }) => {
    const dialog = canvas.getByRole('dialog', { name: '書籍の削除' });
    await expect(dialog).toHaveAccessibleDescription(
      '『チームで進める仕事術』を削除しますか？',
    );
    await expect(canvas.getByRole('button', { name: 'いいえ' })).toHaveFocus();

    await userEvent.click(canvas.getByRole('button', { name: 'はい' }));
    await expect(args.onConfirm).toHaveBeenCalledTimes(1);
  },
};

export const Pending: Story = {
  args: { pending: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'はい' })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: 'いいえ' })).toBeDisabled();
  },
};

export const WithError: Story = {
  args: { error: '対象の書籍が見つかりません' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('alert')).toHaveTextContent(
      '対象の書籍が見つかりません',
    );
  },
};

export const LongTitle: Story = {
  args: {
    book: {
      id: '3',
      title:
        'はじめてのTypeScript 〜型安全なWebアプリケーション開発のための実践ガイド〜 第2版 増補改訂',
    },
  },
};
