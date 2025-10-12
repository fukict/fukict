# fukict:ref 管理机制

## 核心原理

Router 使用 `fukict:ref` 字符串引用来管理路由组件实例的生命周期：

1. **RouterView** 渲染组件时添加 `fukict:ref={matched.path}`
2. **RouterView** 将 refs 管理器注册到 Router
3. **Router** 通过 refs 获取组件实例
4. **Router** 对比前后实例，决定是触发重新渲染还是手动 update

## 使用 path 作为 ref 名称

**为什么使用 path？**

- **唯一性**：每个路由配置的 path 在当前层级是唯一的
- **层级隔离**：父子路由在不同 depth，使用不同的 Router 实例和 refs 管理器
- **避免冲突**：无需拼接上级 path，层级关系天然避免冲突

**示例**：

```typescript
// 顶层路由 (depth=0)
const routes = [
  { path: '/', component: HomePage },              // ref="/"
  { path: '/users/:id', component: UserPage },     // ref="/users/:id"
];

// 嵌套路由 (depth=1, 独立的 refs 管理器)
{
  path: '/dashboard',
  component: DashboardLayout,
  children: [
    { path: '/stats', component: StatsPage },      // ref="/stats"
    { path: '/settings', component: SettingsPage }, // ref="/settings"
  ],
}
```

**关键点**：

- 所有 path 都以 "/" 开头（包括子路由）
- 顶层和嵌套路由使用不同的 Router 实例
- 每个 Router 有自己的 refs 管理器
- path 在当前层级唯一即可

## RouterView 注册 refs

```typescript
class RouterView extends Fukict<RouterViewProps> {
  mounted(): void {
    // 将 this.refs 传递给 Router
    this.props.router.registerRefsManager(this.refs);
  }

  beforeUnmount(): void {
    this.props.router.unregisterRefsManager();
  }

  render(): VNode {
    const matched = this.props.router.matched;

    if (!matched || !matched.component) {
      return this.props.fallback || <div class="router-view"></div>;
    }

    const RouteComp = matched.component;
    const childRouter = this.getRouterForChild(matched);

    return (
      <div class="router-view">
        <RouteComp
          fukict:detach={true}
          fukict:ref={matched.path}  {/* 使用 path 作为 ref 名称 */}
          router={childRouter}
        />
      </div>
    );
  }
}
```

**说明**：

- `this.refs` 是 Fukict 基类提供的 refs 管理器（`Map<string, { current: any }>`）
- `fukict:ref={matched.path}` 使用路由配置的 path
- Router 通过 `registerRefsManager()` 获取访问权

## Router 管理实例生命周期

```typescript
class Router {
  private refsManager: Map<string, { current: any }> | null = null;
  private currentInstance: RouteComponent | null = null;
  private currentComponentClass: RouteComponentClass | null = null;

  /**
   * 注册 refs 管理器（由 RouterView 调用）
   */
  registerRefsManager(refs: Map<string, { current: any }>): void {
    this.refsManager = refs;

    // 订阅路由变化
    this.subscribe(() => {
      this.handleRouteChange();
    });

    // 初始化当前路由
    this.handleRouteChange();
  }

  /**
   * 取消注册
   */
  unregisterRefsManager(): void {
    this.refsManager = null;
    this.currentInstance = null;
    this.currentComponentClass = null;
  }

  /**
   * 获取当前组件实例（通过 refs）
   */
  private getInstance(): RouteComponent | null {
    if (!this.refsManager) {
      return null;
    }

    const matched = this.matched;
    if (!matched) {
      return null;
    }

    // 通过 path 获取实例
    const ref = this.refsManager.get(matched.path);
    return ref?.current || null;
  }

  /**
   * 处理路由变化
   */
  private handleRouteChange(): void {
    const matched = this.matched;

    if (!matched || !matched.component) {
      // 没有匹配的路由，通知 RouterView 重新渲染
      this.currentComponentClass = null;
      this.currentInstance = null;
      this.notify();
      return;
    }

    const newComponentClass = matched.component;
    const prevComponentClass = this.currentComponentClass;

    // 检查组件类是否变化
    if (prevComponentClass !== newComponentClass) {
      // 不同组件类，触发 RouterView 重新渲染
      this.currentComponentClass = newComponentClass;
      this.currentInstance = null;
      this.notify(); // 通知 RouterView

      // 在下一个 tick 更新实例引用
      Promise.resolve().then(() => {
        this.currentInstance = this.getInstance();
      });
    } else {
      // 同一个组件类，手动调用 update
      const instance = this.getInstance();

      if (instance) {
        // 获取子路由（如果有）
        const childRouter = this.getChildRouter(matched);

        // 调用组件的 update 方法
        instance.update({
          router: childRouter || this,
        });

        this.currentInstance = instance;
      }
    }
  }

  /**
   * 获取子路由（如果有嵌套路由）
   */
  private getChildRouter(matched: RouteConfig): Router | null {
    // 由 RouterView 创建并管理子路由
    // 这里只负责判断是否需要子路由
    return null; // RouterView 会处理
  }
}
```

## 生命周期触发时机

### 场景 1：路由组件类变化（/home → /users）

```
1. Router.handleRouteChange() 检测到 componentClass 变化
   ↓
2. Router.notify() 通知 RouterView
   ↓
3. RouterView.update() 重新渲染
   ↓
4. RouterView.render() 生成新 VNode（UserComponent）
   ↓
5. basic 的 diff 检测到组件类变化
   ↓
6. 自动调用 HomeComponent.beforeUnmount()
   ↓
7. 卸载旧组件，挂载新组件
   ↓
8. 自动调用 UserComponent.mounted()
   ↓
9. basic 更新 refs（设置 ref.current = UserComponent 实例）
   ↓
10. Router 在下一个 tick 更新 currentInstance 引用
```

**结论**：diff 自动处理生命周期，Router 只需触发 RouterView 重新渲染。

### 场景 2：同一组件，参数变化（/users/1 → /users/2）

```
1. Router.handleRouteChange() 检测到 componentClass 相同
   ↓
2. Router.getInstance() 通过 refs 获取实例
   ↓
3. Router 调用 instance.update({ router })
   ↓
4. RouteComponent.update() 重写方法被调用
   ↓
5. super.update() 触发 diff
   ↓
6. diff 更新 DOM
   ↓
7. 触发 routeParamsChanged() 钩子（如果参数变化）
```

**结论**：Router 手动调用 `instance.update()`，组件内部触发 diff。

## 关键设计点

1. **字符串 ref**：`fukict:ref={matched.path}`，不是回调函数
2. **refs 管理器注册**：RouterView 将 `this.refs` 传递给 Router
3. **path 作为 ref 名称**：利用层级关系避免冲突
4. **Router 对比组件类**：
   - 不同组件 → 触发重新渲染（diff 自动处理生命周期）
   - 同一组件 → 手动调用 `instance.update()`
5. **Promise.resolve().then()**：在组件挂载完成后更新实例引用

---

**文档状态**：设计阶段
**最后更新**：2025-01-08
