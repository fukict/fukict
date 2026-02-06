import type { DevToolsMessage, MessageSource } from '~/types';

/**
 * Create a message with standard structure
 */
export function createMessage<T extends DevToolsMessage>(
  type: T['type'],
  source: MessageSource,
  payload: Omit<T, 'type' | 'source' | 'timestamp'>,
): T {
  return {
    type,
    source,
    timestamp: Date.now(),
    ...payload,
  } as T;
}

/**
 * Validate message structure
 */
export function isValidMessage(message: any): message is DevToolsMessage {
  return (
    message &&
    typeof message === 'object' &&
    typeof message.type === 'string' &&
    typeof message.source === 'string'
  );
}

/**
 * Sanitize error for transmission
 */
export function sanitizeError(error: any): { message: string; stack?: string } {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    message: String(error),
  };
}
