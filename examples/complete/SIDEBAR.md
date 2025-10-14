# Sidebar 二级导航设计

## 设计原则

1. **二级结构**:

   - 第一级: 分组标题 (可展开/折叠)
   - 第二级: 具体页面链接

2. **无 emoji**: 所有标题和内容都不使用 emoji

3. **简洁清晰**: 只显示必要信息,不添加多余字段

## 侧边栏结构

```
首页

开始
  ├─ 快速开始
  └─ 安装配置

基础 (@fukict/basic)
  ├─ 组件
  │   ├─ 函数组件 (defineFukict)
  │   ├─ 类组件 (Fukict)
  │   ├─ 生命周期
  │   └─ 组件组合
  ├─ JSX 语法
  │   ├─ 基础语法
  │   ├─ 表达式插值
  │   ├─ 条件渲染
  │   └─ 列表渲染
  ├─ 事件处理 (on:)
  │   ├─ 原生事件
  │   ├─ 事件对象
  │   ├─ 事件委托
  │   └─ 自定义事件
  ├─ Refs (fukict:ref)
  │   ├─ DOM Refs
  │   ├─ Component Refs
  │   └─ fukict:detach
  ├─ Slots (插槽)
  │   ├─ 默认插槽
  │   ├─ 具名插槽
  │   └─ 插槽作用域
  ├─ Fragment (片段)
  │   ├─ Fragment 使用
  │   └─ 列表 Fragment
  ├─ Context (上下文)
  │   ├─ Context 上下文
  │   └─ 父子遍历
  ├─ SVG 支持
  │   ├─ SVG 渲染
  │   └─ 动态 SVG
  ├─ 样式绑定
  │   ├─ Class 绑定
  │   ├─ Style 绑定
  │   └─ 动态样式
  └─ 属性绑定
      ├─ 原生属性
      ├─ Boolean 属性
      └─ Data 属性

路由 (@fukict/router)
  ├─ 路由配置
  ├─ 导航组件
  ├─ 路由对象
  ├─ 编程式导航
  ├─ 导航守卫
  ├─ 路由模式
  └─ 高级特性

状态管理 (@fukict/flux)
  ├─ Store 基础
  ├─ Actions & Mutations
  ├─ 订阅机制
  └─ 实战示例

国际化 (@fukict/i18n)
  ├─ 基础配置
  ├─ 翻译使用
  ├─ 语言切换
  ├─ 组件集成
  └─ 实战示例

综合示例
  ├─ 完整应用
  ├─ 设计模式
  └─ 性能优化

工具链
  ├─ Vite 插件
  ├─ Babel 预设
  ├─ TypeScript 配置
  └─ 开发调试 (暂未实现)
```

## 数据结构

### SidebarGroup 接口

```typescript
interface SidebarGroup {
  title: string; // 分组标题,如 "基础 (@fukict/basic)"
  items: SidebarItem[]; // 该分组下的页面列表
}
```

### SidebarItem 接口

```typescript
interface SidebarItem {
  path: string; // 路由路径,如 "/basic/components/function"
  title: string; // 显示标题,如 "函数组件 (defineFukict)"
  children?: SidebarItem[]; // 三级嵌套(可选)
}
```

## 交互行为

1. **展开/折叠**:

   - 点击分组标题切换展开/折叠状态
   - 默认展开所有分组
   - 使用向下箭头图标表示展开状态

2. **激活状态**:

   - 当前路由对应的菜单项高亮显示
   - 使用蓝色背景 + 深色文字表示激活状态

3. **悬停效果**:
   - 鼠标悬停时显示浅灰色背景

## 路由配置对应关系

- 路由配置中的 `meta.title` 对应侧边栏显示文本
- 路由的 `children` 对应侧边栏的二级/三级菜单
- 使用 `meta.showInSidebar` 控制是否在侧边栏显示

## 注意事项

1. **不使用的字段**:

   - ❌ icon (不使用 emoji 或图标)
   - ❌ description (不显示描述文本)
   - ❌ isGroupTitle (通过 children 判断)
   - ❌ status (状态标记放在页面内容中,不在侧边栏显示)

2. **简化原则**:

   - 只保留必要的 title, path, children
   - 分组通过 children 是否存在判断
   - 激活状态通过路由匹配判断

3. **命名规范**:
   - 分组标题包含包名,如 "基础 (@fukict/basic)"
   - 页面标题简洁明了,如 "函数组件 (defineFukict)"
