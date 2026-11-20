import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { http, HttpResponse, delay } from 'msw';
import { API_BASE, type Weather } from '../../api/weather';
import { WeatherCard } from './WeatherCard';

const meta = {
  component: WeatherCard,
  args: {
    city: '東京',
  },
} satisfies Meta<typeof WeatherCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {};

export const Tokyo: Story = {
  args: {
    city: '東京',
  },
};

export const Osaka: Story = {
  args: {
    city: '大阪',
  },
};

export const Okinawa: Story = {
  args: {
    city: '沖縄',
  },
};

export const BelowZero: Story = {
  args: { city: '札幌' },
  parameters: {
    msw: [
      http.get(`${API_BASE}/weather`, () =>
        HttpResponse.json({ condition: '雪', temperature: -5 }),
      ),
    ],
  },
};

export const CityNotFound: Story = {
  args: {
    city: '福岡',
  },
};

export const Empty: Story = {
  parameters: {
    msw: [http.get(`${API_BASE}/weather`, () => HttpResponse.json([]))],
  },
};

export const Loading: Story = {
  parameters: {
    msw: [
      http.get(`${API_BASE}/weather`, async () => {
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
        `${API_BASE}/weather`,
        () => new HttpResponse(null, { status: 500 }),
      ),
    ],
  },
};
