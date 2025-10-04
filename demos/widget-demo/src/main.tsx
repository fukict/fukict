import { createRouter, defineRoutes } from '@fukict/router';
import { render } from '@fukict/runtime';

import { App } from './App';
import { About } from './pages/About';
import { Demos } from './pages/Demos';
import { Home } from './pages/Home';
import { User } from './pages/User';

// 定义路由
const routes = defineRoutes({
  home: {
    path: '/',
    component: Home,
    meta: { title: '首页' },
  },
  about: {
    path: '/about',
    component: About,
    meta: { title: '关于' },
  },
  demos: {
    path: '/demos',
    component: Demos,
    meta: { title: 'Demo 列表' },
  },
  user: {
    path: '/user/:id',
    component: User,
    meta: { title: '用户详情' },
  },
});

// 创建路由器
const router = createRouter({
  routes,
  mode: 'hash', // 使用 hash 模式
});

// 添加全局前置守卫
router.beforeEach((to, from) => {
  console.log(`[Router] Navigating from ${from.path} to ${to.path}`);

  // 更新页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - Fukict Widget Demo`;
  }

  // 返回 true 表示允许导航
  return true;
});

// 添加全局后置钩子
router.afterEach(to => {
  console.log(`[Router] Navigation complete: ${to.path}`);
  console.log('Route params:', to.params);
  console.log('Route query:', to.query);
});

// 启动路由
router.start();

// 渲染主应用
const container = document.getElementById('app')!;
render(<App router={router} />, { container, replace: true });
