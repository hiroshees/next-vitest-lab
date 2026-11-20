import { describe, it, expect } from 'vitest';
import {
  validateContact,
  type ContactInput,
} from '@/features/contact/validateContact';

const valid: ContactInput = {
  name: '山田太郎',
  email: 'yamada@example.com',
  message: '商品について質問があります。',
  inquiry: '商品について',
};

describe('validateContact', () => {
  it('すべて正しく入力されていれば、エラーはない', () => {
    expect(validateContact(valid)).toEqual({});
  });

  it.each([
    {
      label: 'お名前が空',
      input: { name: '' },
      field: 'name',
      message: 'お名前を入力してください',
    },
    {
      label: 'お名前が空白だけ',
      input: { name: '  ' },
      field: 'name',
      message: 'お名前を入力してください',
    },
    {
      label: 'お名前が51文字',
      input: { name: 'あ'.repeat(51) },
      field: 'name',
      message: 'お名前は50文字以内で入力してください',
    },
    {
      label: 'メールが空',
      input: { email: '' },
      field: 'email',
      message: 'メールアドレスを入力してください',
    },
    {
      label: 'メールに@がない',
      input: { email: 'yamada.example.com' },
      field: 'email',
      message: 'メールアドレスの形式が正しくありません',
    },
    {
      label: '内容が空',
      input: { message: '' },
      field: 'message',
      message: 'お問い合わせ内容を入力してください',
    },
    {
      label: '内容が1001文字',
      input: { message: 'あ'.repeat(1001) },
      field: 'message',
      message: 'お問い合わせ内容は1000文字以内で入力してください',
    },
    {
      label: 'お問い合わせ種類が空',
      input: { inquiry: '' },
      field: 'inquiry',
      message: 'お問い合わせ種類を入力してください',
    },
    {
      label: 'お問い合わせ種類が空白だけ',
      input: { inquiry: '   ' },
      field: 'inquiry',
      message: 'お問い合わせ種類を入力してください',
    },
    {
      label: 'お問い合わせ種類が選択肢外',
      input: { inquiry: '返品について' },
      field: 'inquiry',
      message: 'お問い合わせ種類が間違えています',
    },
  ])('$label のときはエラー', ({ input, field, message }) => {
    expect(validateContact({ ...valid, ...input })).toEqual({
      [field]: message,
    });
  });

  it.each([
    { label: 'お名前がちょうど50文字', input: { name: 'あ'.repeat(50) } },
    { label: '内容がちょうど1000文字', input: { message: 'あ'.repeat(1000) } },
    {
      label: 'お問い合わせ種類が「注文について」',
      input: { inquiry: '注文について' },
    },
    { label: 'お問い合わせ種類が「その他」', input: { inquiry: 'その他' } },
    {
      label: '前後に空白があっても有効な値',
      input: { name: '  山田太郎  ', inquiry: ' 商品について ' },
    },
  ])('$label のときはエラーにならない', ({ input }) => {
    expect(validateContact({ ...valid, ...input })).toEqual({});
  });
});
