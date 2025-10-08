/**
 * 示例配置
 * 定义所有示例的分类、标题和路由
 */

// 同步导入所有示例组件
import Runtime01HelloWorld from '../examples/runtime/01-hello-world';
import Runtime02VnodeRendering from '../examples/runtime/02-vnode-rendering';
import Runtime03PropsEvents from '../examples/runtime/03-props-events';
import Runtime04ConditionalRendering from '../examples/runtime/04-conditional-rendering';
import Runtime05ListRendering from '../examples/runtime/05-list-rendering';
import Runtime06RefUsage from '../examples/runtime/06-ref-usage';

import WidgetClass01Basic from '../examples/widget-class/01-basic';
import WidgetClass02Props from '../examples/widget-class/02-props';
import WidgetClass03Lifecycle from '../examples/widget-class/03-lifecycle';
import WidgetClass04DomQuery from '../examples/widget-class/04-dom-query';
import WidgetClass05ManualUpdate from '../examples/widget-class/05-manual-update';

import WidgetFunction01Basic from '../examples/widget-function/01-basic';
import WidgetFunction02PropsUpdate from '../examples/widget-function/02-props-update';
import WidgetFunction03Composition from '../examples/widget-function/03-composition';

import State01Basic from '../examples/state/01-basic';
import State02Subscribe from '../examples/state/02-subscribe';
import State03Batch from '../examples/state/03-batch';
import State04Selector from '../examples/state/04-selector';
import State05Persist from '../examples/state/05-persist';
import State06Middleware from '../examples/state/06-middleware';
import State07WidgetIntegration from '../examples/state/07-widget-integration';
import State08Global from '../examples/state/08-global';

import Router01Basic from '../examples/router/01-basic';
import Router02Dynamic from '../examples/router/02-dynamic';
import Router03Navigation from '../examples/router/03-navigation';
import Router04Guards from '../examples/router/04-guards';

import Comprehensive01TodoMVC from '../examples/comprehensive/01-todo-mvc';
import Comprehensive02ShoppingCart from '../examples/comprehensive/02-shopping-cart';
import Comprehensive03Chart from '../examples/comprehensive/03-chart';
import Comprehensive04Form from '../examples/comprehensive/04-form';
import Comprehensive05Search from '../examples/comprehensive/05-search';

export interface Example {
  id: string;
  title: string;
  description: string;
  path: string;
  component: any; // RouteWidget class
}

export interface ExampleCategory {
  id: string;
  title: string;
  icon: string;
  description: string;
  examples: Example[];
}

export const exampleCategories: ExampleCategory[] = [
  {
    id: 'runtime-basics',
    title: 'Runtime 基础',
    icon: '⚡',
    description: 'VNode 渲染引擎的基础用法',
    examples: [
      {
        id: 'hello-world',
        title: '01. Hello World',
        description: '最简单的 VNode 渲染',
        path: '/runtime/hello-world',
        component: Runtime01HelloWorld,
      },
      {
        id: 'vnode-rendering',
        title: '02. VNode 渲染',
        description: '理解 VNode 的结构和渲染',
        path: '/runtime/vnode-rendering',
        component: Runtime02VnodeRendering,
      },
      {
        id: 'props-events',
        title: '03. 属性和事件',
        description: 'DOM 属性和事件处理',
        path: '/runtime/props-events',
        component: Runtime03PropsEvents,
      },
      {
        id: 'conditional-rendering',
        title: '04. 条件渲染',
        description: '条件显示/隐藏元素',
        path: '/runtime/conditional-rendering',
        component: Runtime04ConditionalRendering,
      },
      {
        id: 'list-rendering',
        title: '05. 列表渲染',
        description: '渲染动态列表',
        path: '/runtime/list-rendering',
        component: Runtime05ListRendering,
      },
      {
        id: 'ref-usage',
        title: '06. Ref 引用',
        description: '获取 DOM 元素引用',
        path: '/runtime/ref-usage',
        component: Runtime06RefUsage,
      },
    ],
  },
  {
    id: 'widget-class',
    title: 'Widget 类组件',
    icon: '🎨',
    description: '类组件的定义和使用',
    examples: [
      {
        id: 'basic',
        title: '01. 基础类组件',
        description: '创建第一个类组件',
        path: '/widget-class/basic',
        component: WidgetClass01Basic,
      },
      {
        id: 'props',
        title: '02. Props 传递',
        description: '通过 props 传递数据',
        path: '/widget-class/props',
        component: WidgetClass02Props,
      },
      {
        id: 'lifecycle',
        title: '03. 生命周期',
        description: 'onMounted 和 onUnmounting',
        path: '/widget-class/lifecycle',
        component: WidgetClass03Lifecycle,
      },
      {
        id: 'dom-query',
        title: '04. DOM 查询',
        description: '使用 $ 和 $$ 查询 DOM',
        path: '/widget-class/dom-query',
        component: WidgetClass04DomQuery,
      },
      {
        id: 'manual-update',
        title: '05. 手动更新',
        description: '手动控制重渲染',
        path: '/widget-class/manual-update',
        component: WidgetClass05ManualUpdate,
      },
    ],
  },
  {
    id: 'widget-function',
    title: 'Widget 函数组件',
    icon: '⚙️',
    description: '函数组件的定义和使用',
    examples: [
      {
        id: 'basic',
        title: '01. 基础函数组件',
        description: '使用 defineWidget 创建组件',
        path: '/widget-function/basic',
        component: WidgetFunction01Basic,
      },
      {
        id: 'props-update',
        title: '02. Props 更新',
        description: 'Props 变化时自动更新',
        path: '/widget-function/props-update',
        component: WidgetFunction02PropsUpdate,
      },
      {
        id: 'composition',
        title: '03. 组件组合',
        description: '组合多个函数组件',
        path: '/widget-function/composition',
        component: WidgetFunction03Composition,
      },
    ],
  },
  {
    id: 'state',
    title: 'State 状态管理',
    icon: '🔄',
    description: '响应式状态管理',
    examples: [
      {
        id: 'basic',
        title: '01. 基础用法',
        description: 'createState 创建状态',
        path: '/state/basic',
        component: State01Basic,
      },
      {
        id: 'subscribe',
        title: '02. 订阅变更',
        description: '监听状态变化',
        path: '/state/subscribe',
        component: State02Subscribe,
      },
      {
        id: 'batch',
        title: '03. 批量更新',
        description: '减少订阅通知次数',
        path: '/state/batch',
        component: State03Batch,
      },
      {
        id: 'selector',
        title: '04. 派生选择器',
        description: '创建计算属性',
        path: '/state/selector',
        component: State04Selector,
      },
      {
        id: 'persist',
        title: '05. 持久化',
        description: 'localStorage 自动保存',
        path: '/state/persist',
        component: State05Persist,
      },
      {
        id: 'middleware',
        title: '06. 中间件',
        description: '拦截状态变更',
        path: '/state/middleware',
        component: State06Middleware,
      },
      {
        id: 'widget-integration',
        title: '07. Widget 集成',
        description: 'State 与 Widget 结合',
        path: '/state/widget-integration',
        component: State07WidgetIntegration,
      },
      {
        id: 'global',
        title: '08. 全局状态',
        description: '跨组件共享状态',
        path: '/state/global',
        component: State08Global,
      },
    ],
  },
  {
    id: 'router',
    title: 'Router 路由',
    icon: '🚦',
    description: '路由系统的使用',
    examples: [
      {
        id: 'basic',
        title: '01. 基础路由',
        description: 'Router 基本配置',
        path: '/router/basic',
        component: Router01Basic,
      },
      {
        id: 'dynamic',
        title: '02. 动态路由',
        description: '路由参数和查询',
        path: '/router/dynamic',
        component: Router02Dynamic,
      },
      {
        id: 'navigation',
        title: '03. 编程导航',
        description: 'push/replace/back',
        path: '/router/navigation',
        component: Router03Navigation,
      },
      {
        id: 'guards',
        title: '04. 路由守卫',
        description: '导航拦截和权限',
        path: '/router/guards',
        component: Router04Guards,
      },
    ],
  },
  {
    id: 'comprehensive',
    title: '综合实战',
    icon: '🚀',
    description: '完整应用示例',
    examples: [
      {
        id: 'todo-mvc',
        title: '01. TodoMVC',
        description: '经典 Todo 应用',
        path: '/comprehensive/todo-mvc',
        component: Comprehensive01TodoMVC,
      },
      {
        id: 'shopping-cart',
        title: '02. 购物车',
        description: '电商购物车示例',
        path: '/comprehensive/shopping-cart',
        component: Comprehensive02ShoppingCart,
      },
      {
        id: 'chart',
        title: '03. 数据图表',
        description: '动态数据可视化',
        path: '/comprehensive/chart',
        component: Comprehensive03Chart,
      },
      {
        id: 'form',
        title: '04. 表单验证',
        description: '复杂表单处理',
        path: '/comprehensive/form',
        component: Comprehensive04Form,
      },
      {
        id: 'search',
        title: '05. 搜索过滤',
        description: '实时搜索和过滤',
        path: '/comprehensive/search',
        component: Comprehensive05Search,
      },
    ],
  },
];

// 扁平化所有示例
export const allExamples: Example[] = exampleCategories.flatMap(
  category => category.examples
);
