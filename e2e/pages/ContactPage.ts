import type { Locator, Page } from '@playwright/test';

export type ContactValues = {
  name?: string;
  email?: string;
  message?: string;
  inquiry?: string;
};

export class ContactPage {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly messageInput: Locator;
  readonly inquirySelect: Locator;
  readonly submitButton: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.getByRole('textbox', { name: 'お名前' });
    this.emailInput = page.getByRole('textbox', { name: 'メールアドレス' });
    this.messageInput = page.getByRole('textbox', { name: 'お問い合わせ内容' });
    this.inquirySelect = page.getByRole('combobox', {
      name: 'お問い合わせの種類',
    });
    this.submitButton = page.getByRole('button', { name: '送信' });
    this.successMessage = page.getByRole('status');
  }

  async goto() {
    await this.page.goto('/contact');
  }

  async fill({ name, email, message, inquiry }: ContactValues) {
    if (name !== undefined) await this.nameInput.fill(name);
    if (email !== undefined) await this.emailInput.fill(email);
    if (message !== undefined) await this.messageInput.fill(message);
    if (inquiry !== undefined) await this.inquirySelect.selectOption(inquiry);
  }

  async submit() {
    await this.submitButton.click();
  }
}
