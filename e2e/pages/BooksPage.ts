import type { Locator, Page } from '@playwright/test';

export class BooksPage {
  readonly heading: Locator;
  readonly table: Locator;
  readonly count: Locator;
  readonly newLink: Locator;
  readonly flash: Locator;
  readonly dialog: Locator;
  readonly yesButton: Locator;
  readonly noButton: Locator;
  readonly backdrop: Locator;

  constructor(readonly page: Page) {
    this.heading = page.getByRole('heading', { name: '書籍一覧', level: 1 });
    this.table = page.getByRole('table', { name: '書籍一覧' });
    this.count = page.getByText(/^全\d+件$/);
    this.newLink = page.getByRole('link', { name: '新規登録' });
    this.flash = page.getByRole('main').getByRole('status');
    this.dialog = page.getByRole('dialog', { name: '書籍の削除' });
    this.yesButton = this.dialog.getByRole('button', { name: 'はい' });
    this.noButton = this.dialog.getByRole('button', { name: 'いいえ' });
    this.backdrop = page.getByTestId('dialog-backdrop');
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

  deleteButton(title: string): Locator {
    return this.row(title).getByRole('button', { name: '削除' });
  }

  /** 背景をクリックする（中央はモーダル本体に隠れているので、左上の隅をクリックする） */
  async clickBackdrop() {
    await this.backdrop.click({ position: { x: 10, y: 10 } });
  }
}
