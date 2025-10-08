import { RouteWidget } from '@fukict/router';
import { ExampleLayout, DemoCard, CodeBlock } from '../../components/ExampleLayout';

export default class extends RouteWidget {
  render() {
    return (
      <ExampleLayout
        title="04. 路由守卫"
        description="导航拦截和权限控制"
      >
        <DemoCard title="💡 示例说明">
          <p class="text-gray-600">
            路由守卫允许在导航发生前后执行逻辑，常用于权限验证、登录检查等场景。
          </p>
        </DemoCard>

        <CodeBlock
          title="📝 全局前置守卫"
          code={`import { createRouter } from '@fukict/router';

const router = createRouter({ routes, mode: 'hash' });

// 全局前置守卫 - 在每次导航前执行
router.beforeEach((to, from) => {
  // to: 即将进入的路由
  // from: 当前导航正要离开的路由

  // 权限检查
  if (to.meta.requiresAuth && !isLoggedIn()) {
    // 阻止导航，重定向到登录页
    return { path: '/login', query: { redirect: to.fullPath } };
  }

  // 返回 false 取消导航
  if (to.path === '/forbidden') {
    return false;
  }

  // 返回 undefined 或 true 继续导航
});`}
        />

        <CodeBlock
          title="📝 全局后置钩子"
          code={`// 全局后置钩子 - 在导航完成后执行
router.afterEach((to, from) => {
  // 更新页面标题
  document.title = to.meta.title || 'Fukict App';

  // 发送页面浏览统计
  analytics.track('pageview', { path: to.path });

  // 滚动到顶部
  window.scrollTo(0, 0);
});`}
        />

        <CodeBlock
          title="📝 路由独享守卫"
          code={`const routes = [
  {
    path: '/admin',
    component: AdminPanel,
    // 路由独享守卫
    beforeEnter: (to, from) => {
      if (!hasAdminRole()) {
        alert('需要管理员权限');
        return { path: '/' };
      }
    },
  },
];`}
        />

        <CodeBlock
          title="📝 取消守卫注册"
          code={`// beforeEach 和 afterEach 返回取消注册的函数
const removeGuard = router.beforeEach((to, from) => {
  console.log('Navigation guard');
});

// 不再需要时取消注册
removeGuard();`}
        />
      </ExampleLayout>
    );
  }
}
