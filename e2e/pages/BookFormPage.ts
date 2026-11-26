import type { Locator, Page } from '@playwright/test';

export type BookInput = {
  title?: string;
  author?: string;
  genre?: string;
  publishedYear?: string;
  memo?: string;
};

export class BookFormPage {
  readonly heading: Locator;
  readonly title: Locator;
  readonly author: Locator;
  readonly genre: Locator;
  readonly publishedYear: Locator;
  readonly memo: Locator;
  readonly cancelLink: Locator;
  readonly formError: Locator;

  constructor(readonly page: Page) {
    this.heading = page.getByRole('heading', { level: 1 });
    this.title = page.getByRole('textbox', { name: 'タイトル' });
    this.author = page.getByRole('textbox', { name: '著者' });
    this.genre = page.getByRole('combobox', { name: 'ジャンル' });
    this.publishedYear = page.getByRole('textbox', { name: '出版年' });
    this.memo = page.getByRole('textbox', { name: 'メモ' });
    this.cancelLink = page.getByRole('link', { name: 'キャンセル' });
    this.formError = page.getByRole('main').getByRole('alert');
  }

  async gotoNew() {
    await this.page.goto('/books/new');
  }

  async gotoEdit(id: string) {
    await this.page.goto(`/books/${id}/edit`);
  }

  /** 指定した項目だけ入力する（今の値は消してから入力） */
  async fill(input: BookInput) {
    if (input.title !== undefined) await this.title.fill(input.title);
    if (input.author !== undefined) await this.author.fill(input.author);
    if (input.genre !== undefined) await this.genre.selectOption(input.genre);
    if (input.publishedYear !== undefined)
      await this.publishedYear.fill(input.publishedYear);
    if (input.memo !== undefined) await this.memo.fill(input.memo);
  }

  submitButton(label: '登録する' | '更新する'): Locator {
    return this.page.getByRole('button', { name: label });
  }
}
