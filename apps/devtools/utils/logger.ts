import { CONFIG, LOGGER_PREFIX } from '~/constants';

/** Create namespaced logger */
export function createLogger(namespace: string) {
  return {
    log: (...args: any[]) => {
      if (CONFIG.VERBOSE_LOGGING) {
        console.log(`${LOGGER_PREFIX}[${namespace}]`, ...args);
      }
    },
    warn: (...args: any[]) => {
      console.warn(`${LOGGER_PREFIX}[${namespace}]`, ...args);
    },
    error: (...args: any[]) => {
      console.error(`${LOGGER_PREFIX}[${namespace}]`, ...args);
    },
  };
}
