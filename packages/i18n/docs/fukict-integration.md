# 与 Fukict 集成

本文档说明如何在 Fukict 组件中使用 i18n，以及订阅模式的最佳实践。

## Fukict 更新机制分析

Fukict 的更新机制是：

1. **组件级更新**：调用 `this.update()` 触发当前组件重新渲染
2. **自上而下传播**：父组件更新会触发所有子组件的 diff 和重新渲染
3. **脱围机制**：使用 `fukict:detach` 的组件不受父组件更新影响
4. **手动触发**：组件需要显式调用 `update()`，不会自动追踪依赖

## 订阅模式

### 模式 1：根组件订阅（推荐）

在根组件或布局组件订阅，子组件直接读取翻译。

```typescript
import { Fukict, h } from '@fukict/basic';

import { i18n } from './i18n';

class App extends Fukict {
  private unsubscribe?: () => void;

  mounted() {
    // 在根组件订阅 i18n
    this.unsubscribe = i18n.subscribe(() => {
      // 语言切换时，触发整个应用更新
      this.update();
    });
  }

  beforeUnmount() {
    // 组件卸载时取消订阅
    this.unsubscribe?.();
  }

  render() {
    return h('div', null, [
      // 子组件直接使用 t()，不需要订阅
      h('h1', null, i18n.t('app.title')),
      h(Header, null),
      h(Content, null),
    ]);
  }
}
```

**优点**：

- ✅ 一次订阅，全局生效
- ✅ 避免重复订阅
- ✅ 性能最优

**适用场景**：

- 大部分应用场景
- 语言切换影响整个应用的情况

### 模式 2：脱围组件独立订阅

使用 `fukict:detach` 的组件需要自己订阅 i18n。

```typescript
class LanguageSelector extends Fukict {
  private unsubscribe?: () => void;

  mounted() {
    // 脱围组件自己订阅 i18n
    this.unsubscribe = i18n.subscribe(() => {
      this.update();
    });
  }

  beforeUnmount() {
    this.unsubscribe?.();
  }

  handleChange(locale: string) {
    i18n.changeLocale(locale);
  }

  render() {
    const currentLocale = i18n.locale;

    return h(
      'select',
      {
        value: currentLocale,
        'on:change': (e: Event) => {
          this.handleChange((e.target as HTMLSelectElement).value);
        },
      },
      [
        h('option', { value: 'en' }, 'English'),
        h('option', { value: 'zh' }, '中文'),
      ],
    );
  }
}

// 父组件使用时添加 fukict:detach
h(LanguageSelector, { 'fukict:detach': true });
```

**优点**：

- ✅ 组件独立更新，不依赖父组件
- ✅ 适合持久化组件（Header/Footer）

**适用场景**：

- 语言选择器组件
- 独立的对话框/弹窗
- 性能敏感的组件

### 模式 3：使用 Mixin（可选）

为组件添加自动订阅和 `t` 方法。

```typescript
/**
 * i18n Mixin（为组件添加 t 方法和自动订阅）
 */
function withI18n<T extends typeof Fukict>(Base: T) {
  return class extends Base {
    protected t = i18n.t.bind(i18n);
    private unsubscribeI18n?: () => void;

    mounted() {
      super.mounted?.();
      this.unsubscribeI18n = i18n.subscribe(() => {
        this.update();
      });
    }

    beforeUnmount() {
      super.beforeUnmount?.();
      this.unsubscribeI18n?.();
    }
  };
}

// 使用
class MyComponent extends withI18n(Fukict) {
  render() {
    return h('div', null, this.t('hello'));
  }
}
```

**注意**：这种模式会让每个组件都订阅，可能导致性能问题。只在必要时使用。

## 订阅位置决策树

```
需要订阅 i18n？
├─ 是全局语言切换？
│  ├─ 是 → 在根组件/布局组件订阅
│  └─ 否 → 继续判断
│
├─ 是否使用 fukict:detach？
│  ├─ 是 → 组件自己订阅
│  └─ 否 → 依赖父组件的订阅，只读取翻译
│
└─ 是否需要独立更新？
   ├─ 是 → 使用 fukict:detach + 自行订阅
   └─ 否 → 直接读取 i18n.t()，不订阅
```

## 反模式：避免重复订阅

**❌ 不推荐**：父子组件都订阅

```typescript
class App extends Fukict {
  mounted() {
    this.unsubscribe = i18n.subscribe(() => this.update()); // ❌
  }
}

class UserProfile extends Fukict {
  mounted() {
    this.unsubscribe = i18n.subscribe(() => this.update()); // ❌
  }
}

class UserAvatar extends Fukict {
  mounted() {
    this.unsubscribe = i18n.subscribe(() => this.update()); // ❌
  }
}
```

**问题**：

- 语言切换时，三个组件都触发 update
- App update 会导致 UserProfile 和 UserAvatar 重新渲染
- UserProfile update 会导致 UserAvatar 重新渲染
- UserAvatar update 自己再次渲染
- **同一次语言切换，导致多次重复渲染**

**✅ 改进方案**：只在 App 订阅

```typescript
class App extends Fukict {
  mounted() {
    this.unsubscribe = i18n.subscribe(() => this.update()); // ✅
  }
}

class UserProfile extends Fukict {
  // 不订阅，只读取翻译
  render() {
    return h('div', null, i18n.t('user.profile'));
  }
}

class UserAvatar extends Fukict {
  // 不订阅，只读取翻译
  render() {
    return h('img', { src: i18n.t('user.avatar') });
  }
}
```

## 性能考虑

### 为什么不使用细粒度订阅？

不像 Vue 的响应式系统自动追踪依赖，Fukict 是手动触发更新的：

- ❌ **反模式**：每个使用 `t()` 的组件都订阅 → 一次语言切换触发 N 次更新
- ✅ **正确做法**：只在根组件订阅 → 一次语言切换触发 1 次更新

这与 Flux 的最佳实践完全一致。

### 订阅位置对比

| 订阅位置 | 更新次数 | 性能 | 适用场景   |
| -------- | -------- | ---- | ---------- |
| 根组件   | 1 次     | 最优 | 大部分场景 |
| 每个组件 | N 次     | 最差 | ❌ 不推荐  |
| 脱围组件 | 独立     | 良好 | 独立模块   |

## 完整示例

```typescript
import { Fukict, h } from '@fukict/basic';
import { createI18n } from '@fukict/i18n';

// 创建 i18n 实例
const i18n = createI18n({
  defaultLocale: 'en',
  messages: {
    en: {
      app: {
        title: 'My App',
      },
      user: {
        profile: 'Profile',
      },
    },
    zh: {
      app: {
        title: '我的应用',
      },
      user: {
        profile: '个人资料',
      },
    },
  },
});

// 根组件
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
      h('h1', null, i18n.t('app.title')),
      h(LanguageSelector, { 'fukict:detach': true }),
      h(UserProfile, null),
    ]);
  }
}

// 脱围组件：语言选择器
class LanguageSelector extends Fukict {
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
    return h(
      'select',
      {
        value: i18n.locale,
        'on:change': (e: Event) => {
          i18n.changeLocale((e.target as HTMLSelectElement).value);
        },
      },
      [
        h('option', { value: 'en' }, 'English'),
        h('option', { value: 'zh' }, '中文'),
      ],
    );
  }
}

// 普通子组件：只读取翻译
class UserProfile extends Fukict {
  render() {
    return h('div', null, i18n.t('user.profile'));
  }
}
```

## 相关文档

- [API 文档](./API.md)
- [使用示例](./EXAMPLES.md)
- [设计文档](./DESIGN.md)
