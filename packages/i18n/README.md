# @fukict/i18n

Type-safe internationalization library for Fukict framework with reactive language switching.

## Features

- **Type-Safe**: Full TypeScript support with autocomplete for translation keys
- **Reactive**: Automatic component updates on language change
- **Nested Keys**: Support for deeply nested translation objects
- **Interpolation**: Variable substitution in translations
- **Pluralization**: Built-in plural form support
- **Fallback**: Automatic fallback to default language
- **Lightweight**: Minimal overhead with zero dependencies
- **Dynamic Loading**: Lazy load translations for code splitting

## Installation

```bash
pnpm add @fukict/i18n
```

## Quick Start

### Define Translations

```typescript
// locales/en.ts
export default {
  common: {
    welcome: 'Welcome',
    hello: 'Hello {name}!',
    logout: 'Logout',
  },
  user: {
    profile: 'User Profile',
    settings: 'Settings',
  },
  validation: {
    required: 'This field is required',
    email: 'Invalid email address',
  },
} as const;

// locales/zh.ts
export default {
  common: {
    welcome: '欢迎',
    hello: '你好 {name}!',
    logout: '退出登录',
  },
  user: {
    profile: '用户资料',
    settings: '设置',
  },
  validation: {
    required: '此字段为必填项',
    email: '邮箱地址无效',
  },
} as const;
```

### Create i18n Instance

```typescript
import { createI18n } from '@fukict/i18n';

import en from './locales/en';
import zh from './locales/zh';

const i18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en,
    zh,
  },
});

export default i18n;
```

### Use in Components

```tsx
import { Fukict } from '@fukict/basic';

import i18n from './i18n';

class Greeting extends Fukict {
  private unsubscribe?: () => void;

  mounted() {
    // Subscribe to language changes
    this.unsubscribe = i18n.subscribe(() => {
      this.update(this.props);
    });
  }

  beforeUnmount() {
    this.unsubscribe?.();
  }

  render() {
    return (
      <div>
        <h1>{i18n.t('common.welcome')}</h1>
        <p>{i18n.t('common.hello', { name: 'World' })}</p>
        <button on:click={() => i18n.setLocale('zh')}>中文</button>
        <button on:click={() => i18n.setLocale('en')}>English</button>
      </div>
    );
  }
}
```

## Core API

### createI18n(options)

Creates i18n instance with configuration.

```typescript
import { createI18n } from '@fukict/i18n';

const i18n = createI18n({
  locale: 'en', // Current locale
  fallbackLocale: 'en', // Fallback locale
  messages: {
    en: enMessages,
    zh: zhMessages,
    ja: jaMessages,
  },
});
```

### i18n.t(key, values?)

Translates a key with optional interpolation values.

```typescript
// Simple translation
i18n.t('common.welcome'); // "Welcome"

// With interpolation
i18n.t('common.hello', { name: 'Alice' }); // "Hello Alice!"

// Nested keys
i18n.t('user.profile'); // "User Profile"
```

### i18n.setLocale(locale)

Changes current locale and notifies subscribers.

```typescript
i18n.setLocale('zh'); // Switch to Chinese
i18n.setLocale('en'); // Switch to English
```

### i18n.getLocale()

Returns current locale.

```typescript
const currentLocale = i18n.getLocale(); // "en"
```

### i18n.subscribe(listener)

Subscribes to locale changes.

```typescript
const unsubscribe = i18n.subscribe(() => {
  console.log('Locale changed to:', i18n.getLocale());
});

// Clean up
unsubscribe();
```

## Translation Features

### Nested Keys

```typescript
const messages = {
  pages: {
    home: {
      title: 'Home Page',
      subtitle: 'Welcome to our site',
      actions: {
        login: 'Login',
        signup: 'Sign Up',
      },
    },
  },
};

// Access nested keys with dot notation
i18n.t('pages.home.title'); // "Home Page"
i18n.t('pages.home.actions.login'); // "Login"
```

### Interpolation

```typescript
const messages = {
  greeting: 'Hello {name}, you have {count} messages',
  profile: 'User {user} from {country}',
};

i18n.t('greeting', { name: 'Alice', count: 5 });
// "Hello Alice, you have 5 messages"

i18n.t('profile', { user: 'Bob', country: 'USA' });
// "User Bob from USA"
```

### Pluralization

```typescript
const messages = {
  items: {
    zero: 'No items',
    one: 'One item',
    other: '{count} items',
  },
};

// Use plural helper (if implemented)
i18n.t('items', { count: 0 }); // "No items"
i18n.t('items', { count: 1 }); // "One item"
i18n.t('items', { count: 5 }); // "5 items"
```

### Fallback

```typescript
const i18n = createI18n({
  locale: 'fr',
  fallbackLocale: 'en',
  messages: {
    en: {
      greeting: 'Hello',
      goodbye: 'Goodbye',
    },
    fr: {
      greeting: 'Bonjour',
      // 'goodbye' missing in French
    },
  },
});

i18n.t('greeting'); // "Bonjour" (from French)
i18n.t('goodbye'); // "Goodbye" (fallback to English)
```

## Advanced Usage

### Language Switcher Component

```tsx
class LanguageSwitcher extends Fukict {
  private unsubscribe?: () => void;
  private languages = [
    { code: 'en', name: 'English' },
    { code: 'zh', name: '中文' },
    { code: 'ja', name: '日本語' },
  ];

  mounted() {
    this.unsubscribe = i18n.subscribe(() => {
      this.update(this.props);
    });
  }

  beforeUnmount() {
    this.unsubscribe?.();
  }

  render() {
    const currentLocale = i18n.getLocale();

    return (
      <div class="language-switcher">
        {this.languages.map(lang => (
          <button
            key={lang.code}
            class={currentLocale === lang.code ? 'active' : ''}
            on:click={() => i18n.setLocale(lang.code)}
          >
            {lang.name}
          </button>
        ))}
      </div>
    );
  }
}
```

### Dynamic Translation Loading

```typescript
// Lazy load translation files
const loadLocale = async (locale: string) => {
  const messages = await import(`./locales/${locale}.js`);
  i18n.setMessages(locale, messages.default);
  i18n.setLocale(locale);
};

// Usage in component
class App extends Fukict {
  changeLanguage = async (locale: string) => {
    await loadLocale(locale);
  };

  render() {
    return (
      <button on:click={() => this.changeLanguage('zh')}>
        Load Chinese
      </button>
    );
  }
}
```

### Type-Safe Translation Keys

```typescript
// i18n.ts with typed keys
import type { TranslationKeys } from './locales/en';

// locales/en.ts
const en = {
  common: {
    welcome: 'Welcome',
    hello: 'Hello {name}',
  },
  user: {
    profile: 'Profile',
  },
} as const;

export type TranslationKeys = typeof en;
export default en;

const i18n = createI18n<TranslationKeys>({
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en,
    zh,
  },
});

// Now get autocomplete for keys!
i18n.t('common.welcome'); // ✅ Autocomplete works
i18n.t('invalid.key'); // ❌ TypeScript error
```

### Formatting Utilities

```typescript
// Date formatting
const formatDate = (date: Date, locale: string) => {
  return new Intl.DateTimeFormat(locale).format(date);
};

// Number formatting
const formatNumber = (num: number, locale: string) => {
  return new Intl.NumberFormat(locale).format(num);
};

// Currency formatting
const formatCurrency = (amount: number, locale: string, currency: string) => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
};

// Usage in component
class Invoice extends Fukict {
  render() {
    const locale = i18n.getLocale();
    const date = new Date();
    const total = 1234.56;

    return (
      <div>
        <p>Date: {formatDate(date, locale)}</p>
        <p>Total: {formatCurrency(total, locale, 'USD')}</p>
      </div>
    );
  }
}
```

### Integration with Router

```tsx
import { RouteComponent } from '@fukict/router';

import i18n from './i18n';

class LocalizedPage extends RouteComponent {
  private unsubscribeI18n?: () => void;

  mounted() {
    // Subscribe to both router and i18n
    this.unsubscribeI18n = i18n.subscribe(() => {
      this.update(this.props);
    });

    // Get locale from URL query
    const { lang } = this.query;
    if (lang) {
      i18n.setLocale(lang);
    }
  }

  beforeUnmount() {
    this.unsubscribeI18n?.();
  }

  changeLang = (locale: string) => {
    i18n.setLocale(locale);
    // Update URL with new locale
    this.updateQuery({ lang: locale });
  };

  render() {
    return (
      <div>
        <h1>{i18n.t('pages.home.title')}</h1>
        <button on:click={() => this.changeLang('en')}>EN</button>
        <button on:click={() => this.changeLang('zh')}>中文</button>
      </div>
    );
  }
}
```

## Best Practices

### 1. Organize Translations by Feature

```typescript
// ✅ Good: Feature-based structure
const messages = {
  auth: {
    login: 'Login',
    logout: 'Logout',
    register: 'Register',
  },
  products: {
    list: 'Product List',
    detail: 'Product Detail',
    addToCart: 'Add to Cart',
  },
  cart: {
    title: 'Shopping Cart',
    empty: 'Your cart is empty',
  },
};

// ❌ Bad: Flat structure
const messages = {
  login: 'Login',
  logout: 'Logout',
  productList: 'Product List',
  cartTitle: 'Shopping Cart',
};
```

### 2. Subscribe at App Level

```tsx
// ✅ Good: Subscribe at root, read in children
class App extends Fukict {
  private unsubscribe?: () => void;

  mounted() {
    this.unsubscribe = i18n.subscribe(() => {
      this.update(this.props);
    });
  }

  beforeUnmount() {
    this.unsubscribe?.();
  }

  render() {
    return (
      <div>
        <Header /> {/* Just reads i18n.t() */}
        <Content /> {/* Just reads i18n.t() */}
      </div>
    );
  }
}
```

### 3. Use const assertions

```typescript
// ✅ Good: Use 'as const' for type inference
export default {
  greeting: 'Hello',
  farewell: 'Goodbye',
} as const;

// ❌ Bad: No type inference
export default {
  greeting: 'Hello',
  farewell: 'Goodbye',
};
```

### 4. Keep Translations Consistent

```typescript
// ✅ Good: Same structure across locales
// en.ts
const en = {
  user: {
    profile: 'Profile',
    settings: 'Settings',
  },
};

// zh.ts
const zh = {
  user: {
    profile: '资料',
    settings: '设置',
  },
};

// ❌ Bad: Inconsistent structure
// zh.ts - Missing keys!
const zh = {
  user: {
    profile: '资料',
    // settings missing!
  },
};
```

## Examples

### Simple Example

```tsx
import { Fukict, attach } from '@fukict/basic';
import { createI18n } from '@fukict/i18n';

const i18n = createI18n({
  locale: 'en',
  messages: {
    en: {
      title: 'Hello World',
      greeting: 'Welcome {name}!',
    },
    zh: {
      title: '你好世界',
      greeting: '欢迎 {name}!',
    },
  },
});

class App extends Fukict {
  private unsubscribe?: () => void;

  mounted() {
    this.unsubscribe = i18n.subscribe(() => this.update(this.props));
  }

  beforeUnmount() {
    this.unsubscribe?.();
  }

  render() {
    return (
      <div>
        <h1>{i18n.t('title')}</h1>
        <p>{i18n.t('greeting', { name: 'User' })}</p>
        <button on:click={() => i18n.setLocale('en')}>EN</button>
        <button on:click={() => i18n.setLocale('zh')}>中文</button>
      </div>
    );
  }
}

attach(<App />, document.getElementById('app')!);
```

## Related Packages

- [@fukict/basic](../basic) - Core rendering engine
- [@fukict/router](../router) - SPA routing
- [@fukict/flux](../flux) - State management

## License

MIT
