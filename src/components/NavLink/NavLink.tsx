'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

type Props = {
  href: string;
  children: ReactNode;
};

export function NavLink({ href, children }: Props) {
  const pathname = usePathname();
  const isActive =
    pathname === href || (href !== '/' && pathname.startsWith(`${href}/`));

  return (
    <Link href={href} aria-current={isActive ? 'page' : undefined}>
      {children}
    </Link>
  );
}
