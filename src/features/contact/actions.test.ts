// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';
import { revalidatePath } from 'next/cache';
import { saveInquiry } from './repository';
import { submitContact } from './actions';

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('./repository', () => ({
  saveInquiry: vi.fn(),
}));

function toFormData(values: Record<string, string>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }
  return formData;
}

const validValues = {
  name: '  山田太郎  ',
  email: 'yamada@example.com',
  message: '商品について質問があります。',
};

describe('submitContact', () => {
  it('入力が正しければ、前後の空白を除いて保存し、キャッシュを更新して成功を返す', async () => {
    const result = await submitContact(
      { status: 'idle' },
      toFormData(validValues),
    );

    expect(result).toEqual({ status: 'success' });
    expect(saveInquiry).toHaveBeenCalledWith({
      name: '山田太郎',
      email: 'yamada@example.com',
      message: '商品について質問があります。',
    });
    expect(revalidatePath).toHaveBeenCalledWith('/admin/inquiries');
  });

  it('入力に誤りがあれば、保存せず、エラーと入力値を返す', async () => {
    const values = { ...validValues, email: 'invalid' };

    const result = await submitContact({ status: 'idle' }, toFormData(values));

    expect(result).toEqual({
      status: 'error',
      errors: { email: 'メールアドレスの形式が正しくありません' },
      values,
    });
    expect(saveInquiry).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('保存に失敗したら、フォーム全体のエラーを返し、キャッシュは更新しない', async () => {
    vi.mocked(saveInquiry).mockRejectedValueOnce(new Error('DB error'));

    const result = await submitContact(
      { status: 'idle' },
      toFormData(validValues),
    );

    expect(result).toEqual({
      status: 'error',
      errors: { form: '送信に失敗しました。時間をおいて再度お試しください。' },
      values: validValues,
    });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
