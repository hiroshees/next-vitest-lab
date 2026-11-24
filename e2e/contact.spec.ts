import { test, expect } from '@playwright/test';
import { ContactPage } from './pages/ContactPage';

test.describe('お問い合わせ', () => {
  let contactPage: ContactPage;

  const validContact = {
    name: '山田太郎',
    email: 'yamada@example.com',
    message: '質問です',
    inquiry: '注文について',
  };

  test.beforeEach(async ({ page }) => {
    contactPage = new ContactPage(page);
  });

  test('正しく入力して送信すると、受け付けた旨が表示される', async () => {
    await contactPage.goto();

    await contactPage.fill(validContact);
    await contactPage.submit();

    await expect(contactPage.successMessage).toHaveText(
      'お問い合わせを受け付けました。',
    );
    await expect(contactPage.submitButton).toBeHidden();
  });

  test('メールアドレスの形式が誤っていると、エラーが表示され、入力した値は残る', async () => {
    await contactPage.goto();

    await contactPage.fill({ ...validContact, email: 'invalid' });

    await contactPage.submit();

    const email = contactPage.emailInput;
    await expect(email).toHaveAccessibleDescription(
      'メールアドレスの形式が正しくありません',
    );
    await expect(email).toHaveAttribute('aria-invalid', 'true');
    await expect(email).toHaveValue('invalid');

    await expect(contactPage.nameInput).toHaveValue('山田太郎');
    await expect(contactPage.inquirySelect).toHaveValue('注文について');
  });
});
