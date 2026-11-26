import type { Locator, Page } from '@playwright/test';

export class BooksPage {
  readonly heading: Locator;
  readonly table: Locator;
  readonly count: Locator;
  readonly newLink: Locator;
  readonly flash: Locator;

  constructor(readonly page: Page) {
    this.heading = page.getByRole('heading', { name: '書籍一覧', level: 1 });
    this.table = page.getByRole('table', { name: '書籍一覧' });
    this.count = page.getByText(/^全\d+件$/);
    this.newLink = page.getByRole('link', { name: '新規登録' });
    this.flash = page.getByRole('main').getByRole('status');
  }

  async goto(query = '') {
    await this.page.goto(`/books${query}`);
  }

  /** データ行（見出し行を除く） */
  rows(): Locator {
    return this.table.locator('tbody tr');
  }

  /** 各行のタイトル列 */
  titleCells(): Locator {
    return this.rows().locator('td:first-child');
  }

  /** タイトルを含む行 */
  row(title: string): Locator {
    return this.rows().filter({ hasText: title });
  }

  editLink(title: string): Locator {
    return this.row(title).getByRole('link', { name: '編集' });
  }
}
