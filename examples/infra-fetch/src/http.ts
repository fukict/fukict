import { createFetch } from '@fukict/fetch';

export const http = createFetch({
  baseURL: '/api',
  timeout: 10000,
});
