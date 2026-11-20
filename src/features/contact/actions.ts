'use server';

import { revalidatePath } from 'next/cache';
import { saveInquiry } from './repository';
import { validateContact, type ContactState } from './validateContact';

export async function submitContact(
  _prevState: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const values = {
    name: String(formData.get('name') ?? ''),
    email: String(formData.get('email') ?? ''),
    message: String(formData.get('message') ?? ''),
  };

  const errors = validateContact(values);
  if (Object.keys(errors).length > 0) {
    return { status: 'error', errors, values };
  }

  try {
    await saveInquiry({
      name: values.name.trim(),
      email: values.email.trim(),
      message: values.message.trim(),
    });
  } catch {
    return {
      status: 'error',
      errors: { form: '送信に失敗しました。時間をおいて再度お試しください。' },
      values,
    };
  }

  revalidatePath('/admin/inquiries');
  return { status: 'success' };
}
