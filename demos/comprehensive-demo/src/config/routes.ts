/**
 * 路由定义
 * 使用嵌套路由结构，完全符合 @fukict/router 的 RouteDefinitions 规范
 */
import { defineRoutes } from '@fukict/router';
import { Home } from '../pages/Home';
import RuntimeExamples from '../pages/RuntimeExamples';
import WidgetClassExamples from '../pages/WidgetClassExamples';
import WidgetFunctionExamples from '../pages/WidgetFunctionExamples';
import StateExamples from '../pages/StateExamples';
import RouterExamples from '../pages/RouterExamples';
import ComprehensiveExamples from '../pages/ComprehensiveExamples';

// Runtime 示例
import Runtime01HelloWorld from '../examples/runtime/01-hello-world';
import Runtime02VnodeRendering from '../examples/runtime/02-vnode-rendering';
import Runtime03PropsEvents from '../examples/runtime/03-props-events';
import Runtime04ConditionalRendering from '../examples/runtime/04-conditional-rendering';
import Runtime05ListRendering from '../examples/runtime/05-list-rendering';
import Runtime06RefUsage from '../examples/runtime/06-ref-usage';

// Widget 类组件示例
import WidgetClass01Basic from '../examples/widget-class/01-basic';
import WidgetClass02Props from '../examples/widget-class/02-props';
import WidgetClass03Lifecycle from '../examples/widget-class/03-lifecycle';
import WidgetClass04DomQuery from '../examples/widget-class/04-dom-query';
import WidgetClass05ManualUpdate from '../examples/widget-class/05-manual-update';

// Widget 函数组件示例
import WidgetFunction01Basic from '../examples/widget-function/01-basic';
import WidgetFunction02PropsUpdate from '../examples/widget-function/02-props-update';
import WidgetFunction03Composition from '../examples/widget-function/03-composition';

// State 示例
import State01Basic from '../examples/state/01-basic';
import State02Subscribe from '../examples/state/02-subscribe';
import State03Batch from '../examples/state/03-batch';
import State04Selector from '../examples/state/04-selector';
import State05Persist from '../examples/state/05-persist';
import State06Middleware from '../examples/state/06-middleware';
import State07WidgetIntegration from '../examples/state/07-widget-integration';
import State08Global from '../examples/state/08-global';

// Router 示例
import Router01Basic from '../examples/router/01-basic';
import Router02Dynamic from '../examples/router/02-dynamic';
import Router03Navigation from '../examples/router/03-navigation';
import Router04Guards from '../examples/router/04-guards';

// 综合示例
import Comprehensive01TodoMVC from '../examples/comprehensive/01-todo-mvc';
import Comprehensive02ShoppingCart from '../examples/comprehensive/02-shopping-cart';
import Comprehensive03Chart from '../examples/comprehensive/03-chart';
import Comprehensive04Form from '../examples/comprehensive/04-form';
import Comprehensive05Search from '../examples/comprehensive/05-search';

export const routes = defineRoutes({
  home: {
    path: '/',
    component: Home,
  },

  runtime: {
    path: '/runtime',
    component: RuntimeExamples,
    children: {
      'hello-world': {
        path: '/runtime/hello-world',
        component: Runtime01HelloWorld,
      },
      'vnode-rendering': {
        path: '/runtime/vnode-rendering',
        component: Runtime02VnodeRendering,
      },
      'props-events': {
        path: '/runtime/props-events',
        component: Runtime03PropsEvents,
      },
      'conditional-rendering': {
        path: '/runtime/conditional-rendering',
        component: Runtime04ConditionalRendering,
      },
      'list-rendering': {
        path: '/runtime/list-rendering',
        component: Runtime05ListRendering,
      },
      'ref-usage': {
        path: '/runtime/ref-usage',
        component: Runtime06RefUsage,
      },
    },
  },

  'widget-class': {
    path: '/widget-class',
    component: WidgetClassExamples,
    children: {
      basic: {
        path: '/widget-class/basic',
        component: WidgetClass01Basic,
      },
      props: {
        path: '/widget-class/props',
        component: WidgetClass02Props,
      },
      lifecycle: {
        path: '/widget-class/lifecycle',
        component: WidgetClass03Lifecycle,
      },
      'dom-query': {
        path: '/widget-class/dom-query',
        component: WidgetClass04DomQuery,
      },
      'manual-update': {
        path: '/widget-class/manual-update',
        component: WidgetClass05ManualUpdate,
      },
    },
  },

  'widget-function': {
    path: '/widget-function',
    component: WidgetFunctionExamples,
    children: {
      basic: {
        path: '/widget-function/basic',
        component: WidgetFunction01Basic,
      },
      'props-update': {
        path: '/widget-function/props-update',
        component: WidgetFunction02PropsUpdate,
      },
      composition: {
        path: '/widget-function/composition',
        component: WidgetFunction03Composition,
      },
    },
  },

  state: {
    path: '/state',
    component: StateExamples,
    children: {
      basic: {
        path: '/state/basic',
        component: State01Basic,
      },
      subscribe: {
        path: '/state/subscribe',
        component: State02Subscribe,
      },
      batch: {
        path: '/state/batch',
        component: State03Batch,
      },
      selector: {
        path: '/state/selector',
        component: State04Selector,
      },
      persist: {
        path: '/state/persist',
        component: State05Persist,
      },
      middleware: {
        path: '/state/middleware',
        component: State06Middleware,
      },
      'widget-integration': {
        path: '/state/widget-integration',
        component: State07WidgetIntegration,
      },
      global: {
        path: '/state/global',
        component: State08Global,
      },
    },
  },

  router: {
    path: '/router',
    component: RouterExamples,
    children: {
      basic: {
        path: '/router/basic',
        component: Router01Basic,
      },
      dynamic: {
        path: '/router/dynamic',
        component: Router02Dynamic,
      },
      navigation: {
        path: '/router/navigation',
        component: Router03Navigation,
      },
      guards: {
        path: '/router/guards',
        component: Router04Guards,
      },
    },
  },

  comprehensive: {
    path: '/comprehensive',
    component: ComprehensiveExamples,
    children: {
      'todo-mvc': {
        path: '/comprehensive/todo-mvc',
        component: Comprehensive01TodoMVC,
      },
      'shopping-cart': {
        path: '/comprehensive/shopping-cart',
        component: Comprehensive02ShoppingCart,
      },
      chart: {
        path: '/comprehensive/chart',
        component: Comprehensive03Chart,
      },
      form: {
        path: '/comprehensive/form',
        component: Comprehensive04Form,
      },
      search: {
        path: '/comprehensive/search',
        component: Comprehensive05Search,
      },
    },
  },
});
