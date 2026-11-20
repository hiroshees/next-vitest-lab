import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { AuthProvider, type AuthUser } from '../contexts/AuthContext';
import { ThemeProvider, type Theme } from './../contexts/ThemeContext';

type ProviderOptions = {
  user?: AuthUser | null;
  theme?: Theme;
};

export function renderWithProviders(
  ui: ReactElement,
  {
    user = null,
    theme = 'light',
    ...options
  }: ProviderOptions & Omit<RenderOptions, 'wrapper'> = {},
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <ThemeProvider initialTheme={theme}>
        <AuthProvider initialUser={user}>{children}</AuthProvider>
      </ThemeProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}
