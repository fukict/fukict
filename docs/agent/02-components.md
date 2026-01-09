# 组件开发

## 类组件

```tsx
import { Fukict } from '@fukict/basic';

interface Props {
  title: string;
  count?: number;
}

class Counter extends Fukict<Props> {
  count = this.props.count || 0;

  render() {
    return (
      <div>
        <h1>{this.props.title}</h1>
        <p>Count: {this.count}</p>
        <button on:click={() => this.increment()}>+1</button>
      </div>
    );
  }

  increment() {
    this.count++;
    this.update();
  }
}
```

## 函数组件

**适用场景**：简单 UI 渲染，仅从 props 获取参数进行渲染，无复杂交互逻辑。

```tsx
// 简单 UI 组件
const HelloWorld = () => {
  return (
    <div>
      <p>Hello World from Function Component!</p>
    </div>
  );
};

// 带参数的函数组件
const Greeting = (props: { name: string }) => {
  return <div>Hello, {props.name}!</div>;
};

// 使用
class App extends Fukict {
  render() {
    return (
      <div>
        <HelloWorld />
        <Greeting name="Alice" />
      </div>
    );
  }
}
```

**限制**：函数组件没有生命周期、没有 ref、无法使用脱围等高级特性。需要这些功能时使用类组件。

## 生命周期

```tsx
class Lifecycle extends Fukict {
  mounted() {
    console.log('mounted');
  }

  updated(prevProps) {
    console.log('updated');
  }

  beforeUnmount() {
    console.log('beforeUnmount');
  }
}
```

## Ref

```tsx
class Parent extends Fukict {
  mounted() {
    const child = this.$refs.child as Child;
    child.doSomething();
  }

  render() {
    return <Child fukict:ref="child" />;
  }
}
```

## 事件处理

```tsx
class Button extends Fukict {
  handleClick(e: MouseEvent) {
    console.log('Clicked!');
  }

  render() {
    return (
      <button on:click={(e: MouseEvent) => this.handleClick(e)}>Click</button>
    );
  }
}
```

## Context

```tsx
const THEME_KEY = Symbol('theme');

class Provider extends Fukict {
  mounted() {
    this.provideContext(THEME_KEY, { mode: 'dark' });
  }

  render() {
    return this.$slots.default;
  }
}

class Consumer extends Fukict {
  render() {
    const theme = this.getContext(THEME_KEY, { mode: 'light' });
    return <div>{theme.mode}</div>;
  }
}
```
