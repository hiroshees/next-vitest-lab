import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/render';
import { UserMenu } from './UserMenu';

describe('UserMenu', () => {
  describe('ログインしていないとき', () => {
    it('「ログイン」リンクが表示され、ログアウトボタンはない', () => {
      renderWithProviders(<UserMenu />);

      expect(screen.getByRole('link', { name: 'ログイン' })).toHaveAttribute(
        'href',
        '/login',
      );
      expect(
        screen.queryByRole('button', { name: 'ログアウト' }),
      ).not.toBeInTheDocument();
    });
  });

  describe('ログインしているとき', () => {
    it('ユーザー名とログアウトボタンが表示される', () => {
      renderWithProviders(<UserMenu />, { user: { id: 1, name: '山田' } });

      expect(screen.getByText('山田さん')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'ログアウト' }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('link', { name: 'ログイン' }),
      ).not.toBeInTheDocument();
    });

    it('ログアウトすると、「ログイン」リンクに切り替わる', async () => {
      const user = userEvent.setup();
      renderWithProviders(<UserMenu />, { user: { id: 1, name: '山田' } });

      await user.click(screen.getByRole('button', { name: 'ログアウト' }));

      expect(
        screen.getByRole('link', { name: 'ログイン' }),
      ).toBeInTheDocument();
      expect(screen.queryByText('山田さん')).not.toBeInTheDocument();
    });
  });
});
