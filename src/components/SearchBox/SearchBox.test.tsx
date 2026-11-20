import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { SearchBox } from './SearchBox';

function setup() {
  const user = userEvent.setup();
  const onSearch = vi.fn<(keyword: string) => void>();
  render(<SearchBox onSearch={onSearch} />);
  const input = screen.getByRole('searchbox', { name: '検索キーワード' });
  const button = screen.getByRole('button', { name: '検索' });
  return { user, onSearch, input, button };
}

const submitBy = {
  ボタン: async (user: UserEvent, button: HTMLElement) => {
    await user.click(button);
  },
  Enter: async (user: UserEvent) => {
    await user.keyboard('{Enter}');
  },
};

describe.each(Object.entries(submitBy))('%s で送信', (_, submit) => {
  it('入力したキーワードで onSearch が1回呼ばれ、入力欄の文字は残る', async () => {
    const { user, input, button, onSearch } = setup();

    await user.type(input, 'hello');
    await submit(user, button);

    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith('hello');
    expect(input).toHaveValue('hello');
  });

  it('前後の空白は取り除いて渡し、入力欄の表示はそのまま', async () => {
    const { user, input, button, onSearch } = setup();

    await user.type(input, '  hello  ');
    await submit(user, button);

    expect(onSearch).toHaveBeenCalledWith('hello');
    expect(input).toHaveValue('  hello  ');
  });

  it.each([
    { label: '空', text: '' },
    { label: '半角スペースだけ', text: '   ' },
    { label: '全角スペースだけ', text: '　　' },
  ])('$label のときは呼ばれない', async ({ text }) => {
    const { user, input, button, onSearch } = setup();

    await user.click(input);
    if (text) await user.paste(text);
    await submit(user, button);

    expect(onSearch).not.toHaveBeenCalled();
  });
});
