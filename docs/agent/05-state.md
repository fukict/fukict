# 关于状态

## Fukict 没有状态概念

Fukict 组件就是普通的 TypeScript 类，实例属性就是普通属性。

```tsx
class Counter extends Fukict {
  // 普通实例属性
  count = 0;

  render() {
    return <div>{this.count}</div>;
  }

  increment() {
    this.count++;
    this.update(); // 手动决定何时更新
  }
}
```

## 与 React 的区别

| React                 | Fukict                    |
| --------------------- | ------------------------- |
| `setState()` 触发更新 | 直接修改属性 + `update()` |
| 状态更新是异步的      | 属性赋值是同步的          |
| 状态合并              | 完全由开发者控制          |
| 有特殊的状态概念      | 没有状态概念              |

## 如何管理状态

**完全由开发者自行决定**：

- 实例属性：组件内部
- Flux：全局共享状态
- Context：跨层级传递
- 其他任何模式...

Fukict 不强制任何状态管理方式。

## 全局状态

对于全局性状态、脱围组件订阅等场景，使用 [@fukict/flux](./08-flux.md)。
