/**
 * Flux listener function type
 */
export type FluxListener<T> = (state: T) => void;

/**
 * Selector function type
 */
export type FluxSelector<T, S> = (state: T) => S;

/**
 * Unsubscribe function type
 */
export type Unsubscribe = () => void;

/**
 * createFlux configuration type
 */
export interface CreateFluxConfig<T, A> {
  /**
   * Initial state
   */
  state: T;

  /**
   * Actions definition (optional)
   */
  actions?: (flux: FluxInstance<T>) => A;
}

/**
 * Flux instance interface (internal use)
 */
export interface FluxInstance<T> {
  getState(): T;
  setState(newState: Partial<T> | T): void;
  subscribe(listener: FluxListener<T>): Unsubscribe;
  subscribe<S>(
    selector: FluxSelector<T, S>,
    listener: FluxListener<S>,
  ): Unsubscribe;
}

/**
 * createFlux return type
 */
export interface FluxStore<T, A> {
  /**
   * Flux instance
   */
  flux: FluxInstance<T>;

  /**
   * Actions object
   */
  actions: A;

  /**
   * Get current state (shortcut method)
   */
  getState(): T;

  /**
   * Update state (shortcut method)
   */
  setState(newState: Partial<T> | T): void;

  /**
   * Subscribe to state changes (shortcut method)
   */
  subscribe(listener: FluxListener<T>): Unsubscribe;
  subscribe<S>(
    selector: FluxSelector<T, S>,
    listener: FluxListener<S>,
  ): Unsubscribe;
}
