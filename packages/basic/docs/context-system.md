# Context System

## Philosophy

**Pure, Side-effect-free Context**

- No global state or global stack
- Context stored on VNode tree (`__context__`)
- Instance-based, no external side effects
- Proxy-based immutability
- Lower-level contexts override parent contexts
- **Class Component only** - Only components with update capability can provide context

## Architecture

### Data Structure

```typescript
// On each VNode
interface VNode {
  // ... existing properties
  __context__?: {
    [key: symbol | string]: any; // Proxy-wrapped context values
    __parent__?: VNode['__context__']; // Link to parent context
  };
}
```

### Context Flow

```
┌─────────────────┐
│   Root VNode    │ __context__: { [THEME_CONTEXT]: proxy({mode: 'light'}) }
│   <App />       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Child VNode    │ __context__: { __parent__: ↑ }
│  <Layout />     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Leaf VNode     │ __context__: { [THEME_CONTEXT]: proxy({mode: 'dark'}), __parent__: ↑ }
│  <Button />     │ (Overrides parent context - higher priority)
└─────────────────┘
```

## API

### Symbol-based Context Keys

Instead of using `createContext()`, define Symbol keys directly:

```typescript
// contexts.ts - Pure Symbol definitions (no global state)
export const THEME_CONTEXT = Symbol('theme');
export const USER_CONTEXT = Symbol('user');

// Type definitions
export interface ThemeContext {
  mode: 'light' | 'dark';
  primaryColor: string;
}

export interface UserContext {
  name: string;
  role: 'admin' | 'editor' | 'viewer';
}
```

**Why Symbol?**

- No global state - Symbol is just a unique identifier
- No naming collisions - guaranteed uniqueness
- Type-safe - pair with TypeScript interfaces
- No external side effects -符合设计初衷

### provideContext (Fukict method)

Provide context value at current component level:

```typescript
protected provideContext<T>(key: string | symbol, value: T): void;
```

**Usage**:

```typescript
import { Fukict } from '@fukict/basic';

import { THEME_CONTEXT, ThemeContext } from './contexts';

class App extends Fukict {
  state = { darkMode: false };

  mounted() {
    this.provideContext<ThemeContext>(THEME_CONTEXT, {
      mode: 'dark',
      primaryColor: '#000',
    });
  }

  toggleTheme = () => {
    this.state.darkMode = !this.state.darkMode;
    this.provideContext<ThemeContext>(THEME_CONTEXT, {
      mode: this.state.darkMode ? 'dark' : 'light',
      primaryColor: this.state.darkMode ? '#6c757d' : '#007bff',
    });
    this.update(this.props);
  };
}
```

### getContext (Fukict method)

Get context value from current or parent contexts:

```typescript
protected getContext<T>(key: string | symbol, defaultValue?: T): T | undefined;
```

**Usage**:

```typescript
import { Fukict } from '@fukict/basic';
import { THEME_CONTEXT, ThemeContext, USER_CONTEXT, UserContext } from './contexts';

class Button extends Fukict {
  render() {
    // Get theme context with default value
    const theme = this.getContext<ThemeContext>(THEME_CONTEXT, {
      mode: 'light',
      primaryColor: '#007bff',
    });

    const user = this.getContext<UserContext>(USER_CONTEXT, {
      name: 'Guest',
      role: 'viewer',
    });

    return (
      <button
        style={`background: ${theme.primaryColor}; color: ${theme.mode === 'dark' ? '#fff' : '#000'}`}
        disabled={user.role === 'viewer'}
      >
        Click me
      </button>
    );
  }
}
```

## Priority System

Lower-level contexts have **higher priority** and override parent contexts:

```typescript
// Root level
class App extends Fukict {
  mounted() {
    this.provideContext(THEME_CONTEXT, { mode: 'light' });
  }
  render() {
    return <Layout />;
  }
}

// Child level - overrides parent
class Layout extends Fukict {
  mounted() {
    this.provideContext(THEME_CONTEXT, { mode: 'dark' }); // Higher priority
  }
  render() {
    return <Button />;
  }
}

// Button will get { mode: 'dark' }
```

## Immutability with Proxy

Context values are wrapped in Proxy to prevent mutation:

```typescript
function createImmutableProxy<T>(value: T): T {
  if (typeof value !== 'object' || value === null) {
    return value;
  }

  return new Proxy(value, {
    set() {
      console.warn('[Fukict] Context values are immutable');
      return false; // 阻止修改，但不触发更新
    },
    deleteProperty() {
      console.warn('[Fukict] Context values are immutable');
      return false;
    },
    get(target, prop) {
      const result = Reflect.get(target, prop);
      // Deep proxy for nested objects
      if (typeof result === 'object' && result !== null) {
        return createImmutableProxy(result);
      }
      return result;
    },
  });
}
```

**Important**: Proxy **只用于防止修改，不参与更新机制**。

### Context 更新流程

Context 更新遵循显式的自顶向下流程：

```typescript
class App extends Fukict {
  state = { darkMode: false };

  mounted() {
    // 1. 初始化 context
    this.provideContext(THEME_CONTEXT, { mode: 'light' });
  }

  toggleTheme = () => {
    // 2. 更新状态
    this.state.darkMode = !this.state.darkMode;

    // 3. 更新 context（替换 __context__ 中的值）
    this.provideContext(THEME_CONTEXT, {
      mode: this.state.darkMode ? 'dark' : 'light',
    });

    // 4. 调用 update 触发重新渲染
    // - App 组件 re-render
    // - 子组件通过 diff 更新
    // - 子组件 render 时通过 getContext 获取新值
    this.update(this.props);
  };
}
```

**Key Points:**

1. **Context 存储在 VNode** - `vnode.__context__[key]` 存储 Proxy 包装的值
2. **更新需要显式调用** - `provideContext()` 替换值 + `update()` 触发渲染
3. **自顶向下传播** - 父组件更新 → 子组件 diff → 子组件 render → getContext 获取新值
4. **Proxy 保护单向流** - 防止子组件修改 context，确保数据流清晰

**Behavior**:

```typescript
class Child extends Fukict {
  mounted() {
    const theme = this.getContext<ThemeContext>(THEME_CONTEXT);

    // ❌ This will fail with warning
    theme.mode = 'light';

    // ❌ Deep mutation also prevented
    theme.nested.value = 123;

    // ✅ Read-only access works
    console.log(theme.mode); // 'dark'
  }
}
```

## Implementation Details

### Context Chain Lookup

```typescript
protected getContext<T>(key: string | symbol, defaultValue?: T): T | undefined {
  if (!this.__vnode__) {
    return defaultValue;
  }

  let currentContext = this.__vnode__.__context__;

  // Traverse up the chain (lower levels checked first)
  while (currentContext) {
    if (key in currentContext) {
      return currentContext[key] as T;
    }
    currentContext = currentContext.__parent__;
  }

  // Return default if not found
  return defaultValue;
}
```

### Context Provision

```typescript
protected provideContext<T>(key: string | symbol, value: T): void {
  if (!this.__vnode__) {
    console.warn('[Fukict] Cannot provide context: __vnode__ is null');
    return;
  }

  // Initialize context if not exists
  if (!this.__vnode__.__context__) {
    this.__vnode__.__context__ = {
      __parent__: getParentContext(this.__vnode__),
    };
  }

  // Wrap in Proxy and store
  this.__vnode__.__context__[key] = createImmutableProxy(value);
}
```

## Design Decisions

### Why No createContext()?

**Problem**: `createContext()` creates external state:

```typescript
// ❌ This creates global state (violates design principle)
const ThemeContext = createContext({ mode: 'light' });
```

**Solution**: Use Symbol keys directly:

```typescript
// ✅ Symbol is just an identifier, no state
export const THEME_CONTEXT = Symbol('theme');
```

### Why Class Component Only?

Only Class Components have:

1. **Update capability** - Can call `this.update()` to re-render
2. **Lifecycle hooks** - Can use `mounted()` to provide context
3. **Instance reference** - Have `this.__vnode__` to store context

Function components cannot:

- Update themselves (parent-driven only)
- Provide context (no lifecycle, no update mechanism)

### Why Symbol Keys?

- **Collision-free**: Guaranteed unique context identifiers
- **No global state**: Symbol is just an identifier, not a container
- **Type-safe**: Context type bound to Symbol via TypeScript
- **Privacy**: Cannot be accidentally accessed without import

## Usage Patterns

### Theme Context

```typescript
//contexts.ts
export const THEME_CONTEXT = Symbol('theme');

export interface ThemeContext {
  mode: 'light' | 'dark';
  primaryColor: string;
}

// App.tsx
class App extends Fukict {
  state = { darkMode: false };

  toggleTheme = () => {
    this.state.darkMode = !this.state.darkMode;
    this.provideContext<ThemeContext>(THEME_CONTEXT, {
      mode: this.state.darkMode ? 'dark' : 'light',
      primaryColor: this.state.darkMode ? '#6c757d' : '#007bff',
    });
    this.update(this.props);
  };

  mounted() {
    this.provideContext<ThemeContext>(THEME_CONTEXT, {
      mode: 'light',
      primaryColor: '#007bff',
    });
  }

  render() {
    return (
      <div>
        <button on:click={this.toggleTheme}>Toggle Theme</button>
        <ThemedButton />
      </div>
    );
  }
}

class ThemedButton extends Fukict {
  render() {
    const theme = this.getContext<ThemeContext>(THEME_CONTEXT, {
      mode: 'light',
      primaryColor: '#007bff',
    });

    return (
      <button style={`background: ${theme.primaryColor}; color: ${theme.mode === 'dark' ? '#fff' : '#000'}`}>
        Themed Button
      </button>
    );
  }
}
```

### User Context

```typescript
// contexts.ts
export const USER_CONTEXT = Symbol('user');

export interface UserContext {
  name: string;
  role: 'admin' | 'editor' | 'viewer';
}

// App.tsx
class App extends Fukict {
  mounted() {
    // Provide user context from auth
    this.provideContext<UserContext>(USER_CONTEXT, {
      name: 'John Doe',
      role: 'admin',
    });
  }
}

class UserProfile extends Fukict {
  render() {
    const user = this.getContext<UserContext>(USER_CONTEXT, {
      name: 'Guest',
      role: 'viewer',
    });

    return (
      <div>
        <p>Name: {user.name}</p>
        <p>Role: {user.role}</p>
        {user.role === 'admin' && <AdminPanel />}
      </div>
    );
  }
}
```

### Multiple Contexts

```typescript
class App extends Fukict {
  mounted() {
    // Provide multiple contexts
    this.provideContext<ThemeContext>(THEME_CONTEXT, { mode: 'dark' });
    this.provideContext<UserContext>(USER_CONTEXT, { name: 'Alice', role: 'editor' });
    this.provideContext<I18nContext>(I18N_CONTEXT, { locale: 'en-US' });
  }
}

class ComplexComponent extends Fukict {
  render() {
    // Consume multiple contexts
    const theme = this.getContext<ThemeContext>(THEME_CONTEXT);
    const user = this.getContext<UserContext>(USER_CONTEXT);
    const i18n = this.getContext<I18nContext>(I18N_CONTEXT);

    return <div>...</div>;
  }
}
```

## Performance Considerations

- **Lookup Cost**: O(n) where n is depth from context provider
- **Memory**: Minimal overhead (symbol key + proxy wrapper per context)
- **Immutability**: Proxy has minimal overhead for read operations
- **Update**: Context changes require component re-render

## Comparison with Other Frameworks

| Feature               | Fukict Context     | React Context | Vue Provide/Inject |
| --------------------- | ------------------ | ------------- | ------------------ |
| Global State          | ❌ No (Symbol key) | ✅ Yes        | ❌ No              |
| Immutability          | ✅ Proxy           | ❌ Manual     | ❌ Manual          |
| Priority System       | ✅ Lower wins      | ✅ Lower wins | ✅ Lower wins      |
| Type Safety           | ✅ Full            | ✅ Full       | ⚠️ Partial         |
| Function Components   | ❌ No              | ✅ Hooks      | ✅ inject()        |
| Class Components      | ✅ Yes             | ✅ Context    | ✅ inject          |
| API Style             | ✅ Instance method | ⚠️ HOC/Hook   | ✅ API call        |
| Performance           | High               | Medium        | High               |
| External Side Effects | ❌ None            | ✅ Yes        | ⚠️ Minimal         |

---

**Related**: [Component Design](./component-design.md) | [VNode System](./vnode-system.md)
