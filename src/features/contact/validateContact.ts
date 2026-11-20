export type ContactInput = {
  name: string;
  email: string;
  message: string;
  inquiry: string;
};

export type ContactErrors = Partial<
  Record<keyof ContactInput | 'form', string>
>;

export const INQUIRY_TYPES = [
  '商品について',
  '注文について',
  'その他',
] as const;
export type InquiryType = (typeof INQUIRY_TYPES)[number];

export type ContactState =
  | { status: 'idle' }
  | { status: 'error'; errors: ContactErrors; values: ContactInput }
  | { status: 'success' };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContact(input: ContactInput): ContactErrors {
  const errors: ContactErrors = {};
  const name = input.name.trim();
  const email = input.email.trim();
  const message = input.message.trim();
  const inquiry = input.inquiry.trim();

  if (!name) {
    errors.name = 'お名前を入力してください';
  } else if (name.length > 50) {
    errors.name = 'お名前は50文字以内で入力してください';
  }

  if (!email) {
    errors.email = 'メールアドレスを入力してください';
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'メールアドレスの形式が正しくありません';
  }

  if (!message) {
    errors.message = 'お問い合わせ内容を入力してください';
  } else if (message.length > 1000) {
    errors.message = 'お問い合わせ内容は1000文字以内で入力してください';
  }

  if (!inquiry) {
    errors.inquiry = 'お問い合わせ種類を入力してください';
  } else if (!(INQUIRY_TYPES as readonly string[]).includes(inquiry)) {
    errors.inquiry = 'お問い合わせ種類が間違えています';
  }

  return errors;
}
