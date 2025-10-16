import type {
  FluxInstance,
  FluxListener,
  FluxSelector,
  Unsubscribe,
} from './types';

/**
 * Subscription item interface (internal use)
 */
interface Subscription<T, S = T> {
  listener: FluxListener<S>;
  selector?: FluxSelector<T, S>;
  lastValue?: S;
}

/**
 * Flux state management class
 *
 * Responsibilities:
 * 1. State storage
 * 2. Subscription management
 * 3. State reading
 * 4. State update interface (called by external Actions)
 */
export class Flux<T> implements FluxInstance<T> {
  /**
   * Current state (internal storage)
   */
  private internalState: T;

  /**
   * State proxy (readonly, returned to external)
   */
  private stateProxy: T;

  /**
   * Subscription list
   */
  private subscriptions: Set<Subscription<T, any>> = new Set();

  /**
   * Constructor
   * @param initialState Initial state
   */
  constructor(initialState: T) {
    this.internalState = initialState;
    this.stateProxy = this.createReadonlyProxy(initialState);
  }

  /**
   * Create readonly proxy
   */
  private createReadonlyProxy(state: T): T {
    return new Proxy(state as object, {
      get(target, prop, receiver) {
        const value = Reflect.get(target, prop, receiver) as unknown;

        // If value is an object, wrap it in readonly proxy too
        if (value !== null && typeof value === 'object') {
          return new Proxy(value as object, {
            get: (t, p, r) => Reflect.get(t, p, r) as unknown,
            set: () => {
              if (process.env.NODE_ENV !== 'production') {
                console.warn(
                  '[Flux] Direct state mutation is not allowed. Please use setState() method.',
                );
              }
              return false;
            },
            deleteProperty: () => {
              if (process.env.NODE_ENV !== 'production') {
                console.warn(
                  '[Flux] Direct state mutation is not allowed. Please use setState() method.',
                );
              }
              return false;
            },
          });
        }

        return value;
      },
      set: () => {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(
            '[Flux] Direct state mutation is not allowed. Please use setState() method.',
          );
        }
        return false;
      },
      deleteProperty: () => {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(
            '[Flux] Direct state mutation is not allowed. Please use setState() method.',
          );
        }
        return false;
      },
    }) as T;
  }

  /**
   * Get current state snapshot (readonly proxy)
   */
  getState(): T {
    return this.stateProxy;
  }

  /**
   * Update state
   * @param newState New state (full replacement or partial update)
   */
  setState(newState: Partial<T> | T): void {
    // Determine if it's a full replacement or partial update
    if (this.isPartialUpdate(newState)) {
      // Partial update: shallow merge
      this.internalState = { ...this.internalState, ...newState };
    } else {
      // Full replacement
      this.internalState = newState as T;
    }

    // Update proxy
    this.stateProxy = this.createReadonlyProxy(this.internalState);

    // Notify all subscribers
    this.notify();
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: FluxListener<T>): Unsubscribe;
  subscribe<S>(
    selector: FluxSelector<T, S>,
    listener: FluxListener<S>,
  ): Unsubscribe;
  subscribe<S>(
    selectorOrListener: FluxSelector<T, S> | FluxListener<T>,
    listener?: FluxListener<S>,
  ): Unsubscribe {
    let subscription: Subscription<T, any>;

    // Determine if it's a normal subscription or selector subscription
    if (listener) {
      // Selector subscription
      const selector = selectorOrListener as FluxSelector<T, S>;
      const initialValue = selector(this.internalState);

      subscription = {
        listener,
        selector,
        lastValue: initialValue,
      };
    } else {
      // Normal subscription
      subscription = {
        listener: selectorOrListener as FluxListener<T>,
      };
    }

    // Add to subscription list
    this.subscriptions.add(subscription);

    // Return unsubscribe function
    return () => {
      this.subscriptions.delete(subscription);
    };
  }

  /**
   * Notify all subscribers
   */
  private notify(): void {
    for (const subscription of this.subscriptions) {
      if (subscription.selector) {
        // Selector subscription: compare old and new values
        const newValue: unknown = subscription.selector(this.internalState);
        if (!this.shallowEqual(subscription.lastValue, newValue)) {
          subscription.lastValue = newValue;
          subscription.listener(newValue);
        }
      } else {
        // Normal subscription: notify directly (pass proxy)
        subscription.listener(this.stateProxy);
      }
    }
  }

  /**
   * Determine if it's a partial update
   */
  private isPartialUpdate(newState: Partial<T> | T): newState is Partial<T> {
    // Simple heuristic:
    // If newState has fewer keys than current state, consider it a partial update
    const newKeys = Object.keys(newState as object);
    const stateKeys = Object.keys(this.internalState as object);
    return newKeys.length < stateKeys.length;
  }

  /**
   * Shallow compare two values for equality
   */
  private shallowEqual<S>(a?: S, b?: S): boolean {
    // Primitive type comparison
    if (Object.is(a, b)) {
      return true;
    }

    // null/undefined comparison
    if (a == null || b == null) {
      return false;
    }

    // Object shallow comparison
    if (typeof a === 'object' && typeof b === 'object') {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);

      if (keysA.length !== keysB.length) {
        return false;
      }

      for (const key of keysA) {
        if (
          !Object.is(
            (a as Record<string, unknown>)[key],
            (b as Record<string, unknown>)[key],
          )
        ) {
          return false;
        }
      }

      return true;
    }

    return false;
  }
}
