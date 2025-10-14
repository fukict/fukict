import { createFlux } from '@fukict/flux';

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

export const userStore = createFlux({
  state: {
    user: null,
    settings: {
      theme: 'light',
      language: 'en',
      notifications: true,
    },
    isLoading: false,
  } as UserState,

  actions: flux => ({
    async login(email: string) {
      flux.setState({ isLoading: true });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      flux.setState({
        user: {
          name: email.split('@')[0],
          email,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        },
        isLoading: false,
      });
    },

    logout() {
      flux.setState({ user: null });
    },

    updateSettings(settings: Partial<UserSettings>) {
      const state = flux.getState();
      flux.setState({
        settings: { ...state.settings, ...settings },
      });
    },

    updateProfile(user: Partial<User>) {
      const state = flux.getState();
      if (!state.user) return;

      flux.setState({
        user: { ...state.user, ...user },
      });
    },
  }),
});
