# @fukict/router 设计文档

## 简介

**@fukict/router** 是 Fukict 框架的路由管理器，提供声明式路由、嵌套路由、懒加载、导航守卫等功能。

## 核心特性

- **基于 fukict:detach**：利用脱围渲染机制实现精确的路由更新控制
- **字符串 ref 管理**：使用 path 作为 ref 名称，Router 管理组件实例生命周期
- **自动深度管理**：Router 内部感知嵌套深度，自动创建子路由
- **完整路由上下文**：RouteComponent 提供当前层级的完整路由信息和工具方法
- **声明式导航**：Link 组件和编程式导航 API

## 包职责

- **路由匹配**：URL 到页面组件的映射
- **导航管理**：编程式导航和声明式导航
- **历史管理**：浏览器 history 操作
- **嵌套路由**：支持多级路由嵌套
- **路由守卫**：导航前后的钩子
- **懒加载**：按需加载路由组件

## 依赖关系

```
@fukict/basic (peer dependency)
    ↑
@fukict/router
```

- router 依赖 basic 的 `Fukict` 基类、`h()` 函数、diff 机制和 refs 管理
- 用户页面组件继承 `RouteComponent` 基类（继承自 `Fukict`）
- 用户需要同时安装 basic 和 router

## 核心概念

### 基于 fukict:detach 的更新机制

路由组件使用 `fukict:detach` 脱离父级 diff 控制，Router 通过 refs 管理组件实例：

1. **RouterView** 渲染路由组件时添加 `fukict:detach` 和 `fukict:ref`
2. **Router** 通过 refs 管理器获取组件实例
3. **路由变化时**：
   - 不同组件 → 触发 RouterView 重新渲染，diff 自动处理生命周期
   - 同一组件 → Router 手动调用 `instance.update()`

### 深度自动管理

- Router 内部知道自己在第几层（`depth`）
- 嵌套路由通过 `router.createChild()` 自动创建 depth+1 的子路由
- 用户无需关心 depth，只需传递 `router` prop

## 文档结构

- **[核心 API](./API.md)**：RouterProvider、Router、RouteComponent、RouterView、Link
- **[ref 管理机制](./REF_MECHANISM.md)**：fukict:ref 字符串引用和实例生命周期管理
- **[嵌套路由机制](./NESTED_ROUTING.md)**：深度管理和子路由创建
- **[使用示例](./EXAMPLES.md)**：基础路由、嵌套路由、懒加载、导航守卫

## 快速开始

```tsx
import { Fukict, attach } from '@fukict/basic';
import { Link, RouteComponent, RouterProvider } from '@fukict/router';

// 1. 定义页面组件
class HomePage extends RouteComponent {
  render() {
    return (
      <div>
        <h1>Home Page</h1>
      </div>
    );
  }
}

class UserPage extends RouteComponent {
  render() {
    return (
      <div>
        <h1>User: {this.params.id}</h1>
        <button on:click={() => this.push('/')}>Go Home</button>
      </div>
    );
  }
}

// 2. 配置路由
const routes = [
  { path: '/', component: HomePage },
  { path: '/users/:id', component: UserPage },
];

// 3. 创建应用
class App extends Fukict {
  render() {
    return (
      <div>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/users/123">User 123</Link>
        </nav>
        <RouterProvider routes={routes} />
      </div>
    );
  }
}

attach(<App />, document.getElementById('app')!);
```

## 设计原则

1. **利用框架机制**：充分利用 fukict:detach 和 refs 管理，无需额外生命周期管理
2. **精确更新控制**：路由页面只在路由变化时更新，避免父组件影响
3. **自动化管理**：深度、ref 名称、子路由创建全部自动化
4. **完整上下文**：RouteComponent 提供当前层级的完整路由信息和工具方法

---

**文档状态**：设计阶段
**最后更新**：2025-01-08
