import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn } from 'storybook/test';
import { BookForm } from './BookForm';
import type { BookFormState } from './validateBook';

const meta = {
  component: BookForm,
  args: {
    action: fn(async (): Promise<BookFormState> => ({ status: 'idle' })),
    submitLabel: '登録する',
  },
} satisfies Meta<typeof BookForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const New: Story = {};

export const Edit: Story = {
  args: {
    submitLabel: '更新する',
    initialValues: {
      title: 'チームで進める仕事術',
      author: '佐藤花子',
      genre: 'ビジネス',
      publishedYear: '2021',
      memo: '読書会で使用',
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('textbox', { name: 'タイトル' })).toHaveValue(
      'チームで進める仕事術',
    );
    await expect(
      canvas.getByRole('combobox', { name: 'ジャンル' }),
    ).toHaveValue('ビジネス');
  },
};

/** BOOK-N02 BOOK-N03 何も入力せずに送信したとき */
export const WithErrors: Story = {
  args: {
    action: fn(
      async (): Promise<BookFormState> => ({
        status: 'error',
        errors: {
          title: 'タイトルを入力してください',
          author: '著者を入力してください',
          genre: 'ジャンルを選択してください',
          publishedYear: '出版年を入力してください',
        },
        values: {
          title: '',
          author: '',
          genre: '',
          publishedYear: '',
          memo: 'メモだけ入力',
        },
      }),
    ),
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '登録する' }));

    const title = canvas.getByRole('textbox', { name: 'タイトル' });
    await expect(
      await canvas.findByText('タイトルを入力してください'),
    ).toBeVisible();
    await expect(title).toHaveAttribute('aria-invalid', 'true');
    await expect(title).toHaveAccessibleDescription(
      'タイトルを入力してください',
    );
    await expect(canvas.getByRole('textbox', { name: 'メモ' })).toHaveValue(
      'メモだけ入力',
    );
  },
};

// 送信中のストーリーで使う「終わらない処理」を、後片付けで終わらせるための入れ物
let finishSubmitting = () => {};

/** BOOK-N04 送信中はボタンが押せない */
export const Submitting: Story = {
  args: {
    action: fn(() => {
      const { promise, resolve } = Promise.withResolvers<BookFormState>();
      finishSubmitting = () => resolve({ status: 'idle' });
      return promise;
    }),
  },
  beforeEach: () => {
    // 戻り値の関数は、ストーリーを離れるときに呼ばれる
    return () => finishSubmitting();
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '登録する' }));
    await expect(
      await canvas.findByRole('button', { name: '登録する' }),
    ).toBeDisabled();
  },
};
