# @fukict/i18n 设计文档

## 包职责

i18n 是 Fukict 的国际化库，核心理念是 **类型安全的响应式翻译系统**。

职责定位：

1. **多语言管理**：集中管理应用的多语言文本资源
2. **响应式切换**：语言切换时自动触发 UI 更新
3. **类型安全**：完整的 TypeScript 支持，编译时检查翻译键
4. **格式化支持**：变量插值、复数形式、日期/数字格式化
5. **懒加载**：按需加载语言包，减小初始体积

**非职责**（刻意不做）：

- ❌ 不提供自动翻译功能（需要人工提供翻译）
- ❌ 不提供翻译管理后台（由第三方工具处理）
- ❌ 不强制特定文件格式（支持 JSON/JS/TS）
- ❌ 不内置复杂的日期库（由用户选择 Intl API 或第三方库）

## 核心设计原则

### 1. 基于 Fukict 的订阅更新机制

i18n 本质上是一个特殊的状态管理系统，遵循与 @fukict/flux 相同的设计模式：

```
┌─────────────────────────────────────┐
│          Component Layer            │
│  (订阅语言变化，调用翻译函数)          │
└────────────┬────────────────────────┘
             │ subscribe / t()
             ↓
┌─────────────────────────────────────┐
│           I18n Layer                │
│  (管理当前语言，通知订阅者)            │
└────────────┬────────────────────────┘
             │ changeLocale
             ↓
┌─────────────────────────────────────┐
│        Language Resources           │
│  (静态翻译资源，按需加载)              │
└─────────────────────────────────────┘
```

**关键设计**：

- i18n 维护当前语言状态（`currentLocale`）
- 组件订阅语言变化（`subscribe`）
- 语言切换时，i18n 通知所有订阅者
- 组件收到通知，调用 `this.update()` 触发重新渲染

详见：[与 Fukict 集成](./fukict-integration.md)

### 2. 订阅位置最佳实践

与 Flux 相同，i18n 的订阅位置直接影响性能：

#### 推荐：在根组件订阅

```
App (订阅 i18n) ✅
├── Header (读取翻译，不订阅)
├── Content (读取翻译，不订阅)
└── Footer (读取翻译，不订阅)
```

**原因**：

- 语言切换是全局操作，影响整个应用
- 一次 update 触发，整个树重新渲染，所有翻译自动更新
- 避免多个组件重复订阅

详见：[与 Fukict 集成 - 订阅模式](./fukict-integration.md#订阅模式)

### 3. 类型安全的翻译键

核心设计：从翻译资源自动推导类型

```typescript
// 定义翻译资源
const messages = {
  en: {
    hello: 'Hello',
    welcome: 'Welcome, {name}',
  },
  zh: {
    hello: '你好',
    welcome: '欢迎，{name}',
  },
};

// 自动推导翻译键类型
type TranslationKeys = 'hello' | 'welcome';

// 使用时有类型提示和检查
i18n.t('hello'); // ✅ 正确
i18n.t('invalid.key'); // ❌ TypeScript 错误
```

详见：[类型系统](./type-system.md)

### 4. 最小化 API

只提供核心能力：

- **翻译文本**：`t(key, params?)` - 获取翻译文本
- **当前语言**：`locale` - 获取当前语言
- **切换语言**：`changeLocale(locale)` - 切换语言
- **订阅变化**：`subscribe()` - 订阅语言变化

详见：[API 文档](./API.md)

## 文档索引

- [API 文档](./API.md) - 完整的 API 参考
- [与 Fukict 集成](./fukict-integration.md) - 如何在 Fukict 组件中使用
- [翻译资源结构](./message-structure.md) - 翻译资源的组织方式
- [类型系统](./type-system.md) - TypeScript 类型安全
- [懒加载](./lazy-loading.md) - 按需加载语言包
- [格式化](./formatting.md) - 数字、日期、复数格式化
- [使用示例](./EXAMPLES.md) - 完整的使用示例
- [设计决策](./design-decisions.md) - 设计权衡和决策记录

## 快速开始

```typescript
import { Fukict, h } from '@fukict/basic';
import { createI18n } from '@fukict/i18n';

// 1. 创建 i18n 实例
const i18n = createI18n({
  defaultLocale: 'en',
  messages: {
    en: { hello: 'Hello' },
    zh: { hello: '你好' },
  },
});

// 2. 在根组件订阅
class App extends Fukict {
  mounted() {
    this.unsubscribe = i18n.subscribe(() => this.update());
  }

  beforeUnmount() {
    this.unsubscribe?.();
  }

  render() {
    return h('div', null, [
      h('h1', null, i18n.t('hello')),
      h(
        'button',
        {
          'on:click': () => i18n.changeLocale('zh'),
        },
        'Switch Language',
      ),
    ]);
  }
}
```

更多示例请参考：[使用示例](./EXAMPLES.md)

## 体积目标

- **核心功能**: < 2KB gzipped
- **包含格式化**: < 3KB gzipped

## 与其他方案对比

| 特性     | @fukict/i18n | vue-i18n | react-i18next   |
| -------- | ------------ | -------- | --------------- |
| 更新机制 | 手动订阅     | 自动追踪 | Context + Hooks |
| 体积     | < 3KB        | ~10KB    | ~15KB           |
| 类型安全 | ✅ 完整支持  | ✅ 支持  | ⚠️ 部分支持     |
| 懒加载   | ✅ 内置      | ✅ 内置  | ✅ 内置         |
| 学习成本 | 低           | 中       | 中              |

详见：[设计决策 - 对比分析](./design-decisions.md#与其他方案对比)

---

**文档状态**：设计阶段
**最后更新**：2025-01-15
