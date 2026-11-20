import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { NavLink } from './NavLink';

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));

describe('NavLink', () => {
  it.each([
    { pathname: '/', href: '/', active: true },
    { pathname: '/products', href: '/', active: false },
    { pathname: '/products', href: '/products', active: true },
    { pathname: '/products/1', href: '/products', active: true },
    { pathname: '/products-sale', href: '/products', active: false },
  ])(
    '$pathname にいるとき、$href へのリンクの現在地表示は $active',
    ({ pathname, href, active }) => {
      vi.mocked(usePathname).mockReturnValue(pathname);
      render(<NavLink href={href}>リンク</NavLink>);

      const link = screen.getByRole('link', { name: 'リンク' });
      if (active) {
        expect(link).toHaveAttribute('aria-current', 'page');
      } else {
        expect(link).not.toHaveAttribute('aria-current');
      }
    },
  );
});
