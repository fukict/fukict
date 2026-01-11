import { type RouteConfig } from '@fukict/router';

// 导入页面组件
import { HomePage } from './pages/HomePage';
import { LayoutPage } from './pages/LayoutPage';
// Basic 模块
import { AsyncEventHandlerPage } from './pages/basic/AsyncEventHandlerPage';
import { AttributesPage } from './pages/basic/AttributesPage';
import { BasicIndexPage } from './pages/basic/BasicIndexPage';
import { ComponentsPage } from './pages/basic/ComponentsPage';
import { ContextPage } from './pages/basic/ContextPage';
import { EventsPage } from './pages/basic/EventsPage';
import { JSXPage } from './pages/basic/JSXPage';
import { LucideIconsPage } from './pages/basic/LucideIconsPage';
import { RefsPage } from './pages/basic/RefsPage';
import { SlotsPage } from './pages/basic/SlotsPage';
import { StylesPage } from './pages/basic/StylesPage';
import { DynamicListPage } from './pages/basic/dynamic-list';
import { WebComponentPage } from './pages/basic/webcomponent';
import { ActionsMutationsPage } from './pages/flux/ActionsMutationsPage';
import { FluxIndexPage } from './pages/flux/FluxIndexPage';
// Flux 模块
import { FluxModuleIndexPage } from './pages/flux/FluxModuleIndexPage';
import { StoreBasicsPage } from './pages/flux/StoreBasicsPage';
// Getting Started 模块
import { GettingStartedIndexPage } from './pages/getting-started/GettingStartedIndexPage';
import { InstallationPage } from './pages/getting-started/InstallationPage';
import { QuickStartPage } from './pages/getting-started/QuickStartPage';
import { I18nConfigPage } from './pages/i18n/I18nConfigPage';
import { I18nIndexPage } from './pages/i18n/I18nIndexPage';
// I18n 模块
import { I18nModuleIndexPage } from './pages/i18n/I18nModuleIndexPage';
import { TranslationPage } from './pages/i18n/TranslationPage';
import { NavigationPage } from './pages/router/NavigationPage';
import { RouterConfigPage } from './pages/router/RouterConfigPage';
import { RouterIndexPage } from './pages/router/RouterIndexPage';
// Router 模块
import { RouterModuleIndexPage } from './pages/router/RouterModuleIndexPage';
// Router Demo 子页面
import { DemoAboutPage } from './pages/router/demo/DemoAboutPage';
import { DemoDashboardLayout } from './pages/router/demo/DemoDashboardLayout';
import { DemoHomePage } from './pages/router/demo/DemoHomePage';
import { DemoOverviewPage } from './pages/router/demo/DemoOverviewPage';
import { DemoSettingsPage } from './pages/router/demo/DemoSettingsPage';
import { DemoStatsPage } from './pages/router/demo/DemoStatsPage';
import { DemoUserPage } from './pages/router/demo/DemoUserPage';
// Tooling 模块
import { BabelPresetPage } from './pages/tooling/BabelPresetPage';

/**
 * 路由配置
 */
export const routes: RouteConfig[] = [
  {
    path: '/',
    component: LayoutPage,
    redirect: '/home',
    children: [
      // 首页
      {
        path: '/home',
        component: HomePage,
        meta: {
          title: '首页',
          description: '欢迎使用 Fukict - 轻量级、高性能的 DOM 渲染库',
          showInSidebar: true,
        },
      },

      // Getting Started 模块
      {
        path: '/getting-started',
        component: GettingStartedIndexPage,
        meta: {
          title: '开始',
          description: '快速了解 Fukict 框架的安装、配置和基本使用',
          showInSidebar: true,
        },
        redirect: '/getting-started/quick-start',
        children: [
          {
            path: '/quick-start',
            component: QuickStartPage,
            meta: {
              title: '快速开始',
              description: '5 分钟快速上手 Fukict，创建你的第一个组件',
              showInSidebar: true,
            },
          },
          {
            path: '/installation',
            component: InstallationPage,
            meta: {
              title: '安装配置',
              description: '详细的安装步骤和 TypeScript、Babel 配置指南',
              showInSidebar: true,
            },
          },
        ],
      },

      // Basic 模块 - 有子页面
      {
        path: '/basic',
        component: BasicIndexPage,
        meta: {
          title: '基础 (@fukict/basic)',
          description: 'Fukict 核心渲染引擎，提供组件系统、JSX 支持和 DOM 操作',
          showInSidebar: true,
        },
        redirect: '/basic/components',
        children: [
          {
            path: '/components',
            component: ComponentsPage,
            meta: {
              title: '组件',
              description: '学习如何使用类组件和函数组件构建应用',
              showInSidebar: true,
            },
          },
          {
            path: '/jsx',
            component: JSXPage,
            meta: {
              title: 'JSX 语法',
              description: '在 Fukict 中使用 JSX 语法编写组件模板',
              showInSidebar: true,
            },
          },
          {
            path: '/events',
            component: EventsPage,
            meta: {
              title: '事件处理',
              description: '使用 on: 前缀绑定 DOM 事件和自定义事件',
              showInSidebar: true,
            },
          },
          {
            path: '/refs',
            component: RefsPage,
            meta: {
              title: 'Refs',
              description:
                '使用 ref 和 fukict:ref 获取 DOM 元素和组件实例的引用',
              showInSidebar: true,
            },
          },
          {
            path: '/slots',
            component: SlotsPage,
            meta: {
              title: 'Slots',
              description: '通过插槽机制实现组件内容分发和组合',
              showInSidebar: true,
            },
          },
          {
            path: '/context',
            component: ContextPage,
            meta: {
              title: 'Context',
              description: '使用 Context API 在组件树中共享数据',
              showInSidebar: true,
            },
          },
          {
            path: '/styles',
            component: StylesPage,
            meta: {
              title: '样式绑定',
              description: '动态绑定内联样式和 CSS 类名',
              showInSidebar: true,
            },
          },
          {
            path: '/attributes',
            component: AttributesPage,
            meta: {
              title: '属性绑定',
              description: '绑定 HTML 属性和自定义属性到 DOM 元素',
              showInSidebar: true,
            },
          },
          {
            path: '/lucide-icons',
            component: LucideIconsPage,
            meta: {
              title: 'Lucide Icons',
              description: '在 Fukict 中集成和使用 Lucide 图标库',
              showInSidebar: true,
            },
          },
          {
            path: '/async-event-handler',
            component: AsyncEventHandlerPage,
            meta: {
              title: '异步事件处理器',
              description: '在事件处理器中使用异步函数',
              showInSidebar: true,
            },
          },
          {
            path: '/dynamic-list',
            component: DynamicListPage,
            meta: {
              title: '高性能动态列表',
              description: (
                <>
                  <p>通过 fukict:detach 和 fukict:ref 实现高性能列表操作</p>
                  <p>
                    手动实例化 + mount 实现高性能列表操作，避免不必要的重新渲染
                  </p>
                </>
              ),
              showInSidebar: true,
            },
          },
          {
            path: '/webcomponent',
            component: WebComponentPage,
            meta: {
              title: 'Web Component 类型扩展',
              description:
                '展示如何扩展 Fukict JSX 类型以支持自定义 Web Component',
              showInSidebar: true,
            },
          },
        ],
      },

      // Router 模块
      {
        path: '/router',
        component: RouterModuleIndexPage,
        meta: {
          title: '路由 (@fukict/router)',
          description: '基于 @fukict/basic 的单页应用路由系统',
          showInSidebar: true,
        },
        redirect: '/router/config',
        children: [
          {
            path: '/config',
            component: RouterConfigPage,
            meta: {
              title: '路由配置',
              description: '配置路由规则、嵌套路由和路由元信息',
              showInSidebar: true,
            },
          },
          {
            path: '/navigation',
            component: NavigationPage,
            meta: {
              title: '导航组件',
              description: '使用 Link 和 RouterView 组件实现页面导航',
              showInSidebar: true,
            },
          },
          {
            path: '/demo',
            component: RouterIndexPage,
            meta: {
              title: '完整示例',
              description: '一个包含嵌套路由、导航守卫的完整路由示例',
              showInSidebar: true,
            },
            redirect: '/router/demo/home',
            children: [
              {
                path: '/home',
                component: DemoHomePage,
              },
              {
                path: '/about',
                component: DemoAboutPage,
              },
              {
                path: '/user/:id',
                component: DemoUserPage,
              },
              {
                path: '/dashboard',
                component: DemoDashboardLayout,
                redirect: '/router/demo/dashboard/overview',
                children: [
                  {
                    path: '/overview',
                    component: DemoOverviewPage,
                  },
                  {
                    path: '/stats',
                    component: DemoStatsPage,
                  },
                  {
                    path: '/settings',
                    component: DemoSettingsPage,
                  },
                ],
              },
            ],
          },
        ],
      },

      // Flux 模块
      {
        path: '/flux',
        component: FluxModuleIndexPage,
        meta: {
          title: '状态管理 (@fukict/flux)',
          description: '轻量级的集中式状态管理解决方案',
          showInSidebar: true,
        },
        redirect: '/flux/basics',
        children: [
          {
            path: '/basics',
            component: StoreBasicsPage,
            meta: {
              title: 'Store 基础',
              description: '创建 Store、定义 State 和 Getters',
              showInSidebar: true,
            },
          },
          {
            path: '/actions',
            component: ActionsMutationsPage,
            meta: {
              title: 'Actions & Mutations',
              description: '使用 Actions 和 Mutations 修改应用状态',
              showInSidebar: true,
            },
          },
          {
            path: '/demo',
            component: FluxIndexPage,
            meta: {
              title: '完整示例',
              description: '一个包含异步操作的购物车状态管理示例',
              showInSidebar: true,
            },
          },
        ],
      },

      // I18n 模块
      {
        path: '/i18n',
        component: I18nModuleIndexPage,
        meta: {
          title: '国际化 (@fukict/i18n)',
          description: '多语言支持和翻译管理',
          showInSidebar: true,
        },
        redirect: '/i18n/config',
        children: [
          {
            path: '/config',
            component: I18nConfigPage,
            meta: {
              title: '基础配置',
              description: '配置语言包、默认语言和回退语言',
              showInSidebar: true,
            },
          },
          {
            path: '/translation',
            component: TranslationPage,
            meta: {
              title: '翻译使用',
              description: '在组件中使用翻译函数和动态参数',
              showInSidebar: true,
            },
          },
          {
            path: '/demo',
            component: I18nIndexPage,
            meta: {
              title: '完整示例',
              description: '一个支持多语言切换的完整应用示例',
              showInSidebar: true,
            },
          },
        ],
      },

      // 工具链模块
      {
        path: '/tooling',
        component: BabelPresetPage,
        meta: {
          title: '工具链',
          description: '使用 @fukict/babel-preset 编译 JSX 代码',
          showInSidebar: true,
        },
      },
    ],
  },
];

/**
 * 侧边栏数据项
 */
export interface SidebarItem {
  path: string;
  title: string;
  children?: SidebarItem[];
}

/**
 * 从路由配置提取侧边栏数据
 */
function extractSidebarItems(routes: RouteConfig[]): SidebarItem[] {
  const items: SidebarItem[] = [];

  for (const route of routes) {
    if (route.meta?.showInSidebar) {
      const item: SidebarItem = {
        path: route.path,
        title: route.meta.title || '',
      };

      // 如果有子路由,递归提取
      if (route.children && route.children.length > 0) {
        const childItems = extractSidebarItems(route.children);
        if (childItems.length > 0) {
          item.children = childItems;
        }
      }

      items.push(item);
    }
  }

  return items;
}

/**
 * 获取侧边栏数据
 */
export function getSidebarItems(): SidebarItem[] {
  const layoutRoute = routes[0];
  if (layoutRoute.children) {
    return extractSidebarItems(layoutRoute.children);
  }
  return [];
}
