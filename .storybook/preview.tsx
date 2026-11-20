import type { Preview } from '@storybook/nextjs-vite';
import { mswLoader } from 'msw-storybook-addon/csf3';
import { AuthProvider, type AuthUser } from '@/contexts/AuthContext';
import { ThemeProvider, type Theme } from '@/contexts/ThemeContext';
import { handlers } from '@/mocks/handlers';
import '../src/app/globals.css';

const preview: Preview = {
  loaders: [mswLoader()],
  decorators: [
    (Story, context) => {
      const user = (context.parameters.user ?? null) as AuthUser | null;
      const theme = (context.parameters.theme ?? 'light') as Theme;

      return (
        <AuthProvider initialUser={user}>
          <ThemeProvider initialTheme={theme}>
            <Story />
          </ThemeProvider>
        </AuthProvider>
      );
    },
  ],
  parameters: {
    nextjs: {
      appDirectory: true,
    },
    msw: handlers,
    a11y: {
      test: 'error',
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
