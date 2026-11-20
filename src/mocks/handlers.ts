import { http, HttpResponse } from 'msw';
import { API_BASE, type User } from '../api/users';
import { type Weathers } from '../api/weather';

export const users: User[] = [
  { id: 1, name: '山田' },
  { id: 2, name: '佐藤' },
];

export const weathers: Weathers = [
  { city: '東京', data: { temperature: 22, condition: '晴れ' } },
  { city: '大阪', data: { temperature: 10, condition: '雨' } },
  { city: '沖縄', data: { temperature: 30, condition: '晴れ' } },
];

export const handlers = [
  http.get(`${API_BASE}/users`, () => {
    return HttpResponse.json(users);
  }),
  http.get(`${API_BASE}/weather`, ({ request }) => {
    const city = new URL(request.url).searchParams.get('city');
    const cityData = city
      ? weathers.find((item) => item.city === city)
      : undefined;

    if (!cityData) {
      return HttpResponse.json({ message: 'not found' }, { status: 404 });
    }

    return HttpResponse.json(cityData.data);
  }),
];
