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
    await contactPage.goto();
  });

  test('正しく入力して送信すると、受け付けた旨が表示される', async ({
    page,
  }, testInfo) => {
    await test.step('お問い合わせ画面を開く', async () => {
      await expect(contactPage.submitButton).toBeVisible();
      await testInfo.attach('01_入力前', {
        body: await page.screenshot(),
        contentType: 'image/png',
      });
    });

    await test.step('すべての項目を正しく入力する', async () => {
      await contactPage.fill(validContact);
      await testInfo.attach('02_入力後', {
        body: await page.screenshot(),
        contentType: 'image/png',
      });
    });

    await test.step('送信する', async () => {
      await contactPage.submit();
    });

    await test.step('受け付けた旨が表示され、フォームが消える', async () => {
      await expect(contactPage.successMessage).toHaveText(
        'お問い合わせを受け付けました。',
      );
      await expect(contactPage.submitButton).toBeHidden();
      await testInfo.attach('03_送信後', {
        body: await page.screenshot(),
        contentType: 'image/png',
      });
    });
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
