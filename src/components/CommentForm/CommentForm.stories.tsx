import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn } from 'storybook/test';
import { CommentForm } from './CommentForm';

const meta = {
  component: CommentForm,
  args: {
    onSubmit: fn(),
  },
} satisfies Meta<typeof CommentForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// ① 状態を作るためのplay関数（propsでは作れない状態）
export const OverLimit: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('textbox', { name: 'コメント' }));
    await userEvent.paste('あ'.repeat(141));

    await expect(canvas.getByRole('alert')).toHaveTextContent(
      '140文字以内で入力してください',
    );
    await expect(canvas.getByRole('button', { name: '送信' })).toBeDisabled();
  },
};

// ② 振る舞いを確かめるためのplay関数
export const SubmitsTrimmedComment: Story = {
  play: async ({ canvas, userEvent, args }) => {
    const textarea = canvas.getByRole('textbox', { name: 'コメント' });

    await userEvent.type(textarea, '  こんにちは  ');
    await userEvent.click(canvas.getByRole('button', { name: '送信' }));

    await expect(args.onSubmit).toHaveBeenCalledWith('こんにちは');
    await expect(textarea).toHaveValue('');
  },
};
