import type { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse, delay } from 'msw';
import { expect } from 'storybook/test';
import { API_BASE } from '../../api/users';
import { UserList } from './UserList';
import { handlers } from '../../mocks/handlers';

const meta = {
  component: UserList,
} satisfies Meta<typeof UserList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {};

export const Empty: Story = {
  parameters: {
    msw: [http.get(`${API_BASE}/users`, () => HttpResponse.json([]))],
  },
};

export const Loading: Story = {
  parameters: {
    msw: [
      http.get(`${API_BASE}/users`, async () => {
        await delay('infinite');
        return HttpResponse.json([]);
      }),
    ],
  },
};

export const ServerError: Story = {
  parameters: {
    msw: [
      http.get(
        `${API_BASE}/users`,
        () => new HttpResponse(null, { status: 500 }),
      ),
    ],
  },
};

export const RetryAfterError: Story = {
  parameters: {
    msw: [
      http.get(
        `${API_BASE}/users`,
        () => new HttpResponse(null, { status: 500 }),
        {
          once: true,
        },
      ),
      ...handlers,
    ],
  },
  play: async ({ canvas, userEvent }) => {
    const retryButton = await canvas.findByRole('button', { name: '再試行' });

    await userEvent.click(retryButton);

    const list = await canvas.findByRole('list', { name: 'ユーザー一覧' });
    await expect(list).toHaveTextContent('山田');
    await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
  },
};
