# @fukict/fetch

Axios-style HTTP client built on native fetch, zero dependencies.

## Features

- **Axios-Compatible API**: `get` / `post` / `put` / `patch` / `delete` / `head` / `options`
- **Interceptors**: Request and response interceptors with `use()` / `eject()`
- **Timeout**: Automatic request cancellation via AbortController
- **Typed Errors**: `FetchError` with error codes (`ERR_NETWORK`, `ERR_TIMEOUT`, `ERR_BAD_REQUEST`, ...)
- **Streaming**: `responseType: 'stream'` returns raw `ReadableStream`
- **Download Progress**: `onDownloadProgress` callback for tracking transfer progress
- **Zero Dependencies**: Built entirely on native `fetch` API
- **Type-Safe**: Full TypeScript support with generic response typing

## Installation

```bash
pnpm add @fukict/fetch
```

## Quick Start

```typescript
import { createFetch } from '@fukict/fetch';

const http = createFetch({
  baseURL: '/api',
  timeout: 10000,
});

// GET
const { data } = await http.get<User[]>('/users');

// POST
const { data: user } = await http.post<User>('/users', {
  name: 'Alice',
  email: 'alice@example.com',
});
```

## Interceptors

### Request Interceptor

```typescript
http.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
  }
  return config;
});
```

### Response Interceptor

```typescript
http.interceptors.response.use(
  response => response,
  error => {
    if (FetchError.isFetchError(error) && error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);
```

### Remove Interceptor

```typescript
const id = http.interceptors.request.use(config => {
  // ...
  return config;
});

// Remove later
http.interceptors.request.eject(id);
```

## API Reference

### createFetch(config?)

Creates an HTTP client instance (equivalent to `axios.create()`).

```typescript
const http = createFetch({
  baseURL: 'https://api.example.com',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Request Config

| Property             | Type                                                      | Description                                     |
| -------------------- | --------------------------------------------------------- | ----------------------------------------------- |
| `baseURL`            | `string`                                                  | Base URL prepended to relative paths            |
| `url`                | `string`                                                  | Request URL                                     |
| `method`             | `string`                                                  | HTTP method                                     |
| `headers`            | `Record<string, string>`                                  | Request headers                                 |
| `params`             | `Record<string, string \| number \| boolean>`             | URL query parameters                            |
| `data`               | `unknown`                                                 | Request body (auto JSON serialized for objects) |
| `timeout`            | `number`                                                  | Timeout in milliseconds                         |
| `responseType`       | `'json' \| 'text' \| 'blob' \| 'arraybuffer' \| 'stream'` | Response parsing strategy                       |
| `onDownloadProgress` | `(progress: ProgressEvent) => void`                       | Download progress callback                      |
| `signal`             | `AbortSignal`                                             | External abort signal                           |

### Response Structure

```typescript
interface FetchResponse<T> {
  data: T; // Parsed response body
  status: number; // HTTP status code
  statusText: string; // HTTP status text
  headers: Headers; // Response headers
  config: FetchRequestConfig; // Request config used
}
```

### Instance Methods

```typescript
http.get<T>(url, config?)
http.post<T>(url, data?, config?)
http.put<T>(url, data?, config?)
http.patch<T>(url, data?, config?)
http.delete<T>(url, config?)
http.head<T>(url, config?)
http.options<T>(url, config?)
http.request<T>(config)
```

## Error Handling

```typescript
import { FetchError } from '@fukict/fetch';

try {
  await http.get('/users');
} catch (error) {
  if (FetchError.isFetchError(error)) {
    switch (error.code) {
      case 'ERR_NETWORK':
        console.error('Network error:', error.message);
        break;
      case 'ERR_TIMEOUT':
        console.error('Request timed out');
        break;
      case 'ERR_BAD_REQUEST':
        console.error('Client error:', error.response?.status);
        break;
      case 'ERR_BAD_RESPONSE':
        console.error('Server error:', error.response?.status);
        break;
      case 'ERR_CANCELED':
        console.error('Request was canceled');
        break;
    }
  }
}
```

### FetchError Properties

| Property   | Type                         | Description                        |
| ---------- | ---------------------------- | ---------------------------------- |
| `message`  | `string`                     | Error message                      |
| `code`     | `FetchErrorCode`             | Error code                         |
| `config`   | `FetchRequestConfig`         | Original request config            |
| `response` | `FetchResponse \| undefined` | Response (present for HTTP errors) |

## Streaming

### ReadableStream Response

```typescript
const stream = await http.get<ReadableStream>('/events', {
  responseType: 'stream',
});

const reader = stream.data.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  console.log(decoder.decode(value));
}
```

### Download with Progress

```typescript
const { data } = await http.get<Blob>('/files/report.pdf', {
  responseType: 'blob',
  onDownloadProgress({ loaded, total, percent }) {
    console.log(`${percent}% (${loaded}/${total} bytes)`);
  },
});

// Create download link
const url = URL.createObjectURL(data);
const a = document.createElement('a');
a.href = url;
a.download = 'report.pdf';
a.click();
```

## File Upload

```typescript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('name', 'avatar');

const { data } = await http.post<{ url: string }>('/upload', formData);
// Content-Type is automatically set to multipart/form-data by the browser
```

## Request Cancellation

```typescript
const controller = new AbortController();

// Cancel after user action
cancelButton.onclick = () => controller.abort();

try {
  const { data } = await http.get('/slow-endpoint', {
    signal: controller.signal,
  });
} catch (error) {
  if (FetchError.isFetchError(error) && error.code === 'ERR_CANCELED') {
    console.log('Request was canceled by user');
  }
}
```

## Migration from Axios

| Axios                                     | @fukict/fetch                         |
| ----------------------------------------- | ------------------------------------- |
| `axios.create(config)`                    | `createFetch(config)`                 |
| `instance.get(url, config)`               | `http.get(url, config)`               |
| `instance.post(url, data, config)`        | `http.post(url, data, config)`        |
| `instance.interceptors.request.use(fn)`   | `http.interceptors.request.use(fn)`   |
| `instance.interceptors.request.eject(id)` | `http.interceptors.request.eject(id)` |
| `axios.isAxiosError(error)`               | `FetchError.isFetchError(error)`      |
| `error.response`                          | `error.response`                      |
| `error.config`                            | `error.config`                        |
| `{ cancelToken }`                         | `{ signal: controller.signal }`       |

Key differences:

- Response `headers` is a native `Headers` object instead of a plain object
- `responseType: 'stream'` returns `ReadableStream` (not Node stream)
- No upload progress (native `fetch` limitation), use `FormData` for uploads
- Cancel via standard `AbortController` instead of `CancelToken`

## Related Packages

- [@fukict/basic](../basic) - Core rendering engine
- [@fukict/router](../router) - SPA routing
- [@fukict/i18n](../i18n) - Internationalization

## License

MIT
