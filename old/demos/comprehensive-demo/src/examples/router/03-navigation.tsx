import { RouteWidget } from '@fukict/router';
import { ExampleLayout, DemoCard, CodeBlock } from '../../components/ExampleLayout';

export default class extends RouteWidget {
  render() {
    return (
      <ExampleLayout
        title="03. 编程式导航"
        description="push/replace/back/forward 方法"
      >
        <DemoCard title="💡 示例说明">
          <p class="text-gray-600">
            除了使用 RouterLink 组件，还可以通过编程方式进行路由导航。
          </p>
        </DemoCard>

        <CodeBlock
          title="📝 基本导航方法"
          code={`// 在 RouteWidget 组件中
export default class MyPage extends RouteWidget {
  goToHome() {
    // push - 跳转到新路由（添加历史记录）
    this.route.push('/');
  }

  goToUser() {
    // replace - 替换当前路由（不添加历史记录）
    this.route.replace('/user/123');
  }

  goBack() {
    // back - 后退一步
    this.route.back();
  }

  goForward() {
    // forward - 前进一步
    this.route.forward();
  }

  goSteps(n: number) {
    // go - 前进/后退 n 步
    this.route.go(n); // n 为正数则前进，负数则后退
  }
}`}
        />

        <CodeBlock
          title="📝 带参数的导航"
          code={`// 使用路径字符串
this.route.push('/user/123?tab=posts#section1');

// 使用对象配置
this.route.push({
  path: '/user/123',
  query: { tab: 'posts' },
  hash: '#section1',
});

// 使用命名路由
this.route.push({
  name: 'user',
  params: { id: '123' },
  query: { tab: 'posts' },
});`}
        />

        <CodeBlock
          title="📝 导航方法返回 Promise"
          code={`// 可以使用 async/await
async handleClick() {
  await this.route.push('/dashboard');
  console.log('导航完成');
}

// 或使用 .then()
this.route.push('/dashboard').then(() => {
  console.log('导航完成');
});`}
        />
      </ExampleLayout>
    );
  }
}
