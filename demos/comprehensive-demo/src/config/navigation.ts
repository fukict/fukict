/**
 * 导航配置
 * 仅包含 UI 层展示信息，路由名称使用点分隔格式（如 'runtime.hello-world'）
 */

export interface NavItem {
  id: string;       // 完整路由名称（如 'runtime.hello-world'）
  title: string;    // 显示标题
}

export interface NavCategory {
  id: string;       // 分类 ID（对应父路由名）
  title: string;    // 分类标题
  items: NavItem[]; // 子路由列表
}

export const navigationConfig: NavCategory[] = [
  {
    id: 'runtime',
    title: 'Runtime 基础',
    items: [
      { id: 'runtime.hello-world', title: '01. Hello World' },
      { id: 'runtime.vnode-rendering', title: '02. VNode 渲染' },
      { id: 'runtime.props-events', title: '03. 属性和事件' },
      { id: 'runtime.conditional-rendering', title: '04. 条件渲染' },
      { id: 'runtime.list-rendering', title: '05. 列表渲染' },
      { id: 'runtime.ref-usage', title: '06. Ref 引用' },
    ],
  },
  {
    id: 'widget-class',
    title: 'Widget 类组件',
    items: [
      { id: 'widget-class.basic', title: '01. 基础类组件' },
      { id: 'widget-class.props', title: '02. Props 传递' },
      { id: 'widget-class.lifecycle', title: '03. 生命周期' },
      { id: 'widget-class.dom-query', title: '04. DOM 查询' },
      { id: 'widget-class.manual-update', title: '05. 手动更新' },
    ],
  },
  {
    id: 'widget-function',
    title: 'Widget 函数组件',
    items: [
      { id: 'widget-function.basic', title: '01. 基础函数组件' },
      { id: 'widget-function.props-update', title: '02. Props 更新' },
      { id: 'widget-function.composition', title: '03. 组件组合' },
    ],
  },
  {
    id: 'state',
    title: 'State 状态管理',
    items: [
      { id: 'state.basic', title: '01. 基础用法' },
      { id: 'state.subscribe', title: '02. 订阅变更' },
      { id: 'state.batch', title: '03. 批量更新' },
      { id: 'state.selector', title: '04. 派生选择器' },
      { id: 'state.persist', title: '05. 持久化' },
      { id: 'state.middleware', title: '06. 中间件' },
      { id: 'state.widget-integration', title: '07. Widget 集成' },
      { id: 'state.global', title: '08. 全局状态' },
    ],
  },
  {
    id: 'router',
    title: 'Router 路由',
    items: [
      { id: 'router.basic', title: '01. 基础路由' },
      { id: 'router.dynamic', title: '02. 动态路由' },
      { id: 'router.navigation', title: '03. 编程导航' },
      { id: 'router.guards', title: '04. 路由守卫' },
    ],
  },
  {
    id: 'comprehensive',
    title: '综合实战',
    items: [
      { id: 'comprehensive.todo-mvc', title: '01. TodoMVC' },
      { id: 'comprehensive.shopping-cart', title: '02. 购物车' },
      { id: 'comprehensive.chart', title: '03. 数据图表' },
      { id: 'comprehensive.form', title: '04. 表单验证' },
      { id: 'comprehensive.search', title: '05. 搜索过滤' },
    ],
  },
];
