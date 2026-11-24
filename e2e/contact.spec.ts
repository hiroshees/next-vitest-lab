import { test, expect } from '@playwright/test';

test.describe('お問い合わせ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
  });

  test('正しく入力して送信すると、受け付けた旨が表示される', async ({
    page,
  }) => {
    await page.getByRole('textbox', { name: 'お名前' }).fill('山田太郎');
    await page
      .getByRole('textbox', { name: 'メールアドレス' })
      .fill('yamada@example.com');
    await page
      .getByRole('textbox', { name: 'お問い合わせ内容' })
      .fill('商品について質問があります。');
    await page
      .getByRole('combobox', { name: 'お問い合わせの種類' })
      .selectOption('商品について');
    await page.getByRole('button', { name: '送信' }).click();

    await expect(page.getByRole('status')).toHaveText(
      'お問い合わせを受け付けました。',
    );
    await expect(page.getByRole('button', { name: '送信' })).toBeHidden();
  });

  test('メールアドレスの形式が誤っていると、エラーが表示され、入力した値は残る', async ({
    page,
  }) => {
    await page.getByRole('textbox', { name: 'お名前' }).fill('山田太郎');
    await page.getByRole('textbox', { name: 'メールアドレス' }).fill('invalid');
    await page
      .getByRole('textbox', { name: 'お問い合わせ内容' })
      .fill('質問です');
    await page
      .getByRole('combobox', { name: 'お問い合わせの種類' })
      .selectOption('注文について');
    await page.getByRole('button', { name: '送信' }).click();

    const email = page.getByRole('textbox', { name: 'メールアドレス' });
    await expect(email).toHaveAccessibleDescription(
      'メールアドレスの形式が正しくありません',
    );
    await expect(email).toHaveAttribute('aria-invalid', 'true');
    await expect(email).toHaveValue('invalid');
    await expect(page.getByRole('textbox', { name: 'お名前' })).toHaveValue(
      '山田太郎',
    );
    await expect(
      page.getByRole('combobox', { name: 'お問い合わせの種類' }),
    ).toHaveValue('注文について');
  });
});
