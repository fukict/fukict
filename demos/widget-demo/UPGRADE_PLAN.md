# Vanilla DOM 渲染库升级计划

## 当前架构优势
- ✅ 轻量级核心（< 10KB）
- ✅ JSX 语法支持  
- ✅ Widget 组件模式
- ✅ 事件绑定和生命周期
- ✅ TypeScript 完整支持

## 升级路线图

### 阶段1：高效 diff 算法 (v2.0) 🎯
**目标**：实现高性能的 VNode diff 和最小化 DOM 更新

#### 核心功能
```typescript
// 增强的 render 函数
interface RenderOptions {
  container: Element;
  oldVNode?: VNode; // 支持 diff
  key?: string;     // 支持 key 优化
}

// 智能 diff 更新
export function renderWithDiff(
  newVNode: VNode, 
  options: RenderOptions
): void;
```

#### 实现特性
- **Key-based diff**：高效列表更新
- **组件级 diff**：只更新变化的组件
- **Props diff**：精确的属性更新
- **事件优化**：事件代理和自动清理

### 阶段2：状态管理集成 (v2.5)
**目标**：内置响应式状态管理

#### 核心 API
```typescript
// 响应式状态
export function createSignal<T>(initial: T): [() => T, (value: T) => void];
export function createEffect(fn: () => void): void;

// Widget 中使用
class MyWidget extends Widget {
  private [count, setCount] = createSignal(0);
  
  render() {
    return <div on:click={() => setCount(count() + 1)}>
      Count: {count()}
    </div>;
  }
}
```

### 阶段3：服务端渲染 (v3.0)
**目标**：完整的 SSR 支持

#### 功能特性
- **renderToString**：服务端渲染
- **hydrate**：客户端激活
- **同构组件**：服务端/客户端通用

### 阶段4：开发工具 (v3.5)
**目标**：完善的开发体验

#### 开发工具
- **DevTools 扩展**：组件树查看
- **Hot Reload**：开发时热更新
- **性能分析**：渲染性能监控

## 近期实现：增强 Widget 类

### 方案A：内置状态追踪
```typescript
export class Widget<TProps = {}> {
  // 自动追踪状态变化
  protected state<T>(initial: T): [T, (value: T) => void] {
    // 实现响应式状态
  }
  
  // 自动重渲染
  protected autoRender = true;
}
```

### 方案B：手动优化渲染
```typescript
export class TodoListUI extends TodoListDomain {
  private prevTodos?: TodoItem[];
  private prevStats?: TodoListStats;
  
  protected onDataChanged(): void {
    const todos = this.getTodos();
    const stats = this.getStats();
    
    // 只有数据真正变化时才重渲染
    if (!this.isEqual(todos, this.prevTodos)) {
      this.renderTodos();
      this.prevTodos = [...todos];
    }
    
    if (!this.isEqual(stats, this.prevStats)) {
      this.renderStats();  
      this.prevStats = { ...stats };
    }
  }
}
```

## 当前推荐方案

对于当前的 TodoList，我推荐使用 **方案B** 进行手动优化，原因：

1. **渐进式升级**：不破坏现有 API
2. **性能可控**：手动控制更新时机
3. **学习成本低**：基于现有架构
4. **足够高效**：对于中小型应用完全够用

## 实施建议

### 立即可做（本周）
- ✅ 使用 JSX 替代字符串模板
- ✅ 实现基础的状态比较
- ✅ 优化事件绑定

### 短期目标（1个月）
- 🎯 实现 Widget 状态比较工具
- 🎯 添加性能监控
- 🎯 完善错误边界

### 长期目标（3个月）
- 🚀 完整的 diff 算法
- 🚀 响应式状态管理
- 🚀 SSR 支持

这样既保持了当前架构的简洁性，又为未来扩展留下了空间。 