import { Flux } from './Flux';
import type {
  CreateFluxConfig,
  FluxListener,
  FluxSelector,
  FluxStore,
  Unsubscribe,
} from './types';

/**
 * Factory function to create Flux Store
 *
 * @param config Configuration object
 * @returns Flux Store object
 *
 * @example
 * ```typescript
 * const counterStore = createFlux({
 *   state: { count: 0 },
 *   actions: (flux) => ({
 *     increment() {
 *       const state = flux.getState();
 *       flux.setState({ count: state.count + 1 });
 *     }
 *   })
 * });
 *
 * // Usage
 * counterStore.actions.increment();
 * counterStore.subscribe((state) => console.log(state.count));
 * ```
 */
export function createFlux<T, A = {}>(
  config: CreateFluxConfig<T, A>,
): FluxStore<T, A> {
  // Create Flux instance
  const flux = new Flux<T>(config.state);

  // Create Actions (if provided)
  const actions = (config.actions ? config.actions(flux) : {}) as A;

  // Return unified interface
  return {
    flux,
    actions,

    // Shortcut methods: delegate to flux instance
    getState: () => flux.getState(),
    setState: newState => flux.setState(newState),

    // subscribe method overload
    subscribe: ((
      selectorOrListener: FluxSelector<T, any> | FluxListener<T>,
      listener?: FluxListener<any>,
    ): Unsubscribe => {
      if (listener) {
        // Selector subscription
        return flux.subscribe(
          selectorOrListener as FluxSelector<T, any>,
          listener,
        );
      } else {
        // Normal subscription
        return flux.subscribe(selectorOrListener as FluxListener<T>);
      }
    }) as any,
  };
}
