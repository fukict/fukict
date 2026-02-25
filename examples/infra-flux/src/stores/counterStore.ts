import { defineStore } from '@fukict/flux';

/**
 * Counter Store
 *
 * Demonstrates basic flux usage with simple state management
 */

interface CounterState {
  count: number;
  step: number;
}

export const counterStore = defineStore({
  scope: 'counter',
  state: {
    count: 0,
    step: 1,
  } as CounterState,

  actions: {
    increment: state => ({ count: state.count + state.step }),
    decrement: state => ({ count: state.count - state.step }),
    reset: () => ({ count: 0 }),
    setStep: (_state, step: number) => ({ step }),
  },

  asyncActions: {
    async incrementAsync(ctx) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const state = ctx.getState();
      ctx.setState({ count: state.count + state.step });
    },
  },
});
