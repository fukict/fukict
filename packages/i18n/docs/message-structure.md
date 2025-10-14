# 翻译资源结构

本文档说明如何组织和管理翻译资源。

## 基本结构

翻译资源是一个多语言消息对象：

```typescript
const messages = {
  [locale: string]: {
    [key: string]: string | object
  }
}
```

## 嵌套结构（推荐）

使用嵌套对象组织翻译，按模块分组：

```typescript
const messages = {
  en: {
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
    },
    user: {
      profile: 'Profile',
      settings: 'Settings',
      logout: 'Logout',
    },
    errors: {
      notFound: 'Not found',
      serverError: 'Server error',
    },
  },
  zh: {
    common: {
      save: '保存',
      cancel: '取消',
      delete: '删除',
    },
    user: {
      profile: '个人资料',
      settings: '设置',
      logout: '退出',
    },
    errors: {
      notFound: '未找到',
      serverError: '服务器错误',
    },
  },
};

// 使用点号访问
i18n.t('common.save'); // 'Save'
i18n.t('user.profile'); // 'Profile'
i18n.t('errors.notFound'); // 'Not found'
```

**优点**：

- ✅ 结构清晰，易于维护
- ✅ 按模块分组，便于管理
- ✅ 支持深层嵌套

## 扁平化结构

直接使用点号键名：

```typescript
const messages = {
  en: {
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'user.profile': 'Profile',
    'user.settings': 'Settings',
  },
  zh: {
    'common.save': '保存',
    'common.cancel': '取消',
    'user.profile': '个人资料',
    'user.settings': '设置',
  },
};

// 使用方式相同
i18n.t('common.save'); // 'Save'
```

**优点**：

- ✅ 简单直接
- ✅ 适合小型项目
- ✅ 易于导入导出

## 变量插值

使用 `{name}` 语法插入变量：

```typescript
const messages = {
  en: {
    welcome: 'Welcome, {name}!',
    greeting: 'Hello, {firstName} {lastName}',
    info: 'You have {count} new messages',
  },
};

// 使用
i18n.t('welcome', { name: 'Alice' });
// 'Welcome, Alice!'

i18n.t('greeting', { firstName: 'John', lastName: 'Doe' });
// 'Hello, John Doe'

i18n.t('info', { count: 5 });
// 'You have 5 new messages'
```

**注意**：

- 变量名必须是有效的 JavaScript 标识符
- 不支持复杂表达式（只支持简单替换）

## 复数形式

使用嵌套对象定义复数规则：

```typescript
const messages = {
  en: {
    items: {
      zero: 'No items',
      one: '{count} item',
      other: '{count} items',
    },
    apples: {
      zero: 'No apples',
      one: 'One apple',
      other: '{count} apples',
    },
  },
  zh: {
    items: {
      zero: '没有项目',
      one: '{count} 个项目',
      other: '{count} 个项目',
    },
    apples: {
      zero: '没有苹果',
      one: '一个苹果',
      other: '{count} 个苹果',
    },
  },
};

// 使用（自动根据 count 选择形式）
i18n.t('items', { count: 0 }); // 'No items'
i18n.t('items', { count: 1 }); // '1 item'
i18n.t('items', { count: 10 }); // '10 items'
```

**支持的复数类别**：

- `zero`: 0 个
- `one`: 1 个
- `two`: 2 个（某些语言需要）
- `few`: 少数（某些语言需要）
- `many`: 多数（某些语言需要）
- `other`: 其他（默认）

**规则**：

1. 必须至少提供 `other` 形式
2. 根据 `count` 参数自动选择
3. 不同语言的复数规则不同（由 Intl.PluralRules 自动处理）

## 文件组织

### 方式 1：单文件

适合小型项目：

```
src/
  i18n/
    index.ts        # 创建 i18n 实例
    messages.ts     # 所有翻译消息
```

**messages.ts**：

```typescript
export const messages = {
  en: {
    common: { ... },
    user: { ... },
  },
  zh: {
    common: { ... },
    user: { ... },
  },
};
```

### 方式 2：按语言拆分

适合中型项目：

```
src/
  i18n/
    index.ts          # 创建 i18n 实例
    locales/
      en.ts           # 英文翻译
      zh.ts           # 中文翻译
      fr.ts           # 法文翻译
```

**en.ts**：

```typescript
export default {
  common: {
    save: 'Save',
    cancel: 'Cancel',
  },
  user: {
    profile: 'Profile',
  },
};
```

**index.ts**：

```typescript
import en from './locales/en';
import zh from './locales/zh';

export const i18n = createI18n({
  defaultLocale: 'en',
  messages: { en, zh },
});
```

### 方式 3：按模块 + 语言拆分

适合大型项目：

```
src/
  i18n/
    index.ts
    modules/
      common/
        en.ts
        zh.ts
      user/
        en.ts
        zh.ts
      admin/
        en.ts
        zh.ts
```

**common/en.ts**：

```typescript
export default {
  save: 'Save',
  cancel: 'Cancel',
  delete: 'Delete',
};
```

**index.ts**：

```typescript
import commonEn from './modules/common/en';
import commonZh from './modules/common/zh';
import userEn from './modules/user/en';
import userZh from './modules/user/zh';

export const i18n = createI18n({
  defaultLocale: 'en',
  messages: {
    en: {
      common: commonEn,
      user: userEn,
    },
    zh: {
      common: commonZh,
      user: userZh,
    },
  },
});
```

### 方式 4：使用 JSON 文件

适合非技术人员编辑：

```
src/
  i18n/
    index.ts
    locales/
      en.json
      zh.json
      fr.json
```

**en.json**：

```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel"
  },
  "user": {
    "profile": "Profile"
  }
}
```

**index.ts**：

```typescript
import en from './locales/en.json';
import zh from './locales/zh.json';

export const i18n = createI18n({
  defaultLocale: 'en',
  messages: { en, zh },
});
```

## 回退机制

### 多级回退

支持从具体语言回退到基础语言：

```typescript
const messages = {
  en: {
    hello: 'Hello',
    welcome: 'Welcome',
  },
  'en-US': {
    // 只覆盖部分翻译
    welcome: 'Welcome (US)',
  },
  'zh-CN': {
    hello: '你好',
  },
  zh: {
    hello: '你好',
    welcome: '欢迎',
  },
};

// 回退顺序：zh-CN → zh → en → key
i18n.changeLocale('zh-CN');
i18n.t('hello'); // '你好' (来自 zh-CN)
i18n.t('welcome'); // '欢迎' (回退到 zh)
```

### 自定义回退处理

```typescript
const i18n = createI18n({
  defaultLocale: 'en',
  messages: { en, zh },
  fallbackLocale: 'en',

  // 自定义缺失翻译处理
  missingHandler: (key, locale) => {
    console.warn(`Missing translation: ${key} for locale: ${locale}`);
    return `[${key}]`; // 返回带括号的键名
  },
});
```

## 命名约定

### 推荐的命名规范

1. **使用点号分隔**：`module.feature.action`
2. **小写字母 + 驼峰**：`user.profileSettings`
3. **动词 + 名词**：`user.editProfile`, `order.createNew`
4. **避免缩写**：`button.submit` 而非 `btn.sub`

**示例**：

```typescript
const messages = {
  en: {
    // ✅ 好的命名
    user: {
      editProfile: 'Edit Profile',
      changePassword: 'Change Password',
      deleteAccount: 'Delete Account',
    },
    order: {
      createNew: 'Create New Order',
      viewDetails: 'View Details',
      cancelOrder: 'Cancel Order',
    },

    // ❌ 不好的命名
    usr: { ... },              // 避免缩写
    'edit-profile': '...',     // 不要用连字符
    EditProfile: '...',        // 不要用大写开头
  },
};
```

## 最佳实践

### 1. 保持结构一致

所有语言的结构应该相同：

```typescript
// ✅ 正确：结构一致
const messages = {
  en: {
    user: { name: 'Name', email: 'Email' },
  },
  zh: {
    user: { name: '姓名', email: '邮箱' },
  },
};

// ❌ 错误：结构不一致
const messages = {
  en: {
    user: { name: 'Name', email: 'Email' },
  },
  zh: {
    user: { name: '姓名' }, // 缺少 email
    profile: { email: '邮箱' }, // 结构不同
  },
};
```

### 2. 避免硬编码文本

在代码中使用翻译键，而不是直接写文本：

```typescript
// ✅ 正确
render() {
  return h('button', null, i18n.t('common.save'));
}

// ❌ 错误
render() {
  return h('button', null, i18n.locale === 'en' ? 'Save' : '保存');
}
```

### 3. 使用常量管理键名

对于常用的翻译键，使用常量：

```typescript
// keys.ts
export const I18N_KEYS = {
  COMMON: {
    SAVE: 'common.save',
    CANCEL: 'common.cancel',
  },
  USER: {
    PROFILE: 'user.profile',
    SETTINGS: 'user.settings',
  },
} as const;

// 使用
i18n.t(I18N_KEYS.COMMON.SAVE);
```

### 4. 提取重复的翻译

避免重复定义相同的翻译：

```typescript
// ❌ 不好：重复定义
const messages = {
  en: {
    user: {
      save: 'Save',
      cancel: 'Cancel',
    },
    order: {
      save: 'Save',      // 重复
      cancel: 'Cancel',  // 重复
    },
  },
};

// ✅ 好：使用 common 模块
const messages = {
  en: {
    common: {
      save: 'Save',
      cancel: 'Cancel',
    },
    user: { ... },
    order: { ... },
  },
};

// 使用
i18n.t('common.save');  // 在任何地方使用
```

## 相关文档

- [API 文档](./API.md)
- [类型系统](./type-system.md)
- [懒加载](./lazy-loading.md)
- [使用示例](./EXAMPLES.md)
