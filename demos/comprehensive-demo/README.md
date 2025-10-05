# Fukict Comprehensive Demo

完整的 Fukict 生态系统示例集合，展示所有包的用法和最佳实践。

## 特性

- ✅ **31+ 个示例** - 覆盖所有 Fukict 包的功能
- 🎨 **Tailwind CSS 4** - 现代化的 UI 设计
- 📦 **侧边栏导航** - 所有示例统一管理
- 🚀 **热更新** - Vite 驱动的快速开发体验
- 📝 **详细文档** - 每个示例都有说明和代码

## 示例分类

### 1. Runtime 基础 (6个示例)
- Hello World
- VNode 渲染
- 属性和事件
- 条件渲染
- 列表渲染
- Ref 引用

### 2. Widget 类组件 (5个示例)
- 基础类组件
- Props 传递
- 生命周期
- DOM 查询
- 手动更新

### 3. Widget 函数组件 (3个示例)
- 基础函数组件
- Props 变更更新
- 组件组合

### 4. State 状态管理 (8个示例)
- 基础用法
- 订阅变更
- 批量更新
- 派生选择器
- 持久化
- 中间件
- Widget 集成
- 全局状态

### 5. Router 路由 (4个示例)
- 基础路由
- 动态路由
- 编程导航
- 路由守卫

### 6. 综合实战 (5个示例)
- TodoMVC
- 购物车
- 数据可视化
- 表单验证
- 实时搜索

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build
```

## 技术栈

- **@fukict/runtime** - VNode 渲染引擎
- **@fukict/widget** - 组件编码范式
- **@fukict/state** - 状态管理
- **@fukict/router** - 路由系统
- **Vite 6** - 构建工具
- **Tailwind CSS 4** - 样式框架
- **TypeScript 5** - 类型系统

## 项目结构

```
comprehensive-demo/
├── src/
│   ├── config/
│   │   └── examples.ts          # 示例配置
│   ├── layouts/
│   │   ├── Sidebar.tsx          # 侧边栏组件
│   │   └── MainLayout.tsx       # 主布局
│   ├── components/
│   │   └── ExampleLayout.tsx    # 示例页面布局
│   ├── examples/                # 所有示例代码
│   │   ├── runtime/             # Runtime 示例
│   │   ├── widget-class/        # Widget 类组件示例
│   │   ├── widget-function/     # Widget 函数组件示例
│   │   ├── state/               # State 示例
│   │   ├── router/              # Router 示例
│   │   └── comprehensive/       # 综合示例
│   ├── pages/
│   │   └── Home.tsx             # 首页
│   ├── styles/
│   │   └── index.css            # 全局样式
│   └── main.tsx                 # 入口文件
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 学习路径

建议按以下顺序学习示例：

1. **Runtime 基础** - 了解 VNode 渲染的基本原理
2. **Widget 组件** - 掌握组件的两种编码范式
3. **State 状态管理** - 学习状态管理的最佳实践
4. **Router 路由** - 理解路由系统的使用
5. **综合实战** - 通过完整示例巩固所学

## 注意事项

- 所有示例都是独立的，可以单独查看
- 示例代码注重实用性和可读性
- 建议配合源码注释学习

## License

MIT
