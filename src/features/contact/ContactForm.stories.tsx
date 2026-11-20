import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn } from 'storybook/test';
import { ContactForm } from './ContactForm';
import type { ContactState } from './validateContact';

const meta = {
  component: ContactForm,
  args: {
    action: fn(async (): Promise<ContactState> => ({ status: 'success' })),
  },
} satisfies Meta<typeof ContactForm>;

export default meta;
type Story = StoryObj<typeof meta>;
type PlayContext = Parameters<NonNullable<Story['play']>>[0];

async function fillAndSubmit({ canvas, userEvent }: PlayContext) {
  await userEvent.type(canvas.getByRole('textbox', { name: 'お名前' }), '山田');
  await userEvent.type(
    canvas.getByRole('textbox', { name: 'メールアドレス' }),
    'invalid',
  );
  await userEvent.type(
    canvas.getByRole('textbox', { name: 'お問い合わせ内容' }),
    '質問です',
  );
  await userEvent.selectOptions(
    canvas.getByRole('combobox', { name: 'お問い合わせの種類' }),
    '注文について',
  );
  await userEvent.click(canvas.getByRole('button', { name: '送信' }));
}

export const Empty: Story = {
  name: '未入力',
};

export const FieldErrors: Story = {
  name: '入力エラー',
  args: {
    action: fn(
      async (): Promise<ContactState> => ({
        status: 'error',
        errors: { email: 'メールアドレスの形式が正しくありません' },
        values: {
          name: '山田',
          email: 'invalid',
          message: '質問です',
          inquiry: '注文について',
        },
      }),
    ),
  },
  play: async (context) => {
    await fillAndSubmit(context);

    const email = await context.canvas.findByRole('textbox', {
      name: 'メールアドレス',
      description: 'メールアドレスの形式が正しくありません',
    });
    await expect(email).toBeInvalid();
    await expect(email).toHaveValue('invalid');
  },
};

export const FormError: Story = {
  name: '送信失敗',
  args: {
    action: fn(
      async (): Promise<ContactState> => ({
        status: 'error',
        errors: {
          form: '送信に失敗しました。時間をおいて再度お試しください。',
        },
        values: {
          name: '山田',
          email: 'invalid',
          message: '質問です',
          inquiry: '注文について',
        },
      }),
    ),
  },
  play: async (context) => {
    await fillAndSubmit(context);

    await expect(await context.canvas.findByRole('alert')).toHaveTextContent(
      '送信に失敗しました',
    );
  },
};

let pendingSubmit: PromiseWithResolvers<ContactState>;

export const Submitting: Story = {
  name: '送信中',
  beforeEach: () => {
    pendingSubmit = Promise.withResolvers<ContactState>();
    // ストーリーを離れるとき（次のストーリーに切り替わるとき）に呼ばれる
    return () => {
      pendingSubmit.resolve({ status: 'idle' });
    };
  },
  args: {
    action: fn(() => pendingSubmit.promise),
  },
  play: async (context) => {
    await fillAndSubmit(context);

    await expect(
      await context.canvas.findByRole('button', { name: '送信中…' }),
    ).toBeDisabled();
  },
};

export const Submitted: Story = {
  name: '送信完了',
  play: async (context) => {
    await fillAndSubmit(context);

    await expect(await context.canvas.findByRole('status')).toHaveTextContent(
      'お問い合わせを受け付けました。',
    );
  },
};
