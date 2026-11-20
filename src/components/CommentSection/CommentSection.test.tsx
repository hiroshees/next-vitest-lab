import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommentSection } from './CommentSection';

function setup() {
  const user = userEvent.setup();
  render(<CommentSection />);
  const textarea = screen.getByRole('textbox', { name: 'コメント' });
  const submitButton = screen.getByRole('button', { name: '送信' });

  async function postComment(text: string) {
    await user.type(textarea, text);
    await user.click(submitButton);
  }

  function getComments() {
    return screen.queryAllByRole('listitem').map((li) => li.textContent);
  }

  return { postComment, getComments };
}

describe('CommentSection', () => {
  it('初期状態ではコメント一覧が空', () => {
    const { getComments } = setup();

    expect(getComments()).toEqual([]);
  });

  it('送信したコメントが一覧に追加される', async () => {
    const { postComment, getComments } = setup();

    await postComment('最初のコメントです');

    expect(getComments()).toEqual(['最初のコメントです']);
  });

  it('続けて送信すると、送信した順に一覧に並ぶ', async () => {
    const { postComment, getComments } = setup();

    await postComment('one');
    await postComment('two');

    expect(getComments()).toEqual(['one', 'two']);
  });
});
