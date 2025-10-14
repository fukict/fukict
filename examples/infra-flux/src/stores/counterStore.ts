import { createFlux } from '@fukict/flux';

/**
 * Counter Store
 *
 * Demonstrates basic flux usage with simple state management
 */

interface CounterState {
  count: number;
  step: number;
}

export const counterStore = createFlux({
  state: {
    count: 0,
    step: 1,
  } as CounterState,

  actions: flux => {
    const actions = {
      increment() {
        const state = flux.getState();
        flux.setState({ count: state.count + state.step });
      },

      decrement() {
        const state = flux.getState();
        flux.setState({ count: state.count - state.step });
      },

      reset() {
        flux.setState({ count: 0 });
      },

      setStep(step: number) {
        flux.setState({ step });
      },

      incrementAsync() {
        setTimeout(() => {
          actions.increment();
        }, 1000);
      },
    };

    return actions;
  },
});
