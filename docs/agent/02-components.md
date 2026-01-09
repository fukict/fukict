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

```tsx
import { defineFukict } from '@fukict/basic';

const Hello = defineFukict((props: { message: string }) => {
  return <div>{props.message}</div>;
});
```

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
