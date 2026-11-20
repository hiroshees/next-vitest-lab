import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactForm } from '@/features/contact/ContactForm';
import type { ContactState } from '@/features/contact/validateContact';

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
    inquiry?: string;
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
    if (values.inquiry)
      await user.selectOptions(
        screen.getByRole('combobox', { name: 'お問い合わせの種類' }),
        values.inquiry,
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
      inquiry: '商品について',
    });

    expect(action).toHaveBeenCalledTimes(1);
    const formData = action.mock.calls[0][1];
    expect(formData.get('name')).toBe('山田');
    expect(formData.get('email')).toBe('yamada@example.com');
    expect(formData.get('message')).toBe('質問です');
    expect(formData.get('inquiry')).toBe('商品について');
  });

  it('成功すると、受け付けた旨が表示され、フォームは消える', async () => {
    const action = vi.fn<Action>().mockResolvedValue({ status: 'success' });
    const { fillAndSubmit } = setup(action);

    await fillAndSubmit({
      name: '山田',
      email: 'yamada@example.com',
      message: '質問です',
      inquiry: '商品について',
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
      values: {
        name: '山田',
        email: 'invalid',
        message: '質問です',
        inquiry: '注文について',
      },
    });
    const { fillAndSubmit } = setup(action);

    await fillAndSubmit({
      name: '山田',
      email: 'invalid',
      message: '質問です',
      inquiry: '注文について',
    });

    const email = await screen.findByRole('textbox', {
      name: 'メールアドレス',
      description: 'メールアドレスの形式が正しくありません',
    });
    expect(email).toBeInvalid();
    expect(email).toHaveValue('invalid');

    const inquirySelect = screen.getByRole('combobox', {
      name: 'お問い合わせの種類',
    });
    expect(inquirySelect).toHaveValue('注文について');
    expect(inquirySelect).not.toBeInvalid();

    expect(screen.getByRole('textbox', { name: 'お名前' })).toHaveValue('山田');
    expect(screen.getByRole('textbox', { name: 'お名前' })).not.toBeInvalid();
  });

  it('お問い合わせの種類にエラーが返ると、combobox にエラーメッセージと aria-invalid が付く', async () => {
    const action = vi.fn<Action>().mockResolvedValue({
      status: 'error',
      errors: { inquiry: 'お問い合わせ種類を入力してください' },
      values: {
        name: '山田',
        email: 'yamada@example.com',
        message: '質問です',
        inquiry: '',
      },
    });
    const { fillAndSubmit } = setup(action);

    await fillAndSubmit({
      name: '山田',
      email: 'yamada@example.com',
      message: '質問です',
    });

    const inquirySelect = await screen.findByRole('combobox', {
      name: 'お問い合わせの種類',
      description: 'お問い合わせ種類を入力してください',
    });
    expect(inquirySelect).toBeInvalid();
    expect(inquirySelect).toHaveValue('');
  });

  it('フォーム全体のエラーが返ると、アラートとして表示される', async () => {
    const action = vi.fn<Action>().mockResolvedValue({
      status: 'error',
      errors: { form: '送信に失敗しました。時間をおいて再度お試しください。' },
      values: {
        name: '山田',
        email: 'yamada@example.com',
        message: '質問です',
        inquiry: 'その他',
      },
    });
    const { fillAndSubmit } = setup(action);

    await fillAndSubmit({
      name: '山田',
      email: 'yamada@example.com',
      message: '質問です',
      inquiry: 'その他',
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
      inquiry: '商品について',
    });

    expect(
      await screen.findByRole('button', { name: '送信中…' }),
    ).toBeDisabled();

    pending.resolve({ status: 'success' });
    expect(await screen.findByRole('status')).toBeInTheDocument();
  });

  it('エラーが2回続いても、お問い合わせの種類の選択は残る', async () => {
    const errorState: ContactState = {
      status: 'error',
      errors: { email: 'メールアドレスの形式が正しくありません' },
      values: {
        name: '山田',
        email: 'invalid',
        message: '質問です',
        inquiry: '注文について',
      },
    };
    const action = vi.fn<Action>().mockResolvedValue(errorState);
    const user = userEvent.setup();
    render(<ContactForm action={action} />);

    // 1回目
    await user.type(screen.getByRole('textbox', { name: 'お名前' }), '山田');
    await user.type(
      screen.getByRole('textbox', { name: 'メールアドレス' }),
      'invalid',
    );
    await user.type(
      screen.getByRole('textbox', { name: 'お問い合わせ内容' }),
      '質問です',
    );
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'お問い合わせの種類' }),
      '注文について',
    );
    await user.click(screen.getByRole('button', { name: '送信' }));
    await screen.findByText('メールアドレスの形式が正しくありません');

    // 2回目（何も変えずにもう一度送信）
    await user.click(screen.getByRole('button', { name: '送信' }));

    await vi.waitFor(() => expect(action).toHaveBeenCalledTimes(2));
    expect(
      screen.getByRole('combobox', { name: 'お問い合わせの種類' }),
    ).toHaveValue('注文について');
  });
});
