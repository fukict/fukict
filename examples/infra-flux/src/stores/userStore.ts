import { type ActionContext, defineStore } from '@fukict/flux';

/**
 * User Store
 *
 * Demonstrates flux usage with nested objects and selector subscriptions
 */

interface User {
  name: string;
  email: string;
  avatar: string;
}

interface UserSettings {
  theme: 'light' | 'dark';
  language: 'en' | 'zh';
  notifications: boolean;
}

interface UserState {
  user: User | null;
  settings: UserSettings;
  isLoading: boolean;
}

export const userStore = defineStore({
  scope: 'user',
  state: {
    user: null,
    settings: {
      theme: 'light',
      language: 'en',
      notifications: true,
    },
    isLoading: false,
  } as UserState,

  actions: {
    logout: () => ({ user: null }),

    updateSettings: (state: UserState, settings: Partial<UserSettings>) => ({
      settings: { ...state.settings, ...settings },
    }),

    updateProfile: (state: UserState, user: Partial<User>) => {
      if (!state.user) return {};
      return { user: { ...state.user, ...user } };
    },
  },

  asyncActions: {
    async login(ctx: ActionContext<UserState>, email: string) {
      ctx.setState({ isLoading: true });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      ctx.setState({
        user: {
          name: email.split('@')[0],
          email,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        },
        isLoading: false,
      });
    },
  },
});
