# Fukict 基类重构方案

> 解决 Fukict 基类命名混乱问题，统一属性命名规范。

## 1. 问题概述

当前 VNode 和 Fukict 实例混用 `__<>__` 格式，职责不清：

```typescript
// VNode 属性
vnode.__type__, vnode.__dom__, vnode.__instance__;

// Fukict 实例属性（混乱）
instance.__id__, instance.__name__; // 应该用 $
instance.__vnode__, instance.__wrapper__; // 应该用 _
instance.$slots, instance.$refs; // ✓ 正确
```

## 2. 命名规范

| 前缀     | 用途               | 示例                                 |
| -------- | ------------------ | ------------------------------------ |
| `__<>__` | VNode 内部属性     | `__type__`, `__node__`, `__render__` |
| `$<>`    | 实例用户可访问属性 | `$id`, `$name`, `$slots`, `$refs`    |
| `_<>`    | 实例框架内部属性   | `_render`, `_parent`, `_container`   |

## 3. 实例属性重命名

| 当前                | 重构后       | 说明                   |
| ------------------- | ------------ | ---------------------- |
| `__id__`            | `$id`        | 组件 ID（用户可读）    |
| `__name__`          | `$name`      | 组件名（用户可读）     |
| `__vnode__`         | `_render`    | render() 结果          |
| `__wrapper__`       | `_parent`    | 父组件实例             |
| `__container__`     | `_container` | DOM 容器               |
| `__placeholder__`   | 删除         | 冗余（只赋值从未读取） |
| `__inUpdating__` 等 | `_phase`     | 生命周期状态           |
| `$slots`            | `$slots`     | 保持                   |
| `$refs`             | `$refs`      | 保持                   |

## 4. VNode 属性重命名

| 当前              | 重构后         | 说明            |
| ----------------- | -------------- | --------------- |
| `__type__`        | `__type__`     | 保持            |
| `__dom__`         | `__node__`     | 统一位置标记    |
| `__placeholder__` | `__node__`     | 合并到 **node** |
| `__rendered__`    | `__render__`   | render 结果     |
| `__instance__`    | `__instance__` | 保持            |
| `__context__`     | `__context__`  | 保持            |

## 5. 重构后 Fukict 类

```typescript
abstract class Fukict<P, S> {
  // === 用户可访问 ($) ===
  readonly $id: number;
  readonly $name: string;
  readonly $slots: S;
  readonly $refs: Refs;
  protected props: P;

  // === 框架内部 (_) ===
  _render: VNode | null;
  _parent: Fukict | null;
  _container: Element | null;
  _phase: 'idle' | 'mounting' | 'updating' | 'unmounting';

  // === 方法 ===
  abstract render(): VNode | null;
  update(newProps?: P): void;
  mount(container: Element, placeholder?: Comment): void;
  unmount(): void;

  // === Context ===
  protected provideContext<T>(key: symbol, value: T): void;
  protected getContext<T>(key: symbol, defaultValue?: T): T | undefined;
}
```

## 6. `instance.__placeholder__` 删除依据

源码分析：

| 位置            | 操作                                         |
| --------------- | -------------------------------------------- |
| `fukict.ts:162` | `this.__placeholder__ = null`（初始化）      |
| `fukict.ts:367` | `this.__placeholder__ = placeholder`（赋值） |
| —               | **无任何读取**                               |

所有 placeholder 读取都在 VNode 上：

- `mount.ts:94` — `childVNode.__placeholder__`
- `diff/helpers.ts:54, 212` — `classVNode.__placeholder__`

**结论**：`instance.__placeholder__` 冗余，可安全删除。

## 7. 生命周期状态简化

当前用三个布尔值：

```typescript
__inUpdating__: boolean;
__inMounting__: boolean;
__inUnmounting__: boolean;
```

重构为单一状态：

```typescript
_phase: 'idle' | 'mounting' | 'updating' | 'unmounting';
```

## 8. 迁移策略

### Phase 1: 添加别名

```typescript
class Fukict {
  get $id() {
    return this.__id__;
  }
  get $name() {
    return this.__name__;
  }
  get _render() {
    return this.__vnode__;
  }
}
```

### Phase 2: 标记废弃

```typescript
/** @deprecated Use $id instead */
readonly __id__: number;
```

### Phase 3: 移除旧属性

下一个大版本移除。

---

**相关文档**: [vnode-structure-refactor.md](./vnode-structure-refactor.md) | [vnode-structure.md](./vnode-structure.md)
