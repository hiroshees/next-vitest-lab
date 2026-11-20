import type { ContactInput } from './validateContact';

export async function saveInquiry(input: ContactInput): Promise<void> {
  // 実際には DB への保存や、外部 API の呼び出しになる
  console.log('保存しました', input);
}
