import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactForm } from './ContactForm';
import type { ContactState } from './validateContact';

type Action = (
  prevState: ContactState,
  formData: FormData,
) => Promise<ContactState>;

function setup(action: Action) {
  const user = userEvent.setup();
  render(<ContactForm action={action} />);

  async function fillAndSubmit(values: {
    name?: string;
    email?: string;
    message?: string;
  }) {
    if (values.name)
      await user.type(
        screen.getByRole('textbox', { name: 'お名前' }),
        values.name,
      );
    if (values.email)
      await user.type(
        screen.getByRole('textbox', { name: 'メールアドレス' }),
        values.email,
      );
    if (values.message)
      await user.type(
        screen.getByRole('textbox', { name: 'お問い合わせ内容' }),
        values.message,
      );
    await user.click(screen.getByRole('button', { name: '送信' }));
  }

  return { fillAndSubmit };
}

describe('ContactForm', () => {
  it('送信すると、入力した値が FormData として action に渡される', async () => {
    const action = vi.fn<Action>().mockResolvedValue({ status: 'success' });
    const { fillAndSubmit } = setup(action);

    await fillAndSubmit({
      name: '山田',
      email: 'yamada@example.com',
      message: '質問です',
    });

    expect(action).toHaveBeenCalledTimes(1);
    const formData = action.mock.calls[0][1];
    expect(formData.get('name')).toBe('山田');
    expect(formData.get('email')).toBe('yamada@example.com');
    expect(formData.get('message')).toBe('質問です');
  });

  it('成功すると、受け付けた旨が表示され、フォームは消える', async () => {
    const action = vi.fn<Action>().mockResolvedValue({ status: 'success' });
    const { fillAndSubmit } = setup(action);

    await fillAndSubmit({
      name: '山田',
      email: 'yamada@example.com',
      message: '質問です',
    });

    expect(await screen.findByRole('status')).toHaveTextContent(
      'お問い合わせを受け付けました。',
    );
    expect(
      screen.queryByRole('button', { name: '送信' }),
    ).not.toBeInTheDocument();
  });

  it('エラーが返ると、該当する欄にエラーが表示され、入力値は残る', async () => {
    const action = vi.fn<Action>().mockResolvedValue({
      status: 'error',
      errors: { email: 'メールアドレスの形式が正しくありません' },
      values: { name: '山田', email: 'invalid', message: '質問です' },
    });
    const { fillAndSubmit } = setup(action);

    await fillAndSubmit({
      name: '山田',
      email: 'invalid',
      message: '質問です',
    });

    const email = await screen.findByRole('textbox', {
      name: 'メールアドレス',
      description: 'メールアドレスの形式が正しくありません',
    });
    expect(email).toBeInvalid();
    expect(email).toHaveValue('invalid');
    expect(screen.getByRole('textbox', { name: 'お名前' })).toHaveValue('山田');
    expect(screen.getByRole('textbox', { name: 'お名前' })).not.toBeInvalid();
  });

  it('フォーム全体のエラーが返ると、アラートとして表示される', async () => {
    const action = vi.fn<Action>().mockResolvedValue({
      status: 'error',
      errors: { form: '送信に失敗しました。時間をおいて再度お試しください。' },
      values: {
        name: '山田',
        email: 'yamada@example.com',
        message: '質問です',
      },
    });
    const { fillAndSubmit } = setup(action);

    await fillAndSubmit({
      name: '山田',
      email: 'yamada@example.com',
      message: '質問です',
    });

    expect(await screen.findByRole('alert')).toHaveTextContent(
      '送信に失敗しました',
    );
  });

  it('送信中は、ボタンが「送信中…」になり押せない', async () => {
    const pending = Promise.withResolvers<ContactState>();
    const action = vi.fn<Action>(() => pending.promise);
    const { fillAndSubmit } = setup(action);

    await fillAndSubmit({
      name: '山田',
      email: 'yamada@example.com',
      message: '質問です',
    });

    expect(
      await screen.findByRole('button', { name: '送信中…' }),
    ).toBeDisabled();

    pending.resolve({ status: 'success' });
    expect(await screen.findByRole('status')).toBeInTheDocument();
  });
});
