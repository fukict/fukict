import { RouteWidget } from '@fukict/router';
import { ExampleLayout, DemoCard, CodeBlock } from '../../components/ExampleLayout';

export default class extends RouteWidget {
  render() {
    return (
      <ExampleLayout
        title="02. 动态路由"
        description="路由参数和查询字符串"
      >
        <DemoCard title="💡 示例说明">
          <p class="text-gray-600">
            动态路由允许在 URL 中传递参数，支持路径参数和查询参数。
          </p>
        </DemoCard>

        <CodeBlock
          title="📝 定义动态路由"
          code={`const routes = [
  {
    path: '/user/:id',
    component: UserDetail,
  },
  {
    path: '/post/:category/:slug',
    component: PostDetail,
  },
];`}
        />

        <CodeBlock
          title="📝 在组件中访问路由参数"
          code={`export default class UserDetail extends RouteWidget {
  render() {
    // 访问路径参数
    const userId = this.route.params.id;

    // 访问查询参数 (如 /user/123?tab=posts)
    const tab = this.route.query.tab || 'profile';

    return (
      <div>
        <h1>用户 ID: {userId}</h1>
        <p>当前标签: {tab}</p>
      </div>
    );
  }
}`}
        />

        <CodeBlock
          title="📝 编程式导航"
          code={`// 使用路径参数导航
this.route.push({ path: '/user/123' });

// 使用命名路由 + 参数
this.route.push({
  name: 'user',
  params: { id: '123' },
  query: { tab: 'posts' },
});`}
        />
      </ExampleLayout>
    );
  }
}
