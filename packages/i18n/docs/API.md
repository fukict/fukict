# API 文档

@fukict/i18n 的完整 API 参考。

## createI18n

创建 i18n 实例的工厂函数。

### 类型签名

```typescript
function createI18n<Messages extends Record<string, any>>(
  options: I18nOptions<Messages>,
): I18n<Messages>;
```

### 参数

#### I18nOptions<Messages>

```typescript
interface I18nOptions<Messages> {
  /**
   * 默认语言
   */
  defaultLocale: string;

  /**
   * 当前语言（可选，默认使用 defaultLocale）
   */
  locale?: string;

  /**
   * 翻译消息
   */
  messages: Messages;

  /**
   * 缺失翻译时的回退策略
   * - 'key': 返回翻译键本身（默认）
   * - 'fallback': 使用 fallbackLocale
   * - function: 自定义处理函数
   */
  missingHandler?:
    | 'key'
    | 'fallback'
    | ((key: string, locale: string) => string);

  /**
   * 回退语言（当翻译缺失时）
   */
  fallbackLocale?: string;

  /**
   * 懒加载函数（按需加载语言包）
   */
  loadMessages?: (locale: string) => Promise<Messages[keyof Messages]>;
}
```

### 返回值

返回 `I18n<Messages>` 实例。

### 示例

```typescript
import { createI18n } from '@fukict/i18n';

const i18n = createI18n({
  defaultLocale: 'en',
  locale: 'en',
  messages: {
    en: {
      hello: 'Hello',
      welcome: 'Welcome, {name}',
    },
    zh: {
      hello: '你好',
      welcome: '欢迎，{name}',
    },
  },
  fallbackLocale: 'en',
  missingHandler: 'key',
});
```

## I18n 类

i18n 实例的核心类。

### 属性

#### locale

当前语言代码（只读）。

```typescript
readonly locale: string
```

**示例**：

```typescript
console.log(i18n.locale); // 'en'
```

### 方法

#### t()

翻译文本。

```typescript
t(key: TranslationKey<Messages>, params?: Record<string, any>): string
```

**参数**：

- `key`: 翻译键（支持点号路径，如 `'user.profile.name'`）
- `params`: 插值参数（可选）

**返回值**：翻译后的文本字符串

**示例**：

```typescript
// 简单翻译
i18n.t('hello'); // 'Hello'

// 变量插值
i18n.t('welcome', { name: 'Alice' }); // 'Welcome, Alice'

// 嵌套路径
i18n.t('user.profile.name'); // 'Name'

// 复数形式
i18n.t('items', { count: 0 }); // 'No items'
i18n.t('items', { count: 1 }); // '1 item'
i18n.t('items', { count: 10 }); // '10 items'
```

#### changeLocale()

切换当前语言。

```typescript
changeLocale(locale: string): Promise<void>
```

**参数**：

- `locale`: 新语言代码

**返回值**：Promise（如果需要懒加载，等待加载完成）

**示例**：

```typescript
// 同步切换（语言包已加载）
i18n.changeLocale('zh');

// 异步切换（需要加载语言包）
await i18n.changeLocale('fr');
```

#### subscribe()

订阅语言变化。

```typescript
subscribe(listener: () => void): () => void
```

**参数**：

- `listener`: 监听器函数（语言变化时调用）

**返回值**：取消订阅函数

**示例**：

```typescript
// 订阅
const unsubscribe = i18n.subscribe(() => {
  console.log('Language changed to:', i18n.locale);
});

// 取消订阅
unsubscribe();
```

**在 Fukict 组件中使用**：

```typescript
class App extends Fukict {
  private unsubscribe?: () => void;

  mounted() {
    this.unsubscribe = i18n.subscribe(() => {
      this.update();
    });
  }

  beforeUnmount() {
    this.unsubscribe?.();
  }
}
```

#### getMessages()

获取当前语言的所有消息。

```typescript
getMessages(): Messages[keyof Messages]
```

**返回值**：当前语言的翻译消息对象

**示例**：

```typescript
const messages = i18n.getMessages();
console.log(messages); // { hello: 'Hello', welcome: 'Welcome, {name}' }
```

#### getAvailableLocales()

获取支持的语言列表。

```typescript
getAvailableLocales(): string[]
```

**返回值**：语言代码数组

**示例**：

```typescript
const locales = i18n.getAvailableLocales();
console.log(locales); // ['en', 'zh', 'fr']
```

#### addMessages()

添加新的语言包（用于懒加载）。

```typescript
addMessages(locale: string, messages: Messages[keyof Messages]): void
```

**参数**：

- `locale`: 语言代码
- `messages`: 翻译消息对象

**示例**：

```typescript
// 手动添加新语言
i18n.addMessages('fr', {
  hello: 'Bonjour',
  welcome: 'Bienvenue, {name}',
});

// 通常在 loadMessages 中自动调用
```

#### n()

格式化数字。

```typescript
n(value: number, options?: Intl.NumberFormatOptions): string
```

**参数**：

- `value`: 数字值
- `options`: Intl.NumberFormat 选项（可选）

**返回值**：格式化后的字符串

**示例**：

```typescript
// 基本格式化
i18n.n(1234.56); // '1,234.56' (en) / '1,234.56' (zh)

// 货币格式化
i18n.n(1234.56, { style: 'currency', currency: 'USD' }); // '$1,234.56'

// 百分比
i18n.n(0.25, { style: 'percent' }); // '25%'
```

#### d()

格式化日期。

```typescript
d(value: Date | number, options?: Intl.DateTimeFormatOptions): string
```

**参数**：

- `value`: 日期对象或时间戳
- `options`: Intl.DateTimeFormat 选项（可选）

**返回值**：格式化后的字符串

**示例**：

```typescript
// 基本格式化
i18n.d(new Date()); // '1/15/2025' (en) / '2025/1/15' (zh)

// 长日期格式
i18n.d(new Date(), { dateStyle: 'long' }); // 'January 15, 2025'

// 自定义格式
i18n.d(new Date(), {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}); // 'January 15, 2025'
```

#### rt()

格式化相对时间。

```typescript
rt(value: number, unit: Intl.RelativeTimeFormatUnit): string
```

**参数**：

- `value`: 时间值
- `unit`: 时间单位（'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year'）

**返回值**：格式化后的字符串

**示例**：

```typescript
i18n.rt(-1, 'day'); // 'yesterday' (en) / '昨天' (zh)
i18n.rt(2, 'hour'); // 'in 2 hours' (en) / '2 小时后' (zh)
i18n.rt(-30, 'minute'); // '30 minutes ago'
```

## 类型定义

### TranslationKey<Messages>

从消息对象提取翻译键类型。

```typescript
type TranslationKey<Messages> =
  Messages extends Record<string, infer Msg> ? KeyPath<Msg> : never;
```

**示例**：

```typescript
const messages = {
  en: {
    user: {
      name: 'Name',
      email: 'Email',
    },
    common: {
      save: 'Save',
    },
  },
};

// 自动推导为：'user.name' | 'user.email' | 'common.save'
type Keys = TranslationKey<typeof messages>;
```

### KeyPath<T>

递归提取嵌套对象的键路径。

```typescript
type KeyPath<T, Prefix extends string = ''> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends string
        ? Prefix extends ''
          ? K
          : `${Prefix}.${K}`
        : KeyPath<T[K], Prefix extends '' ? K : `${Prefix}.${K}`>;
    }[keyof T & string]
  : never;
```

## 完整使用示例

```typescript
import { Fukict, h } from '@fukict/basic';
import { createI18n } from '@fukict/i18n';

// 1. 创建 i18n 实例
const i18n = createI18n({
  defaultLocale: 'en',
  locale: 'en',
  messages: {
    en: {
      app: {
        title: 'My App',
      },
      user: {
        welcome: 'Welcome, {name}!',
        items: {
          zero: 'No items',
          one: '{count} item',
          other: '{count} items',
        },
      },
      common: {
        save: 'Save',
        cancel: 'Cancel',
      },
    },
    zh: {
      app: {
        title: '我的应用',
      },
      user: {
        welcome: '欢迎，{name}！',
        items: {
          zero: '没有项目',
          one: '{count} 个项目',
          other: '{count} 个项目',
        },
      },
      common: {
        save: '保存',
        cancel: '取消',
      },
    },
  },
  fallbackLocale: 'en',
});

// 2. 在组件中使用
class App extends Fukict {
  private unsubscribe?: () => void;

  mounted() {
    this.unsubscribe = i18n.subscribe(() => {
      this.update();
    });
  }

  beforeUnmount() {
    this.unsubscribe?.();
  }

  render() {
    return h('div', null, [
      // 基本翻译
      h('h1', null, i18n.t('app.title')),

      // 变量插值
      h('p', null, i18n.t('user.welcome', { name: 'Alice' })),

      // 复数形式
      h('p', null, i18n.t('user.items', { count: 10 })),

      // 数字格式化
      h('p', null, i18n.n(1234.56, { style: 'currency', currency: 'USD' })),

      // 日期格式化
      h('p', null, i18n.d(new Date(), { dateStyle: 'long' })),

      // 切换语言按钮
      h(
        'button',
        {
          'on:click': () => i18n.changeLocale('zh'),
        },
        'Switch to Chinese',
      ),
    ]);
  }
}
```

## 相关文档

- [设计文档](./DESIGN.md)
- [与 Fukict 集成](./fukict-integration.md)
- [翻译资源结构](./message-structure.md)
- [类型系统](./type-system.md)
- [使用示例](./EXAMPLES.md)
