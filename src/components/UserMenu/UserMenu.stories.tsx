import type { Meta, StoryObj } from '@storybook/react-vite';
import { UserMenu } from './UserMenu';

const meta = {
  component: UserMenu,
} satisfies Meta<typeof UserMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoggedOut: Story = {};

export const LoggedIn: Story = {
  parameters: {
    user: { id: 1, name: '山田' },
  },
};

export const LongUserName: Story = {
  parameters: {
    user: { id: 1, name: '寿限無寿限無五劫の擦り切れ海砂利水魚' },
  },
};
